const { sequelize } = require('../models');
const logger = require('../config/logger');
const env = require('../config/env');

async function connectDatabase({ sync = true } = {}) {
  await sequelize.authenticate();
  logger.info(`Database connected (${env.db.dialect}).`);

  if (sync) {
    await sequelize.sync();
    logger.info('Database schema synced.');
  }
  return sequelize;
}

async function closeDatabase() {
  await sequelize.close();
}

module.exports = { connectDatabase, closeDatabase, sequelize };
