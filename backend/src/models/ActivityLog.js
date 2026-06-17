const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ActivityLog = sequelize.define(
  'ActivityLog',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    actor_id: { type: DataTypes.INTEGER, allowNull: true },
    actor_name: { type: DataTypes.STRING(120), allowNull: true },
    action: { type: DataTypes.STRING(60), allowNull: false },
    description: { type: DataTypes.STRING(255), allowNull: true },
    metadata: { type: DataTypes.JSON, allowNull: true },
  },
  {
    tableName: 'activity_logs',
    updatedAt: false,
    indexes: [{ fields: ['action'] }, { fields: ['actor_id'] }, { fields: ['created_at'] }],
  }
);

module.exports = ActivityLog;
