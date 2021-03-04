const UUID = require('utils/UUID.js');
const constants = require('utils/const.js');
const createNamespace = require('continuation-local-storage').createNamespace;
const apiRequest = createNamespace(constants.REQUEST_CORRELATION_NAMESPACE_KEY);

function addCorrelationId(request, res, next) {
  apiRequest.bindEmitter(request);
  apiRequest.bindEmitter(res);
  apiRequest.run(() => {
    apiRequest.set(constants.REQUEST_CORRELATION_ID_KEY, UUID.create());
    next();
  });
}

module.exports = addCorrelationId;
