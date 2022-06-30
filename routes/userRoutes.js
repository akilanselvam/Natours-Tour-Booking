const express = require('express');
const userController = require('./../controller/userController');
const authController = require('./../controller/authController');
const router = express.Router();

router.route('/signup').post(authController.signup);
router.route('/login').post(authController.login);
router.route('/forgotPassword').post(authController.forgotPassword);
router.route('/resetPassword/:token').patch(authController.resetPassword);

router.use(authController.protect);
router.route('/updatePassword').patch(authController.updatePassword);
router.route('/updateMe').patch(userController.updateMe);
router.route('/Me').get(userController.getMe, userController.getuser);
router
  .route('/deleteMe')
  .delete(
    authController.restrictTo('admin', 'lead-guide'),
    userController.deleteMe
  );
router.route('/').get(userController.getallusers);
router
  .route('/:id')
  .get(userController.getuser)
  .patch(userController.updateuser)
  .delete(userController.deleteuser);

module.exports = router;
