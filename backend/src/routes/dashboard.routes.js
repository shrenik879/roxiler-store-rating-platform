const express = require('express');
const dashboardController = require('../controllers/dashboard.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/rbac.middleware');
const { ROLES } = require('../utils/constants');

const router = express.Router();

/**
 * @swagger
 * /admin/dashboard:
 *   get:
 *     tags: [Admin - Dashboard]
 *     summary: Aggregate platform analytics (cached via Redis cache-aside)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Totals, role distribution, ratings growth, recent activity }
 */
router.get('/', authenticate, authorize(ROLES.ADMIN), dashboardController.adminStats);

module.exports = router;
