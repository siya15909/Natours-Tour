const express = require('express');
const controller = require('../controllers/reviewController');
const authController = require('../controllers/authController');

const router = express.Router({ mergeParams: true }); //To get access to the tourId as it is not mentioned in reviewRouter
router.use(authController.protect);
router
  .route('/')
  .get(controller.getAllReviews)
  .post(
    authController.protect,
    authController.restrictTo('user'),
    controller.setUserIds,
    controller.createReview,
  );
router
  .route('/:id')
  .get(controller.getReview)
  .delete(authController.restrictTo('admin', 'user'), controller.deleteReview)
  .patch(authController.restrictTo('admin', 'user'), controller.updateReview);
module.exports = router;
