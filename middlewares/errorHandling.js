/* eslint-disable no-unused-vars, no-magic-numbers */
const logger = require('utils/logger.js');
const constants = require('utils/const.js');

function handleError(error, request, res, next) {
  const statusCode = error.statusCode || constants.STATUS_CODES.SERVER_ERROR;
  const route = request.url || '';
  const message = error.message || '';

  logger.error(message, route, error.stack);

  res.status(statusCode).json(message);
}

module.exports = handleError;
