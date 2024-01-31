const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const APIfeatures = require('../utils/apiFeatures');

exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);
    if (!doc) return next(new AppError('No document found with that Id', 404));
    res.status(204).json({
      status: 'success',
      data: null,
    });
    next();
  });
exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      runvalidators: true,
      new: true,
    });
    if (!doc) return next(new AppError('No document found with that Id', 404));
    res.status(200).json({
      status: 'success',
      data: doc,
    });
    next();
  });
exports.createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body);
    if (!doc) return next(new AppError('No document found with that Id', 404));
    res.status(201).json({
      status: 'success',
      data: doc,
    });
    next();
  });
exports.getOne = (Model, popOptions) =>
  catchAsync(async (req, res, next) => {
    let query;
    query = Model.findById(req.params.id);
    if (popOptions) query = query.populate(popOptions);
    const doc = await query;
    if (!doc) return next(new AppError('No document found with that Id', 404));
    res.status(200).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });
exports.getAll = (Model) =>
  catchAsync(async (req, res, next) => {
    let filter = {};
    if (req.params.tourId) filter = { tour: req.params.tourId };
    const features = new APIfeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    const doc = await features.query;
    res.status(200).json({
      status: 'success',
      requestedAt: req.requestTime,
      result: doc.length,
      data: {
        data: doc,
      },
    });
  });
