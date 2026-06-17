const { ValidationError, UniqueConstraintError, DatabaseError } = require('sequelize');
const ApiError = require('../utils/ApiError');
const logger = require('../config/logger');
const env = require('../config/env');

function errorHandler(err, req, res, next) {
  let statusCode = 500;
  let message = 'Internal server error';
  let details;

  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
    details = err.details;
  } else if (err instanceof UniqueConstraintError) {
    statusCode = 409;
    message = 'A record with these details already exists';
    details = err.errors?.map((e) => ({ field: e.path, message: e.message }));
  } else if (err instanceof ValidationError) {
    statusCode = 400;
    message = 'Validation failed';
    details = err.errors?.map((e) => ({ field: e.path, message: e.message }));
  } else if (err instanceof DatabaseError) {
    statusCode = 400;
    message = 'Invalid database operation';
  }

  if (statusCode >= 500) {
    logger.error(`${req.method} ${req.originalUrl} -> ${err.stack || err.message}`);
  } else {
    logger.warn(`${req.method} ${req.originalUrl} -> ${statusCode} ${message}`);
  }

  const body = { success: false, message };
  if (details) body.errors = details;
  if (!env.isProd && statusCode >= 500) body.stack = err.stack;

  res.status(statusCode).json(body);
}

module.exports = { errorHandler };
