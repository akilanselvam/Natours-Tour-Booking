const express = require('express');
const router = express.Router();
const APIFeautres = require('./../utils/apiFeatures');
const catchAsync = require('./../utils/catchAsync');
const Tour = require('./../models/tourModel');
const AppError = require('./../utils/appError');
const handlerFactory = require('./factoryHandler');

exports.cheaptourAlias = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingAverage';
  req.query.fields = 'name,price,ratingAverage,summary,difficulty';
  next();
};
// exports.getalltour = catchAsync(async (req, res, next) => {
//   const features = new APIFeautres(Tour.find(), req.query)
//     .filter()
//     .sort()
//     .limitfields()
//     .pagination();

//   const tour = await features.query;
//   res.status(200).json({
//     status: 'Success',
//     result: tour.length,
//     data: { tour },
//   });
// });

// exports.createtour = catchAsync(async (req, res, next) => {
//   const newtour = await Tour.create(req.body);
//   res.status(201).json({
//     status: 'Success',
//     data: {
//       tours: newtour,
//     },
//   });
// });

// exports.gettour = catchAsync(async (req, res, next) => {
//   const tour = await Tour.findById(req.params.id).populate('reviews');

//   if (!tour) {
//     return next(new AppError('No tour found with that ID', 404));
//   }

//   res.status(200).json({
//     status: 'Success',
//     data: { tour },
//   });
// });

// exports.updatetour = catchAsync(async (req, res, next) => {
//   const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
//     new: true,
//     runValidators: true,
//   });
//   if (!tour) {
//     return next(new AppError('No tour found with that ID', 404));
//   }

//   res.status(200).json({
//     status: 'Success',
//     data: {
//       tour,
//     },
//   });
// });

// exports.deletetour = catchAsync(async (req, res, next) => {
//   const tour = await Tour.findByIdAndDelete(req.params.id);
//   if (!tour) {
//     return next(new AppError('No tour found with that ID', 404));
//   }

//   res.status(204).json({
//     status: 'Success',
//     data: null,
//   });
// });
exports.getalltour = handlerFactory.getAll(Tour);
exports.deletetour = handlerFactory.deleteOne(Tour);
exports.updatetour = handlerFactory.updateOne(Tour);
exports.createtour = handlerFactory.createOne(Tour);
exports.gettour = handlerFactory.getOne(Tour, { path: 'reviews' });

exports.tourstats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingAverage: { $gte: 4.5 } }, //where it matches the rating average greater than or equal to 4.5
    },
    {
      $group: {
        _id: { $toUpper: '$difficulty' }, //this will group the data by this way
        numTours: { $sum: 1 }, //this will say how many api data values are present
        avgRating: { $avg: '$ratingAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    {
      $sort: {
        avgPrice: 1, //will sort them
      },
    },
    // {
    //   $match: { _id: { $ne: 'EASY' } }, with this line we can exclude the easy difficulty level we can add as many as match as we need
    // },
  ]);
  res.status(200).json({
    status: 'Success',
    data: {
      stats,
    },
  });
});

exports.getMonthlyplan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1; //this is to get the value of year from parameter and converting them to number
  const plan = await Tour.aggregate([
    { $unwind: '$startDates' }, //if you api data is a array of year values then you can seperate them by unwinding that particular parameter
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`), //we are taking one whole year as a match of values to check
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' }, //now we are grouping them by months
        numTourStarts: { $sum: 1 },
        nameoftheTours: { $push: '$name' },
        maxGroupSizeoftheTours: { $push: '$maxGroupSize' },
      },
    },
    {
      $addFields: { month: '$_id' }, //adding the id under here to display it as month
    },
    {
      $project: { _id: 0 }, //this will exculde that value from the call
    },
    {
      $sort: {
        numTourStarts: -1, //sorting them in accedning
      },
    },
    {
      $limit: 12, //limiting the data how much to show
    },
  ]);
  res.status(200).json({
    status: 'Success',
    result: plan.length,
    data: {
      plan,
    },
  });
});

exports.getToursWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');
  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

  if (!lat || !lng) {
    next(
      new AppError(
        'Please provide latitutr and longitude in the format lat, lng.',
        400
      )
    );
  }
  console.log(distance, lat, lng, unit);
  const tours = await Tour.find({
    startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
  });
  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      data: tours,
    },
  });
});

exports.getDistance = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');
  const multiplier = unit === 'mi' ? 0.000621371 : 0.001;

  if (!lat || !lng) {
    next(
      new AppError(
        'Please provide latitutr and longitude in the format lat, lng.',
        400
      )
    );
  }

  const distances = await Tour.aggregate([
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [lng * 1, lat * 1],
        },
        distanceField: 'distance',
        distanceMultiplier: multiplier,
      },
    },
    {
      $project: {
        distance: 1,
        name: 1,
      },
    },
  ]);
  res.status(200).json({
    status: 'success',
    results: distances.length,
    data: {
      data: distances,
    },
  });
});
