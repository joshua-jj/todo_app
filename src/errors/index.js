const CustomAPIError = require('./custom-error.js');
const BadRequestError = require('./bad-request');
const AuthorizationError = require('./unauthenticated');

module.exports = {
  CustomAPIError,
  BadRequestError,
  AuthorizationError,
};
