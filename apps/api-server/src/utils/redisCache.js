let Redis;
try {
  Redis = require('redis');
} catch (error) {
  console.warn('Redis module not found. Cache functionality will be disabled.');
  Redis = null;
}

const logger = require('@utils/logger');

/**
 * Redis Cache Utility for Gallery Section Management
 * Provides intelligent caching for media, categories, and tags
 */
class RedisCache {
  constructor() {
    this.client = null;
    this.isConnected = false;
    this.retryAttempts = 0;
    this.maxRetryAttempts = 5;
    
    // Cache TTL configurations (in seconds)
    this.TTL_CONFIG = {
      // Short-term cache for frequently changing data
      APPROVED_MEDIA: 300, // 5 minutes - for public gallery listings
      CATEGORIES: 1800, // 30 minutes - categories change less frequently
      TAGS: 1800, // 30 minutes - tags change less frequently
      POPULAR_TAGS: 600, // 10 minutes - popular tags update moderately
      
      // Medium-term cache for analytics and stats
      MEDIA_STATS: 3600, // 1 hour - view counts, popularity metrics
      TAG_STATISTICS: 3600, // 1 hour - tag usage statistics
      FEATURED_MEDIA: 900, // 15 minutes - featured content
      
      // Long-term cache for stable data
      SINGLE_MEDIA: 7200, // 2 hours - individual media items
      CATEGORY_DETAILS: 7200, // 2 hours - category information
      
      // Search and filter results
      SEARCH_RESULTS: 600, // 10 minutes - search query results
      FILTER_RESULTS: 300, // 5 minutes - filtered gallery results
    };
    
    // Cache key prefixes for organized storage
    this.KEY_PREFIXES = {
      GALLERY_MEDIA: 'gallery:media',
      GALLERY_CATEGORIES: 'gallery:categories',
      GALLERY_TAGS: 'gallery:tags',
      GALLERY_SEARCH: 'gallery:search',
      GALLERY_STATS: 'gallery:stats',
      GALLERY_PAGINATION: 'gallery:pagination',
    };
  }

  /**
   * Initialize Redis connection
   */
  async initialize() {
    try {
      if (!Redis) {
        logger.warn('Redis not available. Caching disabled.');
        return;
      }

      const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
      
      this.client = Redis.createClient({
        url: redisUrl,
        retry_strategy: (times) => {
          if (times > this.maxRetryAttempts) {
            logger.error('Redis max retry attempts reached');
            return null;
          }
          return Math.min(times * 50, 2000);
        },
        socket: {
          connectTimeout: 10000,
          commandTimeout: 5000,
        }
      });

      this.client.on('connect', () => {
        logger.info('Redis client connected');
        this.isConnected = true;
        this.retryAttempts = 0;
      });

      this.client.on('error', (err) => {
        logger.error('Redis client error:', err);
        this.isConnected = false;
      });

      this.client.on('end', () => {
        logger.warn('Redis client disconnected');
        this.isConnected = false;
      });

      await this.client.connect();
      
      // Test the connection
      await this.client.ping();
      logger.info('Redis cache initialized successfully');
      
    } catch (error) {
      logger.error('Failed to initialize Redis cache:', error);
      this.isConnected = false;
      // Don't throw error - allow app to continue without cache
    }
  }

  /**
   * Check if Redis is available
   */
  isAvailable() {
    return this.isConnected && this.client;
  }

  /**
   * Generate cache key with proper namespacing
   */
  generateKey(prefix, ...parts) {
    return `${prefix}:${parts.join(':')}`;
  }

