const { Op } = require('sequelize');
const BaseRepository = require('./base.repository');
const { RefreshToken } = require('../models');

class RefreshTokenRepository extends BaseRepository {
  constructor() {
    super(RefreshToken);
  }

  findActiveByHash(tokenHash) {
    return RefreshToken.findOne({
      where: { token_hash: tokenHash, revoked_at: { [Op.is]: null } },
    });
  }

  revokeById(id) {
    return RefreshToken.update({ revoked_at: new Date() }, { where: { id } });
  }

  revokeAllForUser(userId) {
    return RefreshToken.update(
      { revoked_at: new Date() },
      { where: { user_id: userId, revoked_at: { [Op.is]: null } } }
    );
  }
}

module.exports = new RefreshTokenRepository();
