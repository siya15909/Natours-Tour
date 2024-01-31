const Tour = require('../models/tourModel');

class APIfeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    // eslint-disable-next-line node/no-unsupported-features/es-syntax
    const queryObject = { ...this.queryString };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach((el) => delete queryObject[el]);

    //// 1B) ADVANCED FILTERING
    let queryStr = JSON.stringify(queryObject);
    queryStr = queryStr.replace(/\b(lte|lt|gte|gt)\b/g, (match) => `$${match}`);
    this.query.find(JSON.parse(queryStr));
    //const query = Tour.find(JSON.parse(queryStr)); //query method
    return this;
  }

  /// 2) SORTING
  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else this.query = this.query.sort('-createdAt');
    return this;
  }

  ///3) LIMITING FIELDS
  limitFields() {
    if (this.queryString.fields) {
      const field = this.queryString.fields.split(',').join('');
      this.query = this.query.select(field);
    } else this.query = this.query.select('-__v'); //- indicates to exclude the query
    return this;
  }

  //4)PAGINATION
  paginate() {
    if (this.queryString.page || this.queryString.limit) {
      const page = this.queryString.page * 1 || 1;
      const limit = this.queryString.limit * 1 || 10;
      const skip = (page - 1) * limit;
      this.query = this.query.skip(skip).limit(limit);
      const number = Tour.countDocuments();
      if (skip >= number) throw new Error('This page does not exist!!');
    }
    // else {
    //   query = query.skip(0).limit(10);
    // }
    return this;
  }
}
module.exports = APIfeatures;
