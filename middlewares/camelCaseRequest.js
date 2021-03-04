const camelizeKeys = require('camelize-keys');

function camelCaseRequest(request, res, next) {
  if (request && request.body) {
    request.body = camelizeKeys(request.body, '_');
  }

  next();
}

module.exports = {
  camelCaseRequest
};
