const express = require('express');
const router = express.Router();

const authLogic = require('logic/auth.js');

const auth = require('middlewares/auth.js');
const incorrectPasswordAuthHandler = require('middlewares/incorrectPasswordAuthHandler.js');

const constants = require('utils/const.js');
const safeHandler = require('utils/safeHandler');
const validator = require('utils/validator.js');

const COMPLETE = 100;

// Endpoint to change your lnd password. Wallet must exist and be unlocked.
router.post('/change-password', auth.convertReqBodyToBasicAuth, auth.basic, incorrectPasswordAuthHandler, safeHandler(async (request, res, next) => {
  // Use password from the body by default. Basic auth has issues handling special characters.
  const currentPassword = request.body.password;
  const newPassword = request.body.newPassword;

  const jwt = await authLogic.refresh(request.user);

  try {
    validator.isString(currentPassword);
    validator.isMinPasswordLength(currentPassword);
    validator.isString(newPassword);
    validator.isMinPasswordLength(newPassword);
    if (newPassword === currentPassword) {
      throw new Error('The new password must not be the same as existing password');
    }
  } catch (error) {
    return next(error);
  }

  const status = await authLogic.getChangePasswordStatus();

  // Return a conflict if a change password process is already running
  if (status.percent > 0 && status.percent !== COMPLETE) {
    return res.status(constants.STATUS_CODES.CONFLICT).json();
  }

  try {
    // Start change password process in the background and immediately return
    await authLogic.changePassword(currentPassword, newPassword, jwt.jwt);
    return res.status(constants.STATUS_CODES.OK).json();
  } catch (error) {
    return next(error);
  }
}));

// Returns the current status of the change password process.
router.get('/change-password/status', auth.jwt, safeHandler(async (request, res) => {
  const status = await authLogic.getChangePasswordStatus();

  return res.status(constants.STATUS_CODES.OK).json(status);
}));

// Registered does not need auth. This is because the user may not be registered at the time and thus won't always have
// an auth token.
router.get('/registered', safeHandler((request, res) =>
  authLogic.isRegistered()
    .then(registered => res.json(registered))
));

// Endpoint to register a password with the device. Wallet must not exist. This endpoint is authorized with basic auth
// or the property password from the body.
router.post('/register', auth.convertReqBodyToBasicAuth, auth.register, safeHandler(async (request, res, next) => {
  const seed = request.body.seed;

  if (seed.length !== 24) { // eslint-disable-line no-magic-numbers
    throw new Error('Invalid seed length');
  }

  try {
    validator.isString(request.body.name);
    validator.isString(request.user.plainTextPassword);
    validator.isMinPasswordLength(request.user.plainTextPassword);
  } catch (error) {
    return next(error);
  }

  const user = request.user;

  // Add name to user obj
  user.name = request.body.name;

  const jwt = await authLogic.register(user, seed);

  return res.json(jwt);
}));

router.post('/login', auth.convertReqBodyToBasicAuth, auth.basic, safeHandler(async (request, res) => {
  const jwt = await authLogic.login(request.user);

  return res.json(jwt);
}

));

router.get('/info', auth.jwt, safeHandler(async (request, res) => {
  const info = await authLogic.getInfo();

  return res.status(constants.STATUS_CODES.OK).json(info);
}));

router.post('/seed', auth.convertReqBodyToBasicAuth, auth.basic, incorrectPasswordAuthHandler, safeHandler(async (request, res) => {
  const seed = await authLogic.seed(request.user);

  return res.json(seed);
}

));

router.post('/refresh', auth.jwt, safeHandler((request, res) =>
  authLogic.refresh(request.user)
    .then(jwt => res.json(jwt))
));

module.exports = router;
