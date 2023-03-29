const {CustomAPIError} = require('../errors');
const { StatusCodes } = require('http-status-codes');

const errorHandlerMiddleware = (err, req, res, next) => {
  const arr = err.message.split('.');
  const length = arr.length;
  const duplicate = arr[length - 1];
  console.log(err);
  if (err instanceof CustomAPIError) {
    return res.status(err.statusCode).json({ msg: err.message })
  }

  if (err.code === 'ER_DUP_ENTRY' && duplicate === "username'") {
    return res.status(StatusCodes.CONFLICT).send('Username already exists.');
  }

  if (err.code === 'ER_DUP_ENTRY' && duplicate === "email'") {
    return res.status(StatusCodes.CONFLICT).send('Email already exists.');
  }

  return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send('Something went wrong try again later')
}

module.exports = errorHandlerMiddleware
