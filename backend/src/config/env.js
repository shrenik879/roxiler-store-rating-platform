const path = require('path');
const Joi = require('joi');

require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const schema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'test', 'production').default('development'),
  PORT: Joi.number().default(5000),

  DB_DIALECT: Joi.string().valid('mysql', 'sqlite').default('sqlite'),
  DB_HOST: Joi.string().default('localhost'),
  DB_PORT: Joi.number().default(3306),
  DB_NAME: Joi.string().default('store_rating_db'),
  DB_USER: Joi.string().default('root'),
  DB_PASSWORD: Joi.string().allow('').default(''),
  DB_STORAGE: Joi.string().default(path.join(__dirname, '../../data.sqlite')),

  REDIS_ENABLED: Joi.boolean().default(false),
  REDIS_HOST: Joi.string().default('localhost'),
  REDIS_PORT: Joi.number().default(6379),
  REDIS_PASSWORD: Joi.string().allow('').default(''),
  CACHE_TTL_SECONDS: Joi.number().default(60),

  JWT_ACCESS_SECRET: Joi.string().min(10).default('dev-access-secret-change-me'),
  JWT_REFRESH_SECRET: Joi.string().min(10).default('dev-refresh-secret-change-me'),
  JWT_ACCESS_EXPIRES_IN: Joi.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: Joi.string().default('7d'),
  BCRYPT_SALT_ROUNDS: Joi.number().default(10),

  CORS_ORIGIN: Joi.string().default('http://localhost:5173'),

  RATE_LIMIT_WINDOW_MS: Joi.number().default(15 * 60 * 1000),
  RATE_LIMIT_MAX: Joi.number().default(300),
  AUTH_RATE_LIMIT_MAX: Joi.number().default(20),

  ADMIN_NAME: Joi.string().default('Rajesh Kumar Choudhary'),
  ADMIN_EMAIL: Joi.string().email().default('admin@storerating.com'),
  ADMIN_PASSWORD: Joi.string().default('Admin@1234'),
  ADMIN_ADDRESS: Joi.string().default('Head Office, Admin Street, City'),

  SEED_DEMO: Joi.boolean().default(false),
  COOKIE_SECURE: Joi.boolean().default(false),
}).unknown(true);

const { value: env, error } = schema.validate(process.env, { abortEarly: false });

if (error) {
  console.error('Invalid environment configuration:\n' + error.message);
  process.exit(1);
}

module.exports = {
  nodeEnv: env.NODE_ENV,
  isProd: env.NODE_ENV === 'production',
  isTest: env.NODE_ENV === 'test',
  port: env.PORT,

  db: {
    dialect: env.DB_DIALECT,
    host: env.DB_HOST,
    port: env.DB_PORT,
    name: env.DB_NAME,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    storage: env.DB_STORAGE,
  },

  redis: {
    enabled: env.REDIS_ENABLED,
    host: env.REDIS_HOST,
    port: env.REDIS_PORT,
    password: env.REDIS_PASSWORD || undefined,
    ttl: env.CACHE_TTL_SECONDS,
  },

  jwt: {
    accessSecret: env.JWT_ACCESS_SECRET,
    refreshSecret: env.JWT_REFRESH_SECRET,
    accessExpiresIn: env.JWT_ACCESS_EXPIRES_IN,
    refreshExpiresIn: env.JWT_REFRESH_EXPIRES_IN,
  },

  bcryptSaltRounds: env.BCRYPT_SALT_ROUNDS,
  corsOrigin: env.CORS_ORIGIN,

  rateLimit: {
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    max: env.RATE_LIMIT_MAX,
    authMax: env.AUTH_RATE_LIMIT_MAX,
  },

  admin: {
    name: env.ADMIN_NAME,
    email: env.ADMIN_EMAIL,
    password: env.ADMIN_PASSWORD,
    address: env.ADMIN_ADDRESS,
  },

  seedDemo: env.SEED_DEMO,
  cookieSecure: env.COOKIE_SECURE,
};
