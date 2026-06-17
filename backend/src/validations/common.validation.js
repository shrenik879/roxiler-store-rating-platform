const Joi = require('joi');
const { ROLE_VALUES } = require('../utils/constants');

const fields = {
  name: Joi.string().min(20).max(60).messages({
    'string.min': 'Name must be at least 20 characters',
    'string.max': 'Name must be at most 60 characters',
  }),
  email: Joi.string().email().max(255),
  address: Joi.string().allow('', null).max(400),
  password: Joi.string()
    .min(8)
    .max(16)
    .pattern(/^(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>]).+$/)
    .messages({
      'string.pattern.base':
        'Password must include at least one uppercase letter and one special character',
      'string.min': 'Password must be 8-16 characters',
      'string.max': 'Password must be 8-16 characters',
    }),
  role: Joi.string().valid(...ROLE_VALUES),
  rating: Joi.number().integer().min(1).max(5),
  id: Joi.number().integer().positive(),
};

const listQuery = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().allow('').max(255).optional(),
  sortBy: Joi.string().optional(),
  sortOrder: Joi.string().valid('ASC', 'DESC', 'asc', 'desc').optional(),
});

const idParam = Joi.object({ id: fields.id.required() });

module.exports = { fields, listQuery, idParam };
