const ratingService = require('../services/rating.service');
const asyncHandler = require('../utils/asyncHandler');
const { ok, created } = require('../utils/ApiResponse');

const ratingController = {
  submit: asyncHandler(async (req, res) => {
    const result = await ratingService.submit(
      req.user.id,
      Number(req.params.storeId),
      req.body.rating,
      req.user
    );
    created(res, { data: result, message: 'Rating submitted' });
  }),

  update: asyncHandler(async (req, res) => {
    const result = await ratingService.update(
      req.user.id,
      Number(req.params.storeId),
      req.body.rating,
      req.user
    );
    ok(res, { data: result, message: 'Rating updated' });
  }),
};

module.exports = ratingController;
