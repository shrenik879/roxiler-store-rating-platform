const Redis = require('ioredis');
const env = require('./env');
const logger = require('./logger');

let client = null;

if (env.redis.enabled) {
  client = new Redis({
    host: env.redis.host,
    port: env.redis.port,
    password: env.redis.password,
    maxRetriesPerRequest: 1,
    retryStrategy: (times) => (times > 3 ? null : Math.min(times * 200, 1000)),
    lazyConnect: false,
  });

  client.on('connect', () => logger.info('Redis connected'));
  client.on('error', (err) => logger.warn(`Redis error (caching disabled until recovery): ${err.message}`));
}

function isReady() {
  return Boolean(client && client.status === 'ready');
}

module.exports = { client, isReady };
