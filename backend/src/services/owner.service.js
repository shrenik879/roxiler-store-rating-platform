const storeRepository = require('../repositories/store.repository');
const ratingRepository = require('../repositories/rating.repository');
const cacheService = require('./cache.service');
const { buildPagination, buildMeta } = require('../utils/pagination');
const { toCSV } = require('../utils/csv');
const ApiError = require('../utils/ApiError');
const env = require('../config/env');
const { CACHE_KEYS } = require('../utils/constants');

async function resolveOwnedStore(ownerId) {
  const store = await storeRepository.findByOwnerId(ownerId);
  if (!store) throw ApiError.notFound('No store is linked to your account yet');
  return store;
}

const ownerService = {
  async getDashboard(ownerId) {
    return cacheService.getOrSet(CACHE_KEYS.OWNER_DASHBOARD(ownerId), env.redis.ttl, async () => {
      const store = await resolveOwnedStore(ownerId);
      const stats = await ratingRepository.getStoreStats(store.id);
      const { rows } = await ratingRepository.findByStoreWithUser(store.id, {
        limit: 10,
        offset: 0,
      });

      return {
        store: { id: store.id, name: store.name, email: store.email, address: store.address },
        stats,
        recentRatings: rows.map((r) => ({
          id: r.id,
          rating: r.rating,
          user: r.user ? { id: r.user.id, name: r.user.name, email: r.user.email } : null,
          createdAt: r.createdAt,
        })),
      };
    });
  },

  async getRaters(ownerId, query) {
    const store = await resolveOwnedStore(ownerId);
    const pg = buildPagination(query, { allowedSortFields: ['createdAt', 'rating'] });
    const { count, rows } = await ratingRepository.findByStoreWithUser(store.id, {
      order: pg.order,
      limit: pg.limit,
      offset: pg.offset,
    });
    return {
      items: rows.map((r) => ({
        id: r.id,
        rating: r.rating,
        user: r.user ? { id: r.user.id, name: r.user.name, email: r.user.email, address: r.user.address } : null,
        createdAt: r.createdAt,
      })),
      meta: buildMeta({ count, page: pg.page, limit: pg.limit }),
    };
  },

  async exportRatersCSV(ownerId) {
    const store = await resolveOwnedStore(ownerId);
    const { rows } = await ratingRepository.findByStoreWithUser(store.id, { limit: 10000, offset: 0 });
    const flat = rows.map((r) => ({
      id: r.id,
      userName: r.user ? r.user.name : '',
      userEmail: r.user ? r.user.email : '',
      rating: r.rating,
      createdAt: r.createdAt,
    }));
    return toCSV(flat, [
      { key: 'id', header: 'Rating ID' },
      { key: 'userName', header: 'User Name' },
      { key: 'userEmail', header: 'User Email' },
      { key: 'rating', header: 'Rating' },
      { key: 'createdAt', header: 'Rated At' },
    ]);
  },
};

module.exports = ownerService;
