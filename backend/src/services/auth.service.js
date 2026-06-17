const crypto = require('crypto');
const userRepository = require('../repositories/user.repository');
const refreshTokenRepository = require('../repositories/refreshToken.repository');
const activityLogService = require('./activityLog.service');
const { hashPassword, comparePassword } = require('../utils/password');
const jwtUtil = require('../utils/jwt');
const ApiError = require('../utils/ApiError');
const { ROLES, ACTIVITY } = require('../utils/constants');
const env = require('../config/env');

const sha256 = (value) => crypto.createHash('sha256').update(value).digest('hex');

function ttlToMs(str) {
  const m = /^(\d+)([smhd])$/.exec(str);
  if (!m) return 7 * 24 * 60 * 60 * 1000;
  const n = Number(m[1]);
  const mult = { s: 1000, m: 60000, h: 3600000, d: 86400000 }[m[2]];
  return n * mult;
}

function publicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    address: user.address,
    role: user.role,
    createdAt: user.createdAt,
  };
}

const authService = {
  async issueTokens(user) {
    const accessToken = jwtUtil.signAccessToken(user);
    const { token: refreshToken, jti } = jwtUtil.signRefreshToken(user);

    await refreshTokenRepository.create({
      user_id: user.id,
      token_hash: sha256(jti),
      expires_at: new Date(Date.now() + ttlToMs(env.jwt.refreshExpiresIn)),
    });

    return { accessToken, refreshToken };
  },

  async register({ name, email, address, password }) {
    const existing = await userRepository.findByEmail(email);
    if (existing) throw ApiError.conflict('An account with this email already exists');

    const user = await userRepository.create({
      name,
      email,
      address,
      password: await hashPassword(password),
      role: ROLES.USER,
    });

    await activityLogService.record({
      actor: user,
      action: ACTIVITY.USER_REGISTERED,
      description: `${user.name} registered`,
    });

    const tokens = await this.issueTokens(user);
    return { user: publicUser(user), ...tokens };
  },

  async login({ email, password }) {
    const user = await userRepository.findByEmail(email, { withPassword: true });
    if (!user) throw ApiError.unauthorized('Invalid email or password');

    const valid = await comparePassword(password, user.password);
    if (!valid) throw ApiError.unauthorized('Invalid email or password');

    await activityLogService.record({
      actor: user,
      action: ACTIVITY.USER_LOGGED_IN,
      description: `${user.name} logged in`,
    });

    const tokens = await this.issueTokens(user);
    return { user: publicUser(user), ...tokens };
  },

  async refresh(refreshToken) {
    if (!refreshToken) throw ApiError.unauthorized('Refresh token missing');

    let payload;
    try {
      payload = jwtUtil.verifyRefreshToken(refreshToken);
    } catch {
      throw ApiError.unauthorized('Invalid or expired refresh token');
    }

    const stored = await refreshTokenRepository.findActiveByHash(sha256(payload.jti));
    if (!stored) throw ApiError.unauthorized('Refresh token has been revoked');

    await refreshTokenRepository.revokeById(stored.id);

    const user = await userRepository.findById(payload.sub);
    if (!user) throw ApiError.unauthorized('Account no longer exists');

    const tokens = await this.issueTokens(user);
    return { user: publicUser(user), ...tokens };
  },

  async logout(refreshToken) {
    if (!refreshToken) return;
    try {
      const payload = jwtUtil.verifyRefreshToken(refreshToken);
      const stored = await refreshTokenRepository.findActiveByHash(sha256(payload.jti));
      if (stored) await refreshTokenRepository.revokeById(stored.id);
    } catch {
    }
  },

  async changePassword(userId, { currentPassword, newPassword }) {
    const user = await userRepository.findByIdWithPassword(userId);
    if (!user) throw ApiError.notFound('User not found');

    const valid = await comparePassword(currentPassword, user.password);
    if (!valid) throw ApiError.badRequest('Current password is incorrect');

    await user.update({ password: await hashPassword(newPassword) });

    await refreshTokenRepository.revokeAllForUser(userId);

    await activityLogService.record({
      actor: user,
      action: ACTIVITY.PASSWORD_CHANGED,
      description: `${user.name} changed their password`,
    });
  },

  async me(userId) {
    const user = await userRepository.findById(userId);
    if (!user) throw ApiError.notFound('User not found');
    return publicUser(user);
  },
};

module.exports = authService;
