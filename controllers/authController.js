/* eslint-disable no-console */
const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const crypto = require('crypto');
const User = require('../models/userModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const sendEmail = require('../utils/email');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

const createSendToken = (user, statusCode, res) => {
  console.log(statusCode);
  const token = signToken(user._id);
  console.log(token);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000,
    ),
    httpOnly: true,
  };
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
  res.cookie('jwt', token, cookieOptions);
  user.password = undefined;
  res.status(statusCode).json({
    status: 'success',
    data: {
      user,
      token: token,
    },
  });
};
exports.signup = async (req, res, next) => {
  try {
    const newUser = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      passwordConfirm: req.body.passwordConfirm,
      photo: req.body.photo,
      changedPasswordAt: req.body.changedPasswordAt,
      role: req.body.role,
    });
    createSendToken(newUser, 200, res);
  } catch (err) {
    res.status(500).json({
      status: 'failed',
      message: err,
    });
  }
};
exports.login = async (req, res, next) => {
  try {
    // const email = req.body.email;
    // const password = req.body.password; These 2 statements are same as follows :
    const { email, password } = req.body;
    if (!email || !password)
      return next(new AppError('Please provide email and password ', 400)); //To check whether the email and password exists
    const user = await User.findOne({ email: email }).select('+password'); //email:email is same as{email} & + is used bcuz default selection of password is false => To check the user exists and password is correct
    if (!user || !(await user.correctPassword(password, user.password))) {
      //Instance method)
      return next(new AppError('Invalid mail-id or password', 401));
    }
    console.log(user);
    createSendToken(user, 200, res); //If everything is ok , send token to the client .
  } catch (err) {
    res.status(400).json({
      status: 'failed',
      error: err,
    });
  }
};
//When we are using findOne if the doc is not present , it will return null and the catch block will not find the error
exports.protect = catchAsync(async (req, res, next) => {
  //1Getting token check whether the token is correct
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }
  if (!token) {
    next(new AppError('U are not logged in. Please log in to get access', 401));
  }

  //Verify the token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  //Check if the user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(new AppError('The user with this token doesnot exist', 401));
  }

  //Check whether user changed password after the token was issued
  if (currentUser.changedPassword(decoded.iat)) {
    return next(
      new AppError(
        'User has recently changed password. Please login again',
        401,
      ),
    );
  }
  //Grant access to protected route
  req.user = currentUser;
  next();
});
exports.isLoggedIn = catchAsync(async (req, res, next) => {
  //1)Verify token
  if (req.cookies.jwt) {
    const decoded = await promisify(jwt.verify)(
      req.cookies.jwt,
      process.env.JWT_SECRET,
    );
    //2)Check if the user still exists
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return next();
    }
    //3)//Check whether user changed password after the token was issued
    if (currentUser.changedPassword(decoded.iat)) {
      return next();
    }
    //There is a logged user
    req.locals.user = currentUser;
    return next();
  }
  next();
});
exports.restrictTo =
  (
    ...roles //...because roles is an array
  ) =>
  (req, res, next) => {
    console.log('restricted');
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403),
      );
    }
    console.log(req.user.role);
    next();
  };
exports.forgotPassword = catchAsync(async (req, res, next) => {
  //1) Get user based on POSTed email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('There is no user with email addresses.', 404));
  }
  //2) Generate the random reset token
  const resetToken = user.createPasswordToken();
  await user.save({ validateBeforeSave: false });

  //3) Send it to user's email
  try {
    const resetURL = `${req.protocol}://${req.get(
      'host',
    )}/api/v1/users/resetPassword/${resetToken}`;
    const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nIf you didn't forget your password, please ignore this email`;
    await sendEmail({
      email: user.email,
      subject: 'Your password reset token',
      message,
    });
    res.status(200).json({
      status: 'sucsess',
      message: 'Token sent to client',
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(
      new AppError(
        'There was an error sending the emails.Please try again later',
        500,
      ),
    );
  }
});
exports.resetPassword = catchAsync(async (req, res, next) => {
  //1)Get user based on the token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');
  console.log(hashedToken);
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });
  console.log(user);
  //2)If token has not expires, and there is user , set the new password
  if (!user) {
    return next(new AppError('Token is invaid or has expired', 400));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  //3)Update changedPasswordAt property for the user
  //4)Log the user in , send JWT
  createSendToken(user, 200, res);
});
exports.updatePassword = catchAsync(async (req, res, next) => {
  //1) Get the user from collection
  const user = await User.findById(req.params.id).select('+password');
  console.log(req.params.id);
  //2) Check if the POSTed password is correct
  if (!(await user.correctPassword(req.body.password, user.password)))
    next(new AppError('Entered password incorrect!!Try again'));
  //3)If so , update password
  user.password = req.body.newpassword;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();
  //4)Log user in , send jwt
  createSendToken(user, 200, res);
});
