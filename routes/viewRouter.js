const express = require('express');
const Controller = require('../controllers/viewController');
const authController = require('../controllers/authController');

const router = express.Router();
router.get('/',  Controller.getOverview);
router.get('/tours/:slug', authController.isLoggedIn, Controller.getTour);
router.get('/login', authController.isLoggedIn, Controller.getloginForm);
router.get('/me', authController.protect, Controller.getAccount);

router.post(
  '/submit-user-data',
  authController.protect,
  Controller.updateUserData,
);

module.exports = router;
