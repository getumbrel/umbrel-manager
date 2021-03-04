/* eslint-disable unicorn/filename-case */

/* This safe handler is used to wrap our api methods
 * so that we always fallback and return an exception if there is an error
 * inside of an async function
 */
function safeHandler(handler) {
  return async (request, response, next) => {
    try {
      return handler(request, response, next);
    } catch (error) {
      return next(error);
    }
  };
}

module.exports = safeHandler;
