/* eslint-disable no-console */
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const app = require('./app');

process.on('uncaughtException', (err) => {
  console.log(err.name, err.message);
  console.log('UNCAUGHT EXCEPTION! ,, Shutting down...');
  process.exit(1);
});
dotenv.config({ path: './config.env' });
const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD,
);
console.log(DB);
async function connection() {
  try {
    await mongoose.connect(DB);
    console.log('Connected to DB');
  } catch (error) {
    console.error(error);
  }
}
connection();
// console.log(connection);

// const testTour = new Tour({
//   name: 'The Forest Hiker',
//   rating: 4.7,
//   price: 497,
// });
// const testTour = new Tour({
//   name: 'The Park Camper',
//   price: 997,
// });
// testTour
//   .save()
//   .then((doc) => {
//     console.log(doc);
//   })
//   .catch((err) => {
//     console.log('ERRORRRRR :', err);
//   });
const port = process.env.PORT;
const server = app.listen(port, () => {
  // eslint-disable-next-line prettier/prettier, no-console
    console.log(`App runnning on port ${port}....`);
  // console.log(process.env);
});
process.on('unhandledRejection', (err) => {
  console.log(err.name, err.message);
  console.log('UNHANDLES REJECTION! ,, Shutting down...');
  server.close(() => {
    process.exit(1);
  });
});
