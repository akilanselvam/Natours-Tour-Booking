const express = require('express');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const handlerFactory = require('./factoryHandler');

const filterobj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });
  res.status(204).json({
    status: 'Success',
    data: null,
  });
});
// this will help to not display the which are not equal to false

exports.updateMe = catchAsync(async (req, res, next) => {
  // 1) Create error if user POSTS password data
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This route is not for password updates. Please use /updateMyPassword.',
        400
      )
    );
  }
  const filteredBody = filterobj(req.body, 'name', 'email');
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });
  // 2) Update user document
  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
});
exports.getallusers = catchAsync(async (req, res) => {
  const user = await User.find();
  res.status(200).json({
    status: 'Success',
    result: user.length,
    data: { user },
  });
});

exports.createuser = (req, res) => {
  res.status(500).json({
    status: 'Error',
    message:
      'This Function Will Never be implemented Please Use Signup Instead!😁',
  });
};

// exports.getuser = (req, res) => {
//   res.status(500).json({
//     status: 'Error',
//     message: 'This Function is not implemented yet!😒',
//   });
// };

// exports.updateuser = (req, res) => {
//   res.status(500).json({
//     status: 'Error',
//     message: 'This Function is not implemented yet!😒',
//   });
// };

// exports.deleteuser = (req, res) => {
//   res.status(500).json({
//     status: 'Error',
//     message: 'This Function is not implemented yet!😒',
//   });
// };

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};
exports.getuser = handlerFactory.getOne(User);
exports.deleteuser = handlerFactory.deleteOne(User);
exports.updateuser = handlerFactory.updateOne(User);
