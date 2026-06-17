const Joi = require('joi');
const { fields } = require('./common.validation');

const register = Joi.object({
  name: fields.name.required(),
  email: fields.email.required(),
  address: fields.address,
  password: fields.password.required(),
});

const login = Joi.object({
  email: fields.email.required(),
  password: Joi.string().required(),
});

const changePassword = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: fields.password.required(),
});

const refresh = Joi.object({
  refreshToken: Joi.string().optional(),
});

module.exports = { register, login, changePassword, refresh };
