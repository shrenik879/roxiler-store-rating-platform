const ApiError = require('../utils/ApiError');

const validate = (schema, property = 'body') => (req, _res, next) => {
  const { value, error } = schema.validate(req[property], {
    abortEarly: false,
    stripUnknown: true,
    convert: true,
  });

  if (error) {
    const details = error.details.map((d) => ({
      field: d.path.join('.'),
      message: d.message.replace(/"/g, ''),
    }));
    return next(ApiError.badRequest('Validation failed', details));
  }

  req[property] = value;
  next();
};

module.exports = { validate };
