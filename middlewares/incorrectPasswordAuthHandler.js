/* eslint-disable no-unused-vars, no-magic-numbers */
const constants = require('utils/const.js');
const NodeError = require('models/errors.js').NodeError;

function handleError(error, req, res, next) {

  // If a incorrect password was given, respond with 403 instead of 401.
  // Reasoning: sending 401 on a request such as when the user tries to 
  // change password with an incorrect password or enters an incorrect
  // password to view seed will log him out due to interceptor on front-end
  if (error.message && error.message === 'Incorrect password') {

    return next(new NodeError('Incorrect password', 403));
  } else {

    return next();
  }

}

module.exports = handleError;
