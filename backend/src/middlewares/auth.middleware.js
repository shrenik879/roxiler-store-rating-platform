const jwtUtil = require('../utils/jwt');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

const authenticate = asyncHandler(async (req, _res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) throw ApiError.unauthorized('Authentication token is missing');

  let payload;
  try {
    payload = jwtUtil.verifyAccessToken(token);
  } catch {
    throw ApiError.unauthorized('Invalid or expired access token');
  }

  req.user = { id: payload.sub, role: payload.role, name: payload.name, email: payload.email };
  next();
});

module.exports = { authenticate };
