const dashboardService = require('../services/dashboard.service');
const asyncHandler = require('../utils/asyncHandler');
const { ok } = require('../utils/ApiResponse');

const dashboardController = {
  adminStats: asyncHandler(async (_req, res) => {
    const stats = await dashboardService.getAdminStats();
    ok(res, { data: stats });
  }),
};

module.exports = dashboardController;
