/* eslint-disable id-length */
module.exports = {
  REQUEST_CORRELATION_NAMESPACE_KEY: 'umbrel-manager-request',
  USER_PASSWORD_FILE: process.env.USER_PASSWORD_FILE || '/home/umbrel/db/user.json',
  JWT_PUBLIC_KEY_FILE: process.env.JWT_PUBLIC_KEY_FILE || '/home/umbrel/db/jwt/jwt.pem',
  JWT_PRIVATE_KEY_FILE: process.env.JWT_PRIVATE_KEY_FILE || '/home/umbrel/db/jwt/jwt.key',
  REQUEST_CORRELATION_ID_KEY: 'reqId',
  STATUS_CODES: {
    ACCEPTED: 202,
    BAD_GATEWAY: 502,
    CONFLICT: 409,
    FORBIDDEN: 403,
    OK: 200,
    UNAUTHORIZED: 401
  },
};
