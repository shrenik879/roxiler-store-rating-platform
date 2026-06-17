const userService = require('../services/user.service');
const asyncHandler = require('../utils/asyncHandler');
const { ok, created } = require('../utils/ApiResponse');

const userController = {
  create: asyncHandler(async (req, res) => {
    const user = await userService.createByAdmin(req.body, req.user);
    created(res, { data: user, message: 'User created' });
  }),

  list: asyncHandler(async (req, res) => {
    const { items, meta } = await userService.list(req.query);
    ok(res, { data: items, meta });
  }),

  getById: asyncHandler(async (req, res) => {
    const user = await userService.getById(req.params.id);
    ok(res, { data: user });
  }),

  exportCSV: asyncHandler(async (req, res) => {
    const csv = await userService.exportCSV(req.query);
    res.header('Content-Type', 'text/csv');
    res.attachment('users.csv');
    res.send(csv);
  }),
};

module.exports = userController;
