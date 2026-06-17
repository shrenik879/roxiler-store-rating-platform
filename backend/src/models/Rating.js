const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Rating = sequelize.define(
  'Rating',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { min: 1, max: 5 },
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'users', key: 'id' },
      onDelete: 'CASCADE',
    },
    store_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'stores', key: 'id' },
      onDelete: 'CASCADE',
    },
  },
  {
    tableName: 'ratings',
    indexes: [
      { unique: true, fields: ['user_id', 'store_id'] },
      { fields: ['store_id'] },
      { fields: ['user_id'] },
    ],
  }
);

module.exports = Rating;
