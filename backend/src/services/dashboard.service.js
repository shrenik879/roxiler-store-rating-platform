const userRepository = require('../repositories/user.repository');
const storeRepository = require('../repositories/store.repository');
const ratingRepository = require('../repositories/rating.repository');
const activityLogService = require('./activityLog.service');
const cacheService = require('./cache.service');
const env = require('../config/env');
const { CACHE_KEYS } = require('../utils/constants');

const dashboardService = {
  async getAdminStats() {
    return cacheService.getOrSet(CACHE_KEYS.ADMIN_DASHBOARD, env.redis.ttl, async () => {
      const [totalUsers, totalStores, totalRatings, roleRows, dailyRatings, recent] =
        await Promise.all([
          userRepository.count(),
          storeRepository.countAll(),
          ratingRepository.countAll(),
          userRepository.countByRole(),
          ratingRepository.getDailyCounts(14),
          activityLogService.recent(8),
        ]);

      const usersByRole = roleRows.map((r) => ({ role: r.role, count: Number(r.count) }));

      return {
        totals: { users: totalUsers, stores: totalStores, ratings: totalRatings },
        usersByRole,
        ratingsGrowth: dailyRatings,
        recentActivity: recent.map((a) => ({
          id: a.id,
          actorName: a.actor_name,
          action: a.action,
          description: a.description,
          createdAt: a.createdAt,
        })),
      };
    });
  },
};

module.exports = dashboardService;
