const express = require('express');
const tourController = require('./../controller/tourController');
const router = express.Router();
const authController = require('./../controller/authController');
const reviewRouter = require('./../routes/reviewRoutes');

// router.param('id', tourController.quickcheck);

router.use('/:tourId/reviews', reviewRouter);
router
  .route('/cheap-5-tours')
  .get(tourController.cheaptourAlias, tourController.getalltour);
router.route('/tours-status').get(tourController.tourstats);
router
  .route('/monthlyplans/:year')
  .get(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide', 'guides'),
    tourController.getMonthlyplan
  );

router
  .route('/tours-within/:distance/center/:latlng/unit/:unit')
  .get(tourController.getToursWithin);

router.route('/distances/:latlng/unit/:unit').get(tourController.getDistance);

router
  .route('/')
  .get(tourController.getalltour)
  .post(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.createtour
  );
router
  .route('/:id')
  .get(tourController.gettour)
  .patch(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.updatetour
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.deletetour
  );

module.exports = router;
