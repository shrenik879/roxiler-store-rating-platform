const ownerService = require('../services/owner.service');
const asyncHandler = require('../utils/asyncHandler');
const { ok } = require('../utils/ApiResponse');

const ownerController = {
  dashboard: asyncHandler(async (req, res) => {
    const data = await ownerService.getDashboard(req.user.id);
    ok(res, { data });
  }),

  raters: asyncHandler(async (req, res) => {
    const { items, meta } = await ownerService.getRaters(req.user.id, req.query);
    ok(res, { data: items, meta });
  }),

  exportRaters: asyncHandler(async (req, res) => {
    const csv = await ownerService.exportRatersCSV(req.user.id);
    res.header('Content-Type', 'text/csv');
    res.attachment('store-ratings.csv');
    res.send(csv);
  }),
};

module.exports = ownerController;
