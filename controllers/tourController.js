/* eslint-disable no-shadow */
/* eslint-disable no-console */
// const fs = require('fs');
const Tour = require('../models/tourModel');
const factory = require('./handleFactory');
const catchAsync = require('../utils/catchAsync');

exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

/*
const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`),
);
exports.checkId =
  ('id',
  (req, res, next, val) => {
    console.log(`The id in this port is ${val}`);
    if (req.params.id * 1 > tours.length) {
      return res.status(404).json({
        status: 'fail',
        message: 'Invalid ID',
      });
    }
    next();
  });
exports.checkBody = (req, res, next) => {
  if (!req.body.name || !req.body.price) {
    return res.status(400).json({
      status: 'bad request',
      message: 'No content',
    });
  }
  next();
};
exports.getAllTours = async (req, res) => {
  try {
    /*
  console.log(req.requestTime);
  res.status(200).json({
    status: 'success',
    requestedAt: req.requestTime,
    result: tours.length,
    data: {
      tours,
    },
  });
    ////// BUILD THE QUERY
    //// 1A) FILTERING
    const query = await Tour.find({
      duration: 5,
      difficulty: 'easy',
    }); //filter method

    console.log(req.query);
    // eslint-disable-next-line node/no-unsupported-features/es-syntax
    const queryObject = { ...req.query };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach((el) => delete queryObject[el]);

    //// 1B) ADVANCED FILTERING
    let queryStr = JSON.stringify(queryObject);
    queryStr = queryStr.replace(/\b(lte|lt|gte|gt)\b/g, (match) => `$${match}`);
    let query = Tour.find(JSON.parse(queryStr)); //query method
    // console.log(req.query, queryObject);
    /*const tours = await Tour.find()
      .where('difficulty')
      .equals('easy')
      .where('duration')
      .equals(5);//mongodb method

    /// 2) SORTING
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else query = query.sort('-createdAt');

    ///3) LIMITING FIELDS
    if (req.query.fields) {
      const field = req.query.fields.split(',').join(' ');
      query = query.select(field);
    } else query = query.select('-__v'); //- indicates to exclude the query
    //To hide something from the output always edit the schema select:false

    //4)PAGINATION
    if (req.query.page || req.query.limit) {
      const page = req.query.page * 1 || 1;
      const limit = req.query.limit * 1 || 10;
      const skip = (page - 1) * limit;
      query = await query.skip(skip).limit(limit);
      const number = await Tour.countDocuments();
      if (skip >= number) throw new Error('This page does not exist!!');
    }
    // else {
    //   query = query.skip(0).limit(10);
    // }
    ///EXECUTE THE QUERY
    const features = new APIfeatures(Tour.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    const tours = await features.query;

    //SEND RESPONSE
    res.status(200).json({
      status: 'success',
      // requestedAt: req.requestTime,
      result: tours.length,
      data: {
        tours,
      },
    });
  } catch (error) {
    console.log(error);
  }
}; 
exports.getTour = async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id).populate('review');
    res.status(200).json({
      status: 'success',
      data: {
        tours: tour,
      },
    });
  } catch (error) {
    res.status(404).json({
      status: 'fail',
      message: 'Invalid ID',
    });
  }
  console.log(req.params); //params == parameters passed
  const id = req.params.id * 1; //MUltiplying with 1 will convert string to number
  if (id > tours.length) {
      return res.status(404).json({
          status: 'fail',
          message: 'Invalid ID'
      });
  }
    const tour = tours.find((el) => el.id === id);
    if (!tour) {
      return res.status(404).json({
        status: 'fail',
        message: 'Invalid ID'
      });
    }
    res.status(200).json({
      status: 'success',
      // result: tours.length,
      data: {
        tours: tour,
      },
    });
};*/

exports.createTour = catchAsync(async (req, res) => {
  const newTour = await Tour.create(req.body);
  console.log(newTour);
  res.status(201).json({
    status: 'success',
    data: {
      tour: newTour,
    },
  });
}); /*
  try {
  console.log(req.body)
  const newId = tours[tours.length - 1].id + 1;
    const newTour = Object.assign({ id: newId }, req.body);
    tours.push(newTour);
    fs.writeFile(
      `${__dirname}/dev-data/data/tours-simple.json`,
      JSON.stringify(tours),
      (err) => {
        res.status(201).json({
          status: 'success',
          data: {
            tour: newTour,
          },
        });     }, 
      // res.send('Done');
    );
    //console.log(req.body);
    const newTour = await Tour.create(req.body);
    console.log(newTour);
    res.status(201).json({
      status: 'success',
      data: {
        tour: newTour,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error,
    });
  }
};
exports.updateTour = async (req, res) => {
    if (req.params.id * 1 > tours.length) {
      return res.status(404).json({
        status: 'fail',
        message: 'Invalid ID',
      });
    }
    res.status(200).json({
      status: 'success',
      data: {
        tour: 'Updated tour is here ..',
      },
    });
  try {
    //console.log(req.body);
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true, //to return the updated doc
      runValidators: true,
    });
    console.log(tour);
    res.status(200).json({
      status: 'success',
      data: {
        tour, //tour : tour , if the property name and value are same then we can mention it like just the value
      },
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error,
    });
  }
};*/
exports.getAllTours = factory.getAll(Tour);
exports.getTour = factory.getOne(Tour, 'review');
// exports.createTour = factory.createOne(Tour);
exports.updateTour = factory.updateOne(Tour);
exports.deleteTour = factory.deleteOne(Tour);
/* Factory
exports.deleteTour = async (req, res) => {
  
  if (req.params.id * 1 > tours.length) {
    return res.status(404).json({
      status: 'fail',
      message: 'Invalid ID',
    });
  }
  res.status(204).json({
    status: 'success',
    data: null,
  });
  try {
    await Tour.findByIdAndDelete(req.params.id);
    res.status(204).json({
      status: 'success',
      data: null,
    });
    console.log(req.body);
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: 'Invalid data send',
    });
  }
};*/
exports.getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
    {
      $group: {
        _id: { $toUpper: '$difficulty' },
        //_id:'$difficulty',
        numTours: { $sum: 1 }, //1 will be added with each doc
        numRatings: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    {
      $sort: { avgPrice: 1 },
    },
    {
      $match: { _id: { $ne: 'EASY' } },
    },
  ]);
  res.status(200).json({
    status: 'success',
    data: {
      stats,
    },
  });
  next();
});
exports.getMonthlyPlans = catchAsync(async (req, res, next) => {
  const year = req.param.year * 1;
  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates',
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year} - 01 - 01`),
          //$lte: new Date(`${year} - 12 - 31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numTourStarts: { $sum: 1 },
        tours: { $push: '$name' },
      },
    },
    {
      $addFields: { month: '$_id' },
    },
    {
      $project: {
        _id: 0,
      },
    },
    {
      $sort: { numTourStarts: -1 },
    },
    {
      $limit: 12,
    },
  ]);
  res.status(200).json({
    status: 'success',
    data: {
      plan,
    },
  });
  next();
});
