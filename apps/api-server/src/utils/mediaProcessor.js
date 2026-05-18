let sharp, ffmpeg;
try {
  sharp = require('sharp');
} catch (error) {
  console.warn('Sharp module not found. Image processing functionality will be limited.');
  sharp = null;
}

try {
  ffmpeg = require('fluent-ffmpeg');
} catch (error) {
  console.warn('FFmpeg module not found. Video processing functionality will be disabled.');
  ffmpeg = null;
}

const path = require('path');
const fs = require('fs').promises;
const crypto = require('crypto');
const logger = require('@utils/logger');

/**
 * Enhanced Media Processing Pipeline
 * Handles image optimization, format conversion, and responsive variants
 */
class MediaProcessor {
  constructor() {
    // Image processing configurations
    this.IMAGE_VARIANTS = {
      thumbnail: { width: 150, height: 150, quality: 80 },
      small: { width: 400, height: 300, quality: 85 },
      medium: { width: 800, height: 600, quality: 90 },
      large: { width: 1200, height: 900, quality: 95 },
      xlarge: { width: 1920, height: 1440, quality: 95 }
    };

    // Modern format configurations
    this.MODERN_FORMATS = {
      webp: { quality: 85, effort: 4 },
      avif: { quality: 80, effort: 4 }
    };

    // Compression settings
    this.COMPRESSION_SETTINGS = {
      jpeg: { quality: 90, progressive: true, mozjpeg: true },
      png: { compressionLevel: 8, progressive: true },
      gif: { progressive: true }
    };

    // Video processing configurations
    this.VIDEO_VARIANTS = {
      thumbnail: { width: 300, height: 200, seek: '10%' },
      preview: { width: 800, height: 600, duration: 10 },
      compressed: { 
        width: 1280, 
        height: 720, 
        videoBitrate: '1000k',
        audioBitrate: '128k'
      }
    };

    // Supported formats
    this.SUPPORTED_IMAGE_FORMATS = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.avif', '.tiff', '.bmp'];
    this.SUPPORTED_VIDEO_FORMATS = ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm', '.mkv'];
  }

  /**
   * Generate file hash for duplicate detection
   */
  async generateFileHash(buffer) {
    try {
      const hash = crypto.createHash('sha256');
      hash.update(buffer);
      return hash.digest('hex');
    } catch (error) {
      logger.error('Error generating file hash:', error);
      throw error;
    }
  }

  /**
   * Detect file type and validate
   */
  async detectFileType(buffer, originalName) {
    try {
      const ext = path.extname(originalName).toLowerCase();
      
      // Use sharp for image detection
      if (this.SUPPORTED_IMAGE_FORMATS.includes(ext)) {
        if (!sharp) {
          // Fallback detection without sharp
          return {
            type: 'image',
            format: ext.slice(1),
            size: buffer.length
          };
        }
        
        try {
          const metadata = await sharp(buffer).metadata();
          return {
            type: 'image',
            format: metadata.format,
            width: metadata.width,
            height: metadata.height,
            size: metadata.size,
            hasAlpha: metadata.hasAlpha,
            isAnimated: metadata.pages > 1
          };
        } catch {
          // If sharp fails, it's not a valid image
          throw new Error('Invalid image format');
        }
      }

      // For video files
      if (this.SUPPORTED_VIDEO_FORMATS.includes(ext)) {
        return {
          type: 'video',
          format: ext.slice(1),
          size: buffer.length
        };
      }

      throw new Error(`Unsupported file format: ${ext}`);
    } catch (error) {
      logger.error('Error detecting file type:', error);
      throw error;
    }
  }

