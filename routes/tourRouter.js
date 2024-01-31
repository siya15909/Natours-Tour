const express = require('express');
const controller = require('../controllers/tourController');
const authcontroller = require('../controllers/authController');
// const reviewController = require('../controllers/reviewController');
const reviewRouter = require('./reviewRouter');
//Routing
const router = express.Router();
// router.param('id', controller.checkId);
/*//POST tours/849412jk/reviews==> nested routes
router
  .route('/:tourId/reviews')
  .post(
    authcontroller.protect,
    authcontroller.restrictTo('user'),
    reviewController.createReview,
  );*/
router.use('/:tourId/reviews', reviewRouter);
router
  .route('/top-5-cheaps')
  .get(controller.aliasTopTours, controller.getAllTours);
router.route('/tour-stats').get(controller.getTourStats);
router
  .route('/monthly-plans/:year')
  .get(
    authcontroller.protect,
    authcontroller.restrictTo('lead-guide', 'admin', 'guide'),
    controller.getMonthlyPlans,
  );
router
  .route('/')
  .get(authcontroller.protect, controller.getAllTours)
  .post(
    authcontroller.protect,
    authcontroller.restrictTo('lead-guide', 'admin'),
    controller.createTour,
  );
router
  .route('/:id')
  .get(controller.getTour)
  .patch(
    authcontroller.protect,
    authcontroller.restrictTo('lead-guide', 'admin'),
    controller.updateTour,
  )
  .delete(
    authcontroller.protect,
    authcontroller.restrictTo('lead-guide', 'admin'),
    controller.deleteTour,
  );
// app.use('/api/v1/tours', tourRouter);
module.exports = router;
