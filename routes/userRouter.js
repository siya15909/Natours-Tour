const express = require('express');
const controller = require('../controllers/userController');
const authcontroller = require('../controllers/authController');

const router = express.Router();
router.route('/signup').post(authcontroller.signup);
router.route('/login').post(authcontroller.login);
router.route('/forgetPassword').post(authcontroller.forgotPassword);
router.route('/resetpassword/:token').patch(authcontroller.resetPassword);
//To protect all the routes after this middleware
router.use(authcontroller.protect);
router.route('/updatePassword/:id').patch(authcontroller.updatePassword);
router
  .route('/UpdateMe')
  .patch(
    controller.updateUserPhoto,
    controller.resizeUserPhoto,
    controller.updateMe,
  );
router.route('/deleteme').delete(controller.deleteMe);
router.route('/getMe').get(controller.getMe, controller.getUser);
router.use(authcontroller.restrictTo('admin'));
router.route('/').get(controller.getAllUsers).post(controller.createUser);
router
  .route('/:id')
  .get(controller.getUser)
  .patch(controller.updateUser)
  .delete(controller.deleteUser);
// app.use('/api/v1/users', router);
module.exports = router;