  /**
   * Process image with multiple variants and formats
   */
  async processImage(buffer, options = {}) {
    try {
      if (!sharp) {
        logger.warn('Sharp not available. Returning original image without processing.');
        return {
          original: buffer,
          variants: {},
          modernFormats: {},
          metadata: {
            width: null,
            height: null,
            format: 'unknown',
            size: buffer.length
          }
        };
      }
      const {
        generateVariants = true,
        generateModernFormats = true,
        optimizeForWeb = true,
        quality = 90,
        preserveMetadata = false
      } = options;

      const results = {
        original: null,
        variants: {},
        modernFormats: {},
        metadata: null
      };

      // Get original metadata
      const metadata = await sharp(buffer).metadata();
      results.metadata = {
        width: metadata.width,
        height: metadata.height,
        format: metadata.format,
        size: metadata.size,
        hasAlpha: metadata.hasAlpha,
        colorSpace: metadata.space,
        density: metadata.density
      };

      // Strip EXIF data for security unless explicitly preserved
      let pipeline = sharp(buffer);
      if (!preserveMetadata) {
        pipeline = pipeline.withMetadata({
          exif: {},
          icc: metadata.icc, // Preserve color profile
          iptc: {},
          xmp: {}
        });
      }

      // Process original with optimization
      if (optimizeForWeb) {
        const originalFormat = metadata.format;
        
        if (originalFormat === 'jpeg') {
          results.original = await pipeline
            .jpeg(this.COMPRESSION_SETTINGS.jpeg)
            .toBuffer();
        } else if (originalFormat === 'png') {
          results.original = await pipeline
            .png(this.COMPRESSION_SETTINGS.png)
            .toBuffer();
        } else if (originalFormat === 'gif') {
          results.original = await pipeline
            .gif(this.COMPRESSION_SETTINGS.gif)
            .toBuffer();
        } else {
          // Convert to JPEG for unsupported formats
          results.original = await pipeline
            .jpeg({ quality, progressive: true })
            .toBuffer();
        }
      } else {
        results.original = buffer;
      }

      // Generate responsive variants
      if (generateVariants) {
        for (const [variantName, config] of Object.entries(this.IMAGE_VARIANTS)) {
          // Skip if original is smaller than variant
          if (metadata.width < config.width || metadata.height < config.height) {
            continue;
          }

          results.variants[variantName] = await sharp(buffer)
            .resize(config.width, config.height, {
              fit: 'inside',
              withoutEnlargement: true
            })
            .jpeg({ quality: config.quality, progressive: true })
            .toBuffer();
        }
      }

      // Generate modern formats (WebP, AVIF)
      if (generateModernFormats) {
        // WebP version
        results.modernFormats.webp = await sharp(buffer)
          .webp(this.MODERN_FORMATS.webp)
          .toBuffer();

        // AVIF version (higher compression)
        try {
          results.modernFormats.avif = await sharp(buffer)
            .avif(this.MODERN_FORMATS.avif)
            .toBuffer();
        } catch (error) {
          logger.warn('AVIF generation failed (may not be supported):', error.message);
        }
      }

      logger.info('Image processed successfully', {
        originalSize: buffer.length,
        processedSize: results.original.length,
        variants: Object.keys(results.variants).length,
        modernFormats: Object.keys(results.modernFormats).length
      });

      return results;
    } catch (error) {
      logger.error('Error processing image:', error);
      throw error;
    }
  }

  /**
   * Process video with compression and thumbnail generation
   */
  async processVideo(inputPath, options = {}) {
    try {
      const {
        generateThumbnail = true,
        generatePreview = true,
        compress = true
      } = options;

      const results = {
        original: inputPath,
        thumbnail: null,
        preview: null,
        compressed: null,
        metadata: null
      };

      // Get video metadata
      results.metadata = await this.getVideoMetadata(inputPath);

      // Generate thumbnail
      if (generateThumbnail) {
        const thumbnailPath = `${inputPath}_thumbnail.jpg`;
        
        await new Promise((resolve, reject) => {
          ffmpeg(inputPath)
            .screenshots({
              count: 1,
              folder: path.dirname(thumbnailPath),
              filename: path.basename(thumbnailPath),
              size: `${this.VIDEO_VARIANTS.thumbnail.width}x${this.VIDEO_VARIANTS.thumbnail.height}`
            })
            .on('end', resolve)
            .on('error', reject);
        });

        results.thumbnail = thumbnailPath;
      }

      // Generate preview clip
      if (generatePreview) {
        const previewPath = `${inputPath}_preview.mp4`;
        
        await new Promise((resolve, reject) => {
          ffmpeg(inputPath)
            .duration(this.VIDEO_VARIANTS.preview.duration)
            .size(`${this.VIDEO_VARIANTS.preview.width}x${this.VIDEO_VARIANTS.preview.height}`)
            .format('mp4')
            .output(previewPath)
            .on('end', resolve)
            .on('error', reject)
            .run();
        });

        results.preview = previewPath;
      }

      // Generate compressed version
      if (compress) {
        const compressedPath = `${inputPath}_compressed.mp4`;
        
        await new Promise((resolve, reject) => {
          ffmpeg(inputPath)
            .size(`${this.VIDEO_VARIANTS.compressed.width}x${this.VIDEO_VARIANTS.compressed.height}`)
            .videoBitrate(this.VIDEO_VARIANTS.compressed.videoBitrate)
            .audioBitrate(this.VIDEO_VARIANTS.compressed.audioBitrate)
            .format('mp4')
            .output(compressedPath)
            .on('end', resolve)
            .on('error', reject)
            .run();
        });

        results.compressed = compressedPath;
      }

      logger.info('Video processed successfully', {
        originalPath: inputPath,
        thumbnail: !!results.thumbnail,
        preview: !!results.preview,
        compressed: !!results.compressed
      });

      return results;
    } catch (error) {
      logger.error('Error processing video:', error);
      throw error;
    }
  }

