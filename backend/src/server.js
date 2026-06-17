const app = require('./app');
const env = require('./config/env');
const logger = require('./config/logger');
const { connectDatabase, closeDatabase } = require('./database');

let server;

async function start() {
  try {
    await connectDatabase({ sync: true });

    server = app.listen(env.port, () => {
      logger.info(`Server running on http://localhost:${env.port} (${env.nodeEnv})`);
      logger.info(`API docs at http://localhost:${env.port}/api/docs`);
    });
  } catch (err) {
    logger.error(`Failed to start server: ${err.message}`);
    process.exit(1);
  }
}

async function shutdown(signal) {
  logger.info(`${signal} received, shutting down gracefully...`);
  if (server) server.close();
  try {
    await closeDatabase();
  } catch (err) {
    logger.warn(`Error during shutdown: ${err.message}`);
  }
  process.exit(0);
}

['SIGINT', 'SIGTERM'].forEach((sig) => process.on(sig, () => shutdown(sig)));
process.on('unhandledRejection', (reason) => logger.error(`Unhandled rejection: ${reason}`));

start();

module.exports = app;
