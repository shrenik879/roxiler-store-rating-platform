const Joi = require('joi');
const { fields, listQuery } = require('./common.validation');
const { ROLE_VALUES } = require('../utils/constants');

const createUser = Joi.object({
  name: fields.name.required(),
  email: fields.email.required(),
  address: fields.address,
  password: fields.password.required(),
  role: fields.role.required(),
});

const listUsers = listQuery.keys({
  role: Joi.string().valid(...ROLE_VALUES).optional(),
});

module.exports = { createUser, listUsers };
