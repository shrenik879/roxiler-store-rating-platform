const storeService = require('../services/store.service');
const asyncHandler = require('../utils/asyncHandler');
const { ok, created } = require('../utils/ApiResponse');

const storeController = {
  create: asyncHandler(async (req, res) => {
    const store = await storeService.create(req.body, req.user);
    created(res, { data: store, message: 'Store created' });
  }),

  update: asyncHandler(async (req, res) => {
    const store = await storeService.update(Number(req.params.id), req.body, req.user);
    ok(res, { data: store, message: 'Store updated' });
  }),

  listForAdmin: asyncHandler(async (req, res) => {
    const { items, meta } = await storeService.listForAdmin(req.query);
    ok(res, { data: items, meta });
  }),

  exportCSV: asyncHandler(async (req, res) => {
    const csv = await storeService.exportCSV(req.query);
    res.header('Content-Type', 'text/csv');
    res.attachment('stores.csv');
    res.send(csv);
  }),

  browse: asyncHandler(async (req, res) => {
    const { items, meta } = await storeService.browse(req.query, req.user.id);
    ok(res, { data: items, meta });
  }),

  getById: asyncHandler(async (req, res) => {
    const store = await storeService.getById(req.params.id);
    ok(res, { data: store });
  }),
};

module.exports = storeController;
