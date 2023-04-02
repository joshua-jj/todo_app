const CustomAPIError = require('./custom-error.js');
const BadRequestError = require('./bad-request');
const AuthorizationError = require('./unauthenticated');
const NotFoundError = require('./not-found');

module.exports = {
  CustomAPIError,
  BadRequestError,
  AuthorizationError,
  NotFoundError,
};
