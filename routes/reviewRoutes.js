const express = require('express');
const router = express.Router({ mergeParams: true });
const reviewController = require('./../controller/reviewController');
const authController = require('./../controller/authController');
router.use(authController.protect);
router
  .route('/')
  .get(authController.protect, reviewController.getallReview)
  .post(
    authController.protect,
    authController.restrictTo('user'),
    reviewController.setTourUserIds,
    reviewController.createReview
  );
router
  .route('/:id')
  .delete(
    authController.restrictTo('user', 'admin'),
    reviewController.deleteReview
  )
  .patch(
    authController.restrictTo('user', 'admin'),
    reviewController.updateReview
  )
  .get(reviewController.getReview);

module.exports = router;
