const express = require('express');
const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const { adminStoreRouter, storeRouter } = require('./store.routes');
const dashboardRoutes = require('./dashboard.routes');
const ownerRoutes = require('./owner.routes');

const router = express.Router();

/**
 * @swagger
 * /health:
 *   get:
 *     tags: [System]
 *     summary: Liveness probe
 *     responses: { 200: { description: Service healthy } }
 */
router.get('/health', (_req, res) =>
  res.json({ success: true, message: 'ok', data: { uptime: process.uptime() } })
);

router.use('/auth', authRoutes);

router.use('/admin/users', userRoutes);
router.use('/admin/stores', adminStoreRouter);
router.use('/admin/dashboard', dashboardRoutes);

router.use('/stores', storeRouter);

router.use('/owner', ownerRoutes);

module.exports = router;
