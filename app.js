const express = require('express');
const morgan = require('morgan');
const app = express();
const tourRouters = require('./routes/tourRoutes');
const userRouters = require('./routes/userRoutes');
const reviewRouters = require('./routes/reviewRoutes');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./utils/errorController');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
app.use(express.json());

const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!',
});
app.use('/api', limiter);

app.use(mongoSanitize());

app.use(xss());
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  })
);

app.use((req, res, next) => {
  console.log('Hello from the Middleware😎');
  next();
});
app.use((req, res, next) => {
  req.requesttime = new Date().toISOString();
  next();
});
app.use(express.static(`${__dirname}/public`));
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
app.use('/api/v1/tours', tourRouters);
app.use('/api/v1/users', userRouters);
app.use('/api/v1/review', reviewRouters);

app.all('*', (req, res, next) => {
  // res.status(404).json({
  //   status: 'fail',
  //   message: `Can't find the ${req.originalUrl} on this server`,
  // });
  // const err = new Error(`Can't find the ${req.originalUrl} on this server`);
  // err.statusCode = 404;
  // err.status = 'Fail';
  next(new AppError(`Can't find the ${req.originalUrl} on this server`, 404));
});
app.use(globalErrorHandler);
module.exports = app;
