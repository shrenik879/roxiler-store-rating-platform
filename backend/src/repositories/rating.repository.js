const { fn, col } = require('sequelize');
const BaseRepository = require('./base.repository');
const { Rating, User, Store } = require('../models');

class RatingRepository extends BaseRepository {
  constructor() {
    super(Rating);
  }

  findByUserAndStore(userId, storeId) {
    return Rating.findOne({ where: { user_id: userId, store_id: storeId } });
  }

  countAll() {
    return Rating.count();
  }

  async getStoreStats(storeId) {
    const row = await Rating.findOne({
      where: { store_id: storeId },
      attributes: [
        [fn('AVG', col('rating')), 'averageRating'],
        [fn('COUNT', col('id')), 'totalRatings'],
        [fn('COUNT', fn('DISTINCT', col('user_id'))), 'uniqueUsers'],
      ],
      raw: true,
    });
    return {
      averageRating: row && row.averageRating ? Number(Number(row.averageRating).toFixed(2)) : 0,
      totalRatings: row ? Number(row.totalRatings) : 0,
      uniqueUsers: row ? Number(row.uniqueUsers) : 0,
    };
  }

  findByStoreWithUser(storeId, { order = [['created_at', 'DESC']], limit, offset } = {}) {
    return Rating.findAndCountAll({
      where: { store_id: storeId },
      include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email', 'address'] }],
      order,
      limit,
      offset,
    });
  }

  async getDailyCounts(days = 14) {
    const rows = await Rating.findAll({
      attributes: [
        [fn('DATE', col('created_at')), 'date'],
        [fn('COUNT', col('id')), 'count'],
      ],
      group: [fn('DATE', col('created_at'))],
      order: [[fn('DATE', col('created_at')), 'ASC']],
      raw: true,
    });
    return rows.slice(-days).map((r) => ({ date: r.date, count: Number(r.count) }));
  }
}

module.exports = new RatingRepository();
