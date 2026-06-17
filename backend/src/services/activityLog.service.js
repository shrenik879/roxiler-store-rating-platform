const activityLogRepository = require('../repositories/activityLog.repository');
const logger = require('../config/logger');

const activityLogService = {
  async record({ actor, action, description, metadata }) {
    try {
      await activityLogRepository.create({
        actor_id: actor ? actor.id : null,
        actor_name: actor ? actor.name : 'System',
        action,
        description,
        metadata: metadata || null,
      });
    } catch (err) {
      logger.warn(`Failed to write activity log (${action}): ${err.message}`);
    }
  },

  recent(limit) {
    return activityLogRepository.recent(limit);
  },
};

module.exports = activityLogService;
