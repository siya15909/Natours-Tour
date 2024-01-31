const sharp = require('sharp');
const multer = require('multer');
const AppError = require('../utils/appError');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handleFactory');
/* To get the file in our disk 
const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/img/users');
  },
  filename: (req, file, cb) => {
    const ext = file.mimetype.split('/')[1];
    cb(null, `user-${req.user.id}-${Date.now()}-${ext}`);
  },
});*/
//To get it as a buffer
const multerStorage = multer.memoryStorage();
const multiFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Please upload only images', 400));
  }
};
const upload = multer({ storage: multerStorage, fileFilter: multiFilter });
const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};
exports.updateUserPhoto = upload.single('photo');
exports.resizeUserPhoto = (req, res, next) => {
  if (!req.file) return next();
  req.file.filename = `user-${req.user.id}-${Date.now()}-jpeg`;
  sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);
  next();
};
exports.updateMe = async (req, res, next) => {
  //1) If the user wants to update password show error
  if (req.body.password || req.body.passwordConfirm)
    return next(
      new AppError('Kindly update password using updatePassword', 400),
    );
  //2)Filter out the objects
  const filteredBody = filterObj(req.body, 'name', 'email');
  if (req.file) filteredBody.photo = req.file.filename;
  //2)Update the user docs
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    runValidators: true,
    new: true,
  });
  res.status(200).json({
    status: 'success',
    user: updatedUser,
  });
};
exports.getMe = (req, res, next) => {
  if (!req.params.id) req.params.id = req.user.id;
  next();
};
/*
exports.getAllUsers = async (req, res, next) => {
  try {
    const user = await User.find();
    res.status(200).json({
      status: 'success',
      results: user.length,
      data: user,
    });
  } catch (err) {
    res.status(500).json({
      status: 'failed',
      message: err,
    });
  }
};*/
exports.getAllUsers = factory.getAll(User);
exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });
  res.status(204).json({
    status: 'success',
    data: null,
  });
});
exports.createUser = factory.createOne(User);
exports.getUser = factory.getOne(User);
// exports.getUser = (req, res) => {
//   res.status(500).json({
//     status: 'error',
//     message: 'Not defined here....',
//   });
// };
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);
