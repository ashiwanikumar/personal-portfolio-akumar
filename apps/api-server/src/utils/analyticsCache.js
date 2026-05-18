/**
 * Analytics Caching Utility
 * 
 * Simple caching system for analytics queries to improve performance
 * Falls back to in-memory caching if Redis is not available
 */

const NodeCache = require('node-cache');

class AnalyticsCache {
  constructor() {
    // Initialize in-memory cache as fallback
    this.memoryCache = new NodeCache({ stdTTL: 300 }); // 5 minutes default TTL
    this.isRedisAvailable = false;
    this.redisClient = null;

    // Try to initialize Redis if available
    this.initializeRedis();
  }

  async initializeRedis() {
    try {
      // Only try Redis if it's explicitly configured
      if (process.env.REDIS_URL || process.env.REDIS_HOST) {
        const redis = require('redis');
        
        const redisConfig = process.env.REDIS_URL ? 
          { url: process.env.REDIS_URL } : 
          {
            host: process.env.REDIS_HOST || 'localhost',
            port: process.env.REDIS_PORT || 6379,
            password: process.env.REDIS_PASSWORD
          };

        this.redisClient = redis.createClient(redisConfig);
        
        this.redisClient.on('error', (err) => {
          // Redis client error, falling back to memory cache
          this.isRedisAvailable = false;
        });

        this.redisClient.on('connect', () => {
          // Redis connected for analytics caching
          this.isRedisAvailable = true;
        });

        await this.redisClient.connect();
      } else {
        // Redis not configured, using memory cache for analytics
      }
    } catch (error) {
      // Redis initialization failed, using memory cache
      this.isRedisAvailable = false;
    }
  }

  /**
   * Generate cache key for analytics queries
   */
  generateKey(prefix, params) {
    const paramString = JSON.stringify(params);
    const hash = require('crypto').createHash('md5').update(paramString).digest('hex');
    return `analytics:${prefix}:${hash}`;
  }

  /**
   * Get cached data
   */
  async get(key) {
    try {
      if (this.isRedisAvailable && this.redisClient) {
        const data = await this.redisClient.get(key);
        return data ? JSON.parse(data) : null;
      } else {
        return this.memoryCache.get(key) || null;
      }
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  /**
   * Set cached data
   */
  async set(key, data, ttlSeconds = 300) {
    try {
      if (this.isRedisAvailable && this.redisClient) {
        await this.redisClient.setEx(key, ttlSeconds, JSON.stringify(data));
      } else {
        this.memoryCache.set(key, data, ttlSeconds);
      }
      return true;
    } catch (error) {
      console.error('Cache set error:', error);
      return false;
    }
  }

  /**
   * Delete cached data
   */
  async del(key) {
    try {
      if (this.isRedisAvailable && this.redisClient) {
        await this.redisClient.del(key);
      } else {
        this.memoryCache.del(key);
      }
      return true;
    } catch (error) {
      console.error('Cache delete error:', error);
      return false;
    }
  }

  /**
   * Clear all analytics cache
   */
  async clearAnalyticsCache() {
    try {
      if (this.isRedisAvailable && this.redisClient) {
        const keys = await this.redisClient.keys('analytics:*');
        if (keys.length > 0) {
          await this.redisClient.del(keys);
        }
      } else {
        // Clear memory cache analytics keys
        const keys = this.memoryCache.keys();
        keys.forEach(key => {
          if (key.startsWith('analytics:')) {
            this.memoryCache.del(key);
          }
        });
      }
      return true;
    } catch (error) {
      console.error('Clear cache error:', error);
      return false;
    }
  }

  /**
   * Cache wrapper for analytics functions
   */
  async cacheWrapper(cacheKey, fetchFunction, ttlSeconds = 300) {
    try {
      // Try to get from cache first
      const cachedData = await this.get(cacheKey);
      if (cachedData) {
        return {
          ...cachedData,
          fromCache: true,
          cacheTimestamp: new Date().toISOString()
        };
      }

      // If not in cache, fetch fresh data
      const freshData = await fetchFunction();
      
      // Cache the result
      await this.set(cacheKey, freshData, ttlSeconds);
      
      return {
        ...freshData,
        fromCache: false,
        cacheTimestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Cache wrapper error:', error);
      // On error, try to fetch without caching
      return await fetchFunction();
    }
  }

  /**
   * Get cache statistics
   */
  getStats() {
    if (this.isRedisAvailable) {
      return {
        type: 'redis',
        connected: this.isRedisAvailable
      };
    } else {
      return {
        type: 'memory',
        keys: this.memoryCache.keys().length,
        stats: this.memoryCache.getStats()
      };
    }
  }
}

// Create singleton instance
const analyticsCache = new AnalyticsCache();

module.exports = analyticsCache;