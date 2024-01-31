/* eslint-disable no-console */
const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongosanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieparser = require('cookie-parser');
const tourRouter = require('./routes/tourRouter');
const userRouter = require('./routes/userRouter');
const reviewRouter = require('./routes/reviewRouter');
const viewRouter = require('./routes/viewRouter');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

const app = express();
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));
// 1) GLOBAL MIDDLE WARE
//Serving static files
app.use(express.static(path.join(__dirname, 'public')));
//Securing http headers
app.use(helmet());
//Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
//Limit resources from same API
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'To many requests from the IP , try after one hour',
});
app.use('/api', limiter);
//Body parser , reading data from body to req.body
app.use(express.json({ limit: '10kb' }));
app.use(cookieparser());

//Data Sanitization against NoSQL query injection
app.use(mongosanitize()); //against mongoose operators

//Data Sanitization against XSS
app.use(xss()); //Against html code

//Preventing parameter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupsize',
      'difficulty',
      'price',
    ],
  }),
);
/*
///////////////Creating own middleware.
app.use((req, res, next) => {
  // eslint-disable-next-line no-console
  console.log('Hello from the middleware');
  next();
});
app.get('/overview', (req, res) => {
  res.status(200).render('overview', {
    title: 'All Tours',
  });
});
app.get('/tour', (req, res) => {
  res.status(200).render('tour', {
    title: 'Himalayan',
  });
});
*/
//Test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log(req.cookies);
  next();
});
// app.get('/', (req, res) => { //tells the server what to do when a get request at the given route is called
//     res.status(404).json({ message: 'Its a new server ', name: "natours" });
// });
// app.post('/', (req, res) => {
//     res.status(404).send("U can post this .....");
// });

//2) ROUTE HANDLERS
// const tours = JSON.parse(fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`));
// const getAllTours = (req, res) => {
//     console.log(req.requestTime);
//     res.status(200).json({
//         status: 'success', requestedAt: req.requestTime, result: tours.length, data: {
//             tours
//         }
//     });
// }
// const getTour = (req, res) => {
//     console.log(req.params);//params == parameters passed
//     const id = req.params.id * 1; //MUltiplying with 1 will convert string to number
//     // if (id > tours.length) {
//     //     return res.status(404).json({
//     //         status: 'fail',
//     //         message: 'Invalid ID'
//     //     });
//     // }
//     const tour = tours.find(el => el.id === id);
//     if (!tour) {
//         return res.status(404).json({
//             status: 'fail',
//             message: 'Invalid ID'
//         });
//     }
//     res.status(200).json({
//         status: 'success',
//         // result: tours.length,
//         data: {
//             tours: tour
//         }
//     });
// }
// const createTour = (req, res) => {
//     // console.log(req.body)
//     const newId = tours[tours.length - 1].id + 1;
//     const newTour = Object.assign({ id: newId }, req.body);
//     tours.push(newTour);
//     fs.writeFile(`${__dirname}/dev-data/data/tours-simple.json`, JSON.stringify(tours), err => {
//         res.status(201).json({
//             status: "success", data: {
//                 tour: newTour
//             }
//         });
//     });
//     // res.send('Done');
// }
// const updateTour = (req, res) => {
//     if (req.params.id * 1 > tours.length) {
//         return res.status(404).json({
//             status: 'fail',
//             message: 'Invalid ID'
//         });
//     }
//     res.status(200).json({
//         status: 'success',
//         data: {
//             tour: 'Updated tour is here ..'
//         }
//     });
// }
// const deleteTour = (req, res) => {
//     if (req.params.id * 1 > tours.length) {
//         return res.status(404).json({
//             status: 'fail',
//             message: 'Invalid ID'
//         });
//     }
//     res.status(204).json({
//         status: 'success',
//         data: null
//     });
// }
// const getAllUsers = ((req, res) => {
//     res.status(500).json({
//         status: 'error', message: "Not defined here...."
//     });
// });
// const createUser = ((req, res) => {
//     res.status(500).json({
//         status: 'error', message: "Not defined here...."
//     });
// });
// const getUser = ((req, res) => {
//     res.status(500).json({
//         status: 'error', message: "Not defined here...."
//     });
// });
// const updateUser = ((req, res) => {
//     res.status(500).json({
//         status: 'error', message: "Not defined here...."
//     });
// });
// const deleteUser = ((req, res) => {
//     res.status(500).json({
//         status: 'error', message: "Not defined here...."
//     });
// });

//3) ROUTE
/*
app.get('/', (req, res) => {
  res.status(200).render('base', {
    user: 'SIYA',
    tour: 'HIMALAYAN',
  });
});
app.get('/api/v1/tours', getAllTours);
app.get('/api/v1/tours/:id', getTour);
app.post('/api/v1/tours', createTour);
app.patch('/api/v1/tours/:id', updateTour);
app.delete('/api/v1/tours/:id', deleteTour);

app.route('/api/v1/tours').get(getAllTours).post(createTour);
app.route('/api/v1/tours/:id').get(getTour).patch(updateTour).delete(deleteTour);
app.route('/api/v1/users').get(getAllUsers).post(createUser);
app.route('/api/v1/tours/:id').get(getUser).patch(updateUser).delete(deleteUser);

mounting : tourRouter
const tourRouter = express.Router();
tourRouter.route('/').get(getAllTours).post(createTour);
tourRouter.route('/:id').get(getTour).patch(updateTour).delete(deleteTour);

mounting : userRouter
const userRouter = express.Router();
userRouter.route('/').get(getAllUsers).post(createUser);
userRouter.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);
*/
app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
//To handle all the wrong routes
app.all('*', (req, res, next) => {
  // res.status(404).json({
  //   status: 'fail',
  //   message: `Can't find ${req.originalUrl} on this server`,
  // });
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});
//Global Error middleware
app.use(globalErrorHandler);

// 4) START SERVER
// const port = 3001;
// app.listen(port, () => {
//     console.log(`App runnning on port ${port}....`);
// });
module.exports = app;
