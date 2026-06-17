const { Sequelize } = require('sequelize');
const env = require('./env');
const logger = require('./logger');

const shared = {
  logging: env.isProd ? false : (msg) => logger.debug(msg),
  define: {
    underscored: true,
    timestamps: true,
  },
  pool: { max: 10, min: 0, acquire: 30000, idle: 10000 },
};

let sequelize;

if (env.db.dialect === 'sqlite') {
  sequelize = new Sequelize({
    ...shared,
    dialect: 'sqlite',
    storage: env.db.storage,
  });
} else {
  sequelize = new Sequelize(env.db.name, env.db.user, env.db.password, {
    ...shared,
    host: env.db.host,
    port: env.db.port,
    dialect: 'mysql',
  });
}

module.exports = sequelize;
