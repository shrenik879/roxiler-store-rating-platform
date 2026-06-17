const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Store = sequelize.define(
  'Store',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: {
      type: DataTypes.STRING(60),
      allowNull: false,
      validate: { len: { args: [1, 60], msg: 'Store name is required' } },
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: { isEmail: { msg: 'Must be a valid email address' } },
    },
    address: { type: DataTypes.STRING(400), allowNull: true },
    owner_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: 'users', key: 'id' },
      onDelete: 'SET NULL',
    },
  },
  {
    tableName: 'stores',
    indexes: [
      { fields: ['name'] },
      { fields: ['owner_id'] },
    ],
  }
);

module.exports = Store;
