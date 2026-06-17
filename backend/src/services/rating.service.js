const ratingRepository = require('../repositories/rating.repository');
const storeRepository = require('../repositories/store.repository');
const activityLogService = require('./activityLog.service');
const cacheService = require('./cache.service');
const ApiError = require('../utils/ApiError');
const { ACTIVITY, CACHE_KEYS } = require('../utils/constants');

async function invalidateRatingCaches(ownerId) {
  await cacheService.delByPattern(CACHE_KEYS.STORE_LIST_PREFIX);
  await cacheService.del(CACHE_KEYS.ADMIN_DASHBOARD);
  if (ownerId) await cacheService.del(CACHE_KEYS.OWNER_DASHBOARD(ownerId));
}

const ratingService = {
  async submit(userId, storeId, value, actor) {
    const store = await storeRepository.findById(storeId);
    if (!store) throw ApiError.notFound('Store not found');

    const existing = await ratingRepository.findByUserAndStore(userId, storeId);
    if (existing) {
      throw ApiError.conflict('You have already rated this store; use update instead');
    }

    const rating = await ratingRepository.create({
      user_id: userId,
      store_id: storeId,
      rating: value,
    });

    await activityLogService.record({
      actor,
      action: ACTIVITY.RATING_SUBMITTED,
      description: `${actor.name} rated '${store.name}' ${value}/5`,
      metadata: { storeId, rating: value },
    });
    await invalidateRatingCaches(store.owner_id);

    return { id: rating.id, storeId, rating: value };
  },

  async update(userId, storeId, value, actor) {
    const store = await storeRepository.findById(storeId);
    if (!store) throw ApiError.notFound('Store not found');

    const existing = await ratingRepository.findByUserAndStore(userId, storeId);
    if (!existing) throw ApiError.notFound('You have not rated this store yet');

    await existing.update({ rating: value });

    await activityLogService.record({
      actor,
      action: ACTIVITY.RATING_UPDATED,
      description: `${actor.name} updated rating for '${store.name}' to ${value}/5`,
      metadata: { storeId, rating: value },
    });
    await invalidateRatingCaches(store.owner_id);

    return { id: existing.id, storeId, rating: value };
  },
};

module.exports = ratingService;
