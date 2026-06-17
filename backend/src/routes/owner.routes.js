const express = require('express');
const ownerController = require('../controllers/owner.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/rbac.middleware');
const { validate } = require('../middlewares/validate.middleware');
const { listQuery } = require('../validations/common.validation');
const { ROLES } = require('../utils/constants');

const router = express.Router();
router.use(authenticate, authorize(ROLES.STORE_OWNER));

/**
 * @swagger
 * /owner/dashboard:
 *   get:
 *     tags: [Store Owner]
 *     summary: Owner dashboard - average rating, totals, recent ratings (cached)
 *     security: [{ bearerAuth: [] }]
 *     responses: { 200: { description: Owner store stats } }
 */
router.get('/dashboard', ownerController.dashboard);

/**
 * @swagger
 * /owner/raters:
 *   get:
 *     tags: [Store Owner]
 *     summary: Paginated list of users who rated the owner's store
 *     security: [{ bearerAuth: [] }]
 *     responses: { 200: { description: Paginated raters } }
 */
router.get('/raters', validate(listQuery, 'query'), ownerController.raters);

router.get('/raters/export', ownerController.exportRaters);

module.exports = router;
