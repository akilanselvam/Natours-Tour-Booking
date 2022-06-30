const Review = require('./../models/reviewModel');
const APIFeautres = require('./../utils/apiFeatures');
const catchAsync = require('./../utils/catchAsync');
const handlerFactory = require('./factoryHandler');

exports.setTourUserIds = (req, res, next) => {
  // Allow nested routes
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;
  next();
};
// exports.createReview = catchAsync(async (req, res, next) => {
//   const newreview = await Review.create(req.body);

//   res.status(201).json({
//     status: 'Success',
//     data: {
//       tours: newreview,
//     },
//   });
// });

exports.getallReview = catchAsync(async (req, res, next) => {
  let filter = {};
  if (req.params.tourId) filter = { tour: req.params.tourId };
  const features = new APIFeautres(Review.find(filter), req.query)
    .filter()
    .sort()
    .limitfields()
    .pagination();

  const review = await features.query;
  res.status(200).json({
    status: 'Success',
    result: review.length,
    data: { review },
  });
});

exports.updateReview = handlerFactory.updateOne(Review);
exports.deleteReview = handlerFactory.deleteOne(Review);
exports.createReview = handlerFactory.createOne(Review);
exports.getReview = handlerFactory.getOne(Review);
