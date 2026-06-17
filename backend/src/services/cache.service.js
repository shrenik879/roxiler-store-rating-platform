const crypto = require('crypto');
const { client, isReady } = require('../config/redis');
const env = require('../config/env');
const logger = require('../config/logger');

const cacheService = {
  hashKey(obj) {
    return crypto.createHash('md5').update(JSON.stringify(obj)).digest('hex').slice(0, 12);
  },

  async get(key) {
    if (!isReady()) return null;
    try {
      const raw = await client.get(key);
      return raw ? JSON.parse(raw) : null;
    } catch (err) {
      logger.warn(`cache.get failed for ${key}: ${err.message}`);
      return null;
    }
  },

  async set(key, value, ttl = env.redis.ttl) {
    if (!isReady()) return;
    try {
      await client.set(key, JSON.stringify(value), 'EX', ttl);
    } catch (err) {
      logger.warn(`cache.set failed for ${key}: ${err.message}`);
    }
  },

  async getOrSet(key, ttl, producer) {
    const cached = await this.get(key);
    if (cached !== null) {
      logger.debug(`cache HIT ${key}`);
      return cached;
    }
    logger.debug(`cache MISS ${key}`);
    const fresh = await producer();
    await this.set(key, fresh, ttl);
    return fresh;
  },

  async del(...keys) {
    if (!isReady() || keys.length === 0) return;
    try {
      await client.del(keys);
    } catch (err) {
      logger.warn(`cache.del failed: ${err.message}`);
    }
  },

  async delByPattern(pattern) {
    if (!isReady()) return;
    try {
      const stream = client.scanStream({ match: pattern, count: 100 });
      const pipeline = client.pipeline();
      let found = 0;
      for await (const keys of stream) {
        keys.forEach((k) => {
          pipeline.del(k);
          found += 1;
        });
      }
      if (found) await pipeline.exec();
    } catch (err) {
      logger.warn(`cache.delByPattern failed for ${pattern}: ${err.message}`);
    }
  },
};

module.exports = cacheService;