  /**
   * Get video metadata using ffprobe
   */
  async getVideoMetadata(inputPath) {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(inputPath, (err, metadata) => {
        if (err) {
          reject(err);
        } else {
          const videoStream = metadata.streams.find(s => s.codec_type === 'video');
          const audioStream = metadata.streams.find(s => s.codec_type === 'audio');
          
          resolve({
            duration: metadata.format.duration,
            size: metadata.format.size,
            bitrate: metadata.format.bit_rate,
            video: videoStream ? {
              codec: videoStream.codec_name,
              width: videoStream.width,
              height: videoStream.height,
              fps: eval(videoStream.r_frame_rate),
              bitrate: videoStream.bit_rate
            } : null,
            audio: audioStream ? {
              codec: audioStream.codec_name,
              bitrate: audioStream.bit_rate,
              sampleRate: audioStream.sample_rate,
              channels: audioStream.channels
            } : null
          });
        }
      });
    });
  }

  /**
   * Analyze image quality and suggest optimizations
   */
  async analyzeImageQuality(buffer) {
    try {
      const metadata = await sharp(buffer).metadata();
      const stats = await sharp(buffer).stats();
      
      const analysis = {
        score: 100,
        issues: [],
        suggestions: [],
        metadata: {
          width: metadata.width,
          height: metadata.height,
          format: metadata.format,
          size: metadata.size,
          density: metadata.density
        }
      };

      // Check resolution
      if (metadata.width < 800 || metadata.height < 600) {
        analysis.score -= 20;
        analysis.issues.push('Low resolution');
        analysis.suggestions.push('Consider using higher resolution images for better quality');
      }

      // Check file size efficiency
      const pixelCount = metadata.width * metadata.height;
      const bytesPerPixel = metadata.size / pixelCount;
      
      if (bytesPerPixel > 3 && metadata.format === 'jpeg') {
        analysis.score -= 15;
        analysis.issues.push('Large file size for JPEG');
        analysis.suggestions.push('Consider reducing JPEG quality or converting to WebP');
      }

      if (bytesPerPixel > 6 && metadata.format === 'png') {
        analysis.score -= 15;
        analysis.issues.push('Large file size for PNG');
        analysis.suggestions.push('Consider using JPEG for photos or optimizing PNG compression');
      }

      // Check color depth
      if (metadata.channels === 4 && metadata.format === 'jpeg') {
        analysis.score -= 10;
        analysis.issues.push('JPEG with alpha channel');
        analysis.suggestions.push('Consider using PNG for images with transparency');
      }

      // Check if image is too large for web
      if (metadata.width > 2000 || metadata.height > 2000) {
        analysis.score -= 10;
        analysis.issues.push('Very high resolution');
        analysis.suggestions.push('Consider generating responsive variants for web usage');
      }

      return analysis;
    } catch (error) {
      logger.error('Error analyzing image quality:', error);
      throw error;
    }
  }

  /**
   * Convert image to modern formats
   */
  async convertToModernFormats(buffer, options = {}) {
    try {
      const { quality = 85, formats = ['webp', 'avif'] } = options;
      const results = {};

      for (const format of formats) {
        try {
          if (format === 'webp') {
            results.webp = await sharp(buffer)
              .webp({ quality, effort: 4 })
              .toBuffer();
          } else if (format === 'avif') {
            results.avif = await sharp(buffer)
              .avif({ quality, effort: 4 })
              .toBuffer();
          }
        } catch (error) {
          logger.warn(`Failed to convert to ${format}:`, error.message);
        }
      }

      return results;
    } catch (error) {
      logger.error('Error converting to modern formats:', error);
      throw error;
    }
  }

  /**
   * Optimize existing image without changing dimensions
   */
  async optimizeImage(buffer, options = {}) {
    try {
      const { quality = 90, format = null, stripMetadata = true } = options;
      const metadata = await sharp(buffer).metadata();
      
      let pipeline = sharp(buffer);
      
      if (stripMetadata) {
        pipeline = pipeline.withMetadata({
          exif: {},
          icc: metadata.icc,
          iptc: {},
          xmp: {}
        });
      }

      const targetFormat = format || metadata.format;
      
      switch (targetFormat) {
        case 'jpeg':
          return await pipeline.jpeg({ quality, progressive: true, mozjpeg: true }).toBuffer();
        case 'png':
          return await pipeline.png({ compressionLevel: 8, progressive: true }).toBuffer();
        case 'webp':
          return await pipeline.webp({ quality, effort: 4 }).toBuffer();
        case 'avif':
          return await pipeline.avif({ quality, effort: 4 }).toBuffer();
        default:
          return await pipeline.toBuffer();
      }
    } catch (error) {
      logger.error('Error optimizing image:', error);
      throw error;
    }
  }

  /**
   * Clean up temporary files
   */
  async cleanupTempFiles(filePaths) {
    try {
      for (const filePath of filePaths) {
        try {
          await fs.unlink(filePath);
          logger.debug(`Cleaned up temp file: ${filePath}`);
        } catch (error) {
          // File might not exist, which is fine
          logger.debug(`Could not clean up temp file ${filePath}:`, error.message);
        }
      }
    } catch (error) {
      logger.error('Error cleaning up temp files:', error);
    }
  }
}

// Create singleton instance
const mediaProcessor = new MediaProcessor();

module.exports = mediaProcessor;