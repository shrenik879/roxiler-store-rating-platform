const authService = require('../services/auth.service');
const asyncHandler = require('../utils/asyncHandler');
const { ok, created } = require('../utils/ApiResponse');
const env = require('../config/env');

const REFRESH_COOKIE = 'refreshToken';
const cookieOptions = {
  httpOnly: true,
  secure: env.cookieSecure,
  sameSite: env.cookieSecure ? 'none' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: '/api/auth',
};

function sendAuth(res, result, status = 200) {
  res.cookie(REFRESH_COOKIE, result.refreshToken, cookieOptions);
  const payload = { user: result.user, accessToken: result.accessToken, refreshToken: result.refreshToken };
  return status === 201
    ? created(res, { data: payload, message: 'Registered successfully' })
    : ok(res, { data: payload, message: 'Authenticated successfully' });
}

const authController = {
  register: asyncHandler(async (req, res) => {
    const result = await authService.register(req.body);
    sendAuth(res, result, 201);
  }),

  login: asyncHandler(async (req, res) => {
    const result = await authService.login(req.body);
    sendAuth(res, result, 200);
  }),

  refresh: asyncHandler(async (req, res) => {
    const token = req.cookies?.[REFRESH_COOKIE] || req.body.refreshToken;
    const result = await authService.refresh(token);
    sendAuth(res, result, 200);
  }),

  logout: asyncHandler(async (req, res) => {
    const token = req.cookies?.[REFRESH_COOKIE] || req.body.refreshToken;
    await authService.logout(token);
    res.clearCookie(REFRESH_COOKIE, { ...cookieOptions, maxAge: undefined });
    ok(res, { message: 'Logged out' });
  }),

  me: asyncHandler(async (req, res) => {
    const user = await authService.me(req.user.id);
    ok(res, { data: user });
  }),

  changePassword: asyncHandler(async (req, res) => {
    await authService.changePassword(req.user.id, req.body);
    ok(res, { message: 'Password changed successfully. Please log in again.' });
  }),
};

module.exports = authController;
