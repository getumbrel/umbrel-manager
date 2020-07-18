/* eslint-disable id-length */
module.exports = {
  REQUEST_CORRELATION_NAMESPACE_KEY: 'umbrel-manager-request',
  REQUEST_CORRELATION_ID_KEY: 'reqId',
  USER_FILE: process.env.USER_FILE || '/db/user.json',
  JWT_PUBLIC_KEY_FILE: process.env.JWT_PUBLIC_KEY_FILE || '/jwt-public-key/jwt.pem',
  JWT_PRIVATE_KEY_FILE: process.env.JWT_PRIVATE_KEY_FILE || '/jwt-private-key/jwt.key',
  DOCKER_COMPOSE_DIRECTORY: process.env.DOCKER_COMPOSE_DIRECTORY || '/docker-compose',
  UMBREL_DASHBOARD_HIDDEN_SERVICE_FILE: process.env.UMBREL_DASHBOARD_HIDDEN_SERVICE_FILE || '/var/lib/tor/web/hostname',
  GITHUB_REPO: process.env.GITHUB_REPO || 'getumbrel/umbrel',
  UPDATE_VERSION_FILE: process.env.UPDATE_VERSION_FILE || '/info.json',
  UPDATE_STATUS_FILE: process.env.UPDATE_STATUS_FILE || '/update/update-status.json',
  UPDATE_SIGNAL_FILE: process.env.UPDATE_SIGNAL_FILE || '/signals/update',
  UPDATE_LOCK_FILE: process.env.UPDATE_LOCK_FILE || '/statuses/update-in-progress',
  STATUS_CODES: {
    ACCEPTED: 202,
    BAD_GATEWAY: 502,
    CONFLICT: 409,
    FORBIDDEN: 403,
    OK: 200,
    UNAUTHORIZED: 401
  },
  TIME: {
    FIVE_MINUTES_IN_MILLIS: 5 * 60 * 1000,
    ONE_DAY_IN_MILLIS: 24 * 60 * 60 * 1000,
    ONE_SECOND_IN_MILLIS: 1000,
    ONE_HOUR_IN_MILLIS: 60 * 60 * 1000,
    NINETY_MINUTES_IN_MILLIS: 90 * 60 * 1000,
    HOURS_IN_TWO_DAYS: 47,
  }
};
