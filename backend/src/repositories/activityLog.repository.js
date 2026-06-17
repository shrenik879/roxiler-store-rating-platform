const BaseRepository = require('./base.repository');
const { ActivityLog } = require('../models');

class ActivityLogRepository extends BaseRepository {
  constructor() {
    super(ActivityLog);
  }

  recent(limit = 10) {
    return ActivityLog.findAll({ order: [['created_at', 'DESC']], limit });
  }
}

module.exports = new ActivityLogRepository();
