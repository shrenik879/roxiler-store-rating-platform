const express = require('express');
const storeController = require('../controllers/store.controller');
const ratingController = require('../controllers/rating.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/rbac.middleware');
const { validate } = require('../middlewares/validate.middleware');
const storeV = require('../validations/store.validation');
const ratingV = require('../validations/rating.validation');
const { idParam } = require('../validations/common.validation');
const { ROLES } = require('../utils/constants');

const adminRouter = express.Router();
adminRouter.use(authenticate, authorize(ROLES.ADMIN));

/**
 * @swagger
 * /admin/stores:
 *   get:
 *     tags: [Admin - Stores]
 *     summary: List stores with aggregates (search, sort, paginate)
 *     security: [{ bearerAuth: [] }]
 *     responses: { 200: { description: Paginated store list } }
 *   post:
 *     tags: [Admin - Stores]
 *     summary: Create a store (optionally linked to an owner)
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/CreateStoreInput' }
 *     responses: { 201: { description: Store created } }
 */
adminRouter
  .route('/')
  .get(validate(storeV.listStores, 'query'), storeController.listForAdmin)
  .post(validate(storeV.createStore), storeController.create);

adminRouter.get('/export', validate(storeV.listStores, 'query'), storeController.exportCSV);
adminRouter.get('/:id', validate(idParam, 'params'), storeController.getById);

/**
 * @swagger
 * /admin/stores/{id}:
 *   put:
 *     tags: [Admin - Stores]
 *     summary: Update a store and (re)assign its owner
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ in: path, name: id, required: true, schema: { type: integer } }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/CreateStoreInput' }
 *     responses: { 200: { description: Store updated } }
 */
adminRouter.put(
  '/:id',
  validate(idParam, 'params'),
  validate(storeV.createStore),
  storeController.update
);

const userRouter = express.Router();
userRouter.use(authenticate, authorize(ROLES.USER));

/**
 * @swagger
 * /stores:
 *   get:
 *     tags: [Stores]
 *     summary: Browse/search stores with your personal rating included
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: query, name: search, schema: { type: string } }
 *       - { in: query, name: sortBy, schema: { type: string, enum: [name, email, createdAt] } }
 *       - { in: query, name: sortOrder, schema: { type: string, enum: [ASC, DESC] } }
 *     responses: { 200: { description: Paginated store list with userRating } }
 */
userRouter.get('/', validate(storeV.listStores, 'query'), storeController.browse);
userRouter.get('/:id', validate(idParam, 'params'), storeController.getById);

/**
 * @swagger
 * /stores/{storeId}/rating:
 *   post:
 *     tags: [Stores]
 *     summary: Submit a new rating (1-5) for a store
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ in: path, name: storeId, required: true, schema: { type: integer } }]
 *     requestBody:
 *       required: true
 *       content: { application/json: { schema: { $ref: '#/components/schemas/RatingInput' } } }
 *     responses:
 *       201: { description: Rating submitted }
 *       409: { description: Already rated (use PUT to update) }
 *   put:
 *     tags: [Stores]
 *     summary: Update your existing rating for a store
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ in: path, name: storeId, required: true, schema: { type: integer } }]
 *     requestBody:
 *       required: true
 *       content: { application/json: { schema: { $ref: '#/components/schemas/RatingInput' } } }
 *     responses: { 200: { description: Rating updated } }
 */
userRouter
  .route('/:storeId/rating')
  .post(validate(ratingV.storeIdParam, 'params'), validate(ratingV.submitRating), ratingController.submit)
  .put(validate(ratingV.storeIdParam, 'params'), validate(ratingV.submitRating), ratingController.update);

module.exports = { adminStoreRouter: adminRouter, storeRouter: userRouter };
