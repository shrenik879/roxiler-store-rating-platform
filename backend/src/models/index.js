const sequelize = require('../config/database');
const User = require('./User');
const Store = require('./Store');
const Rating = require('./Rating');
const ActivityLog = require('./ActivityLog');
const RefreshToken = require('./RefreshToken');

User.hasOne(Store, { foreignKey: 'owner_id', as: 'ownedStore' });
Store.belongsTo(User, { foreignKey: 'owner_id', as: 'owner' });

User.hasMany(Rating, { foreignKey: 'user_id', as: 'ratings', onDelete: 'CASCADE' });
Rating.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

Store.hasMany(Rating, { foreignKey: 'store_id', as: 'ratings', onDelete: 'CASCADE' });
Rating.belongsTo(Store, { foreignKey: 'store_id', as: 'store' });

User.hasMany(RefreshToken, { foreignKey: 'user_id', as: 'refreshTokens', onDelete: 'CASCADE' });
RefreshToken.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

module.exports = { sequelize, User, Store, Rating, ActivityLog, RefreshToken };
