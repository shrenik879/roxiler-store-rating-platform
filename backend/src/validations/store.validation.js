const Joi = require('joi');
const { fields, listQuery } = require('./common.validation');

const createStore = Joi.object({
  name: Joi.string().min(1).max(60).required(),
  email: fields.email.required(),
  address: fields.address,
  ownerId: fields.id.optional().allow(null),
});

const listStores = listQuery;

module.exports = { createStore, listStores };
