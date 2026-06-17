const express = require('express');
const userController = require('../controllers/user.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/rbac.middleware');
const { validate } = require('../middlewares/validate.middleware');
const v = require('../validations/user.validation');
const { idParam } = require('../validations/common.validation');
const { ROLES } = require('../utils/constants');

const router = express.Router();

router.use(authenticate, authorize(ROLES.ADMIN));

/**
 * @swagger
 * /admin/users:
 *   get:
 *     tags: [Admin - Users]
 *     summary: List users (search, filter by role, sort, paginate)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: query, name: page, schema: { type: integer } }
 *       - { in: query, name: limit, schema: { type: integer } }
 *       - { in: query, name: search, schema: { type: string } }
 *       - { in: query, name: role, schema: { type: string, enum: [ADMIN, USER, STORE_OWNER] } }
 *       - { in: query, name: sortBy, schema: { type: string, enum: [name, email, role, createdAt] } }
 *       - { in: query, name: sortOrder, schema: { type: string, enum: [ASC, DESC] } }
 *     responses:
 *       200: { description: Paginated user list }
 *   post:
 *     tags: [Admin - Users]
 *     summary: Create a user of any role
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/CreateUserInput' }
 *     responses:
 *       201: { description: User created }
 */
router
  .route('/')
  .get(validate(v.listUsers, 'query'), userController.list)
  .post(validate(v.createUser), userController.create);

/**
 * @swagger
 * /admin/users/export:
 *   get:
 *     tags: [Admin - Users]
 *     summary: Export the filtered user list as CSV
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: CSV file }
 */
router.get('/export', validate(v.listUsers, 'query'), userController.exportCSV);

/**
 * @swagger
 * /admin/users/{id}:
 *   get:
 *     tags: [Admin - Users]
 *     summary: Get one user's detail
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ in: path, name: id, required: true, schema: { type: integer } }]
 *     responses:
 *       200: { description: User detail }
 *       404: { description: Not found }
 */
router.get('/:id', validate(idParam, 'params'), userController.getById);

module.exports = router;
