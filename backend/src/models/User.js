const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const { ROLE_VALUES, ROLES } = require('../utils/constants');

const User = sequelize.define(
  'User',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: {
      type: DataTypes.STRING(60),
      allowNull: false,
      validate: { len: { args: [3, 60], msg: 'Name must be 3-60 characters' } },
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: { isEmail: { msg: 'Must be a valid email address' } },
    },
    password: { type: DataTypes.STRING, allowNull: false },
    address: { type: DataTypes.STRING(400), allowNull: true },
    role: {
      type: DataTypes.ENUM(...ROLE_VALUES),
      allowNull: false,
      defaultValue: ROLES.USER,
    },
  },
  {
    tableName: 'users',
    indexes: [
      { fields: ['role'] },
    ],
    defaultScope: {
      attributes: { exclude: ['password'] },
    },
    scopes: {
      withPassword: { attributes: {} },
    },
  }
);

module.exports = User;