  /**
   * Set cache with TTL
   */
  async set(key, value, ttl = 3600) {
    if (!this.isAvailable()) return false;
    
    try {
      const serializedValue = JSON.stringify(value);
      await this.client.setEx(key, ttl, serializedValue);
      logger.debug(`Cache SET: ${key} (TTL: ${ttl}s)`);
      return true;
    } catch (error) {
      logger.error(`Cache SET error for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Get cache value
   */
  async get(key) {
    if (!this.isAvailable()) return null;
    
    try {
      const value = await this.client.get(key);
      if (value) {
        logger.debug(`Cache HIT: ${key}`);
        return JSON.parse(value);
      }
      logger.debug(`Cache MISS: ${key}`);
      return null;
    } catch (error) {
      logger.error(`Cache GET error for key ${key}:`, error);
      return null;
    }
  }

  /**
   * Delete cache key
   */
  async del(key) {
    if (!this.isAvailable()) return false;
    
    try {
      await this.client.del(key);
      logger.debug(`Cache DEL: ${key}`);
      return true;
    } catch (error) {
      logger.error(`Cache DEL error for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Delete multiple keys by pattern
   */
  async delPattern(pattern) {
    if (!this.isAvailable()) return false;
    
    try {
      const keys = await this.client.keys(pattern);
      if (keys.length > 0) {
        await this.client.del(keys);
        logger.debug(`Cache DEL PATTERN: ${pattern} (${keys.length} keys)`);
      }
      return true;
    } catch (error) {
      logger.error(`Cache DEL PATTERN error for ${pattern}:`, error);
      return false;
    }
  }

  /**
   * Increment counter (for analytics)
   */
  async incr(key, ttl = 3600) {
    if (!this.isAvailable()) return false;
    
    try {
      const value = await this.client.incr(key);
      if (value === 1) {
        await this.client.expire(key, ttl);
      }
      return value;
    } catch (error) {
      logger.error(`Cache INCR error for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Cache approved gallery media with pagination
   */
  async cacheApprovedMedia(queryParams, data) {
    const key = this.generateKey(
      this.KEY_PREFIXES.GALLERY_PAGINATION,
      'approved',
      JSON.stringify(queryParams)
    );
    return await this.set(key, data, this.TTL_CONFIG.APPROVED_MEDIA);
  }

  /**
   * Get cached approved gallery media
   */
  async getCachedApprovedMedia(queryParams) {
    const key = this.generateKey(
      this.KEY_PREFIXES.GALLERY_PAGINATION,
      'approved',
      JSON.stringify(queryParams)
    );
    return await this.get(key);
  }

  /**
   * Cache single media item
   */
  async cacheSingleMedia(mediaId, data) {
    const key = this.generateKey(this.KEY_PREFIXES.GALLERY_MEDIA, 'single', mediaId);
    return await this.set(key, data, this.TTL_CONFIG.SINGLE_MEDIA);
  }

  /**
   * Get cached single media item
   */
  async getCachedSingleMedia(mediaId) {
    const key = this.generateKey(this.KEY_PREFIXES.GALLERY_MEDIA, 'single', mediaId);
    return await this.get(key);
  }

  /**
   * Cache categories
   */
  async cacheCategories(data) {
    const key = this.generateKey(this.KEY_PREFIXES.GALLERY_CATEGORIES, 'all');
    return await this.set(key, data, this.TTL_CONFIG.CATEGORIES);
  }

  /**
   * Get cached categories
   */
  async getCachedCategories() {
    const key = this.generateKey(this.KEY_PREFIXES.GALLERY_CATEGORIES, 'all');
    return await this.get(key);
  }

  /**
   * Cache popular tags
   */
  async cachePopularTags(limit, data) {
    const key = this.generateKey(this.KEY_PREFIXES.GALLERY_TAGS, 'popular', limit);
    return await this.set(key, data, this.TTL_CONFIG.POPULAR_TAGS);
  }

  /**
   * Get cached popular tags
   */
  async getCachedPopularTags(limit) {
    const key = this.generateKey(this.KEY_PREFIXES.GALLERY_TAGS, 'popular', limit);
    return await this.get(key);
  }

  /**
   * Cache search results
   */
  async cacheSearchResults(searchQuery, data) {
    const key = this.generateKey(
      this.KEY_PREFIXES.GALLERY_SEARCH,
      Buffer.from(searchQuery).toString('base64')
    );
    return await this.set(key, data, this.TTL_CONFIG.SEARCH_RESULTS);
  }

  /**
   * Get cached search results
   */
  async getCachedSearchResults(searchQuery) {
    const key = this.generateKey(
      this.KEY_PREFIXES.GALLERY_SEARCH,
      Buffer.from(searchQuery).toString('base64')
    );
    return await this.get(key);
  }

  /**
   * Invalidate cache when media is updated/created/deleted
   */
  async invalidateMediaCache(mediaId = null, categoryId = null) {
    const patterns = [
      `${this.KEY_PREFIXES.GALLERY_PAGINATION}:*`,
      `${this.KEY_PREFIXES.GALLERY_SEARCH}:*`,
      `${this.KEY_PREFIXES.GALLERY_TAGS}:popular:*`,
      `${this.KEY_PREFIXES.GALLERY_STATS}:*`,
    ];

    if (mediaId) {
      patterns.push(`${this.KEY_PREFIXES.GALLERY_MEDIA}:single:${mediaId}`);
    }

    if (categoryId) {
      patterns.push(`${this.KEY_PREFIXES.GALLERY_CATEGORIES}:*`);
    }

    for (const pattern of patterns) {
      await this.delPattern(pattern);
    }

    logger.debug('Media cache invalidated', { mediaId, categoryId });
  }

  /**
   * Invalidate category cache
   */
  async invalidateCategoryCache() {
    await this.delPattern(`${this.KEY_PREFIXES.GALLERY_CATEGORIES}:*`);
    await this.delPattern(`${this.KEY_PREFIXES.GALLERY_PAGINATION}:*`);
    logger.debug('Category cache invalidated');
  }

  /**
   * Invalidate tag cache
   */
  async invalidateTagCache() {
    await this.delPattern(`${this.KEY_PREFIXES.GALLERY_TAGS}:*`);
    await this.delPattern(`${this.KEY_PREFIXES.GALLERY_PAGINATION}:*`);
    await this.delPattern(`${this.KEY_PREFIXES.GALLERY_SEARCH}:*`);
    logger.debug('Tag cache invalidated');
  }

  /**
   * Track view count in cache (for analytics)
   */
  async trackMediaView(mediaId) {
    const key = this.generateKey(this.KEY_PREFIXES.GALLERY_STATS, 'views', mediaId);
    return await this.incr(key, this.TTL_CONFIG.MEDIA_STATS);
  }

  /**
   * Get cache statistics
   */
  async getCacheStats() {
    if (!this.isAvailable()) return null;
    
    try {
      const info = await this.client.info('memory');
      const keyspace = await this.client.info('keyspace');
      
      return {
        connected: this.isConnected,
        memory: info,
        keyspace: keyspace,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      logger.error('Error getting cache stats:', error);
      return null;
    }
  }

  /**
   * Graceful shutdown
   */
  async disconnect() {
    if (this.client) {
      try {
        await this.client.quit();
        logger.info('Redis cache disconnected gracefully');
      } catch (error) {
        logger.error('Error disconnecting Redis cache:', error);
      }
    }
  }
}

// Create singleton instance
const redisCache = new RedisCache();

module.exports = redisCache;