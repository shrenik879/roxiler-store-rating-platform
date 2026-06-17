const Joi = require('joi');
const { fields } = require('./common.validation');

const submitRating = Joi.object({
  rating: fields.rating.required(),
});

const storeIdParam = Joi.object({
  storeId: fields.id.required(),
});

module.exports = { submitRating, storeIdParam };
