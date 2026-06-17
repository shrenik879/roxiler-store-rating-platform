const morgan = require('morgan');
const env = require('../config/env');
const logger = require('../config/logger');

const format = env.isProd ? 'combined' : ':method :url :status - :response-time ms';

const requestLogger = morgan(format, {
  stream: logger.stream,
  skip: () => env.isTest,
});

module.exports = { requestLogger };
