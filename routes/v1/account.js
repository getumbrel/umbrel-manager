const express = require('express');
const router = express.Router();

// const applicationLogic = require('logic/application.js');
const authLogic = require('logic/auth.js');

const auth = require('middlewares/auth.js');
const incorrectPasswordAuthHandler = require('middlewares/incorrectPasswordAuthHandler.js');

const constants = require('utils/const.js');
const safeHandler = require('utils/safeHandler');
const validator = require('utils/validator.js');

const COMPLETE = 100;

router.post('/change-name', auth.jwt, safeHandler(async (req, res, next) => {
    const newName = req.body.newName;

    try {
        validator.isString(newName);
    } catch (error) {
        return next(error);
    }

    const status = await authLogic.getChangeNameStatus();

    // return a conflict if a change name process is already running
    if (status.percent > 0 && status.percent !== COMPLETE) {
        return res.status(constants.STATUS_CODES.CONFLICT).json();
    }

    try {
        // start change name process in the background and immediately return
        await authLogic.changeName(newName);
        return res.status(constants.STATUS_CODES.OK).json();
    } catch (error) {
        return next(error);
    }
}));

// Endpoint to change your password.
router.post('/change-password', auth.convertReqBodyToBasicAuth, auth.basic, incorrectPasswordAuthHandler, safeHandler(async (req, res, next) => {
    // Use password from the body by default. Basic auth has issues handling special characters.
    const currentPassword = req.body.password;
    const newPassword = req.body.newPassword;

    const jwt = await authLogic.refresh(req.user);

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

    // return a conflict if a change password process is already running
    if (status.percent > 0 && status.percent !== COMPLETE) {
        return res.status(constants.STATUS_CODES.CONFLICT).json();
    }

    try {
        // start change password process in the background and immediately return
        await authLogic.changePassword(currentPassword, newPassword, jwt.jwt);
        return res.status(constants.STATUS_CODES.OK).json();
    } catch (error) {
        return next(error);
    }
}));

// Returns the current status of the change password process.
router.get('/change-password/status', auth.jwt, safeHandler(async (req, res) => {
    const status = await authLogic.getChangePasswordStatus();

    return res.status(constants.STATUS_CODES.OK).json(status);
}));

// Registered does not need auth. This is because the user may not be registered at the time and thus won't always have
// an auth token.
router.get('/registered', safeHandler((req, res) =>
    authLogic.isRegistered()
        .then(registered => res.json(registered))
));

// Endpoint to register a password with the device. Wallet must not exist. This endpoint is authorized with basic auth
// or the property password from the body.
router.post('/register', auth.convertReqBodyToBasicAuth, auth.register, safeHandler(async (req, res, next) => {

    const seed = req.body.seed;

    if (seed.length !== 24) { // eslint-disable-line no-magic-numbers
        throw new Error('Invalid seed length');
    }

    try {
        validator.isString(req.body.name);
        validator.isString(req.user.plainTextPassword);
        validator.isMinPasswordLength(req.user.plainTextPassword);
    } catch (error) {
        return next(error);
    }

    const user = req.user;

    //add name to user obj
    user.name = req.body.name;

    const jwt = await authLogic.register(user, seed);

    return res.json(jwt);
}));

router.post('/login', auth.convertReqBodyToBasicAuth, auth.basic, safeHandler(async (req, res) => {
    const jwt = await authLogic.login(req.user);

    return res.json(jwt);
}

));

router.get('/info', auth.jwt, safeHandler(async (req, res) => {
    const info = await authLogic.getInfo();

    return res.status(constants.STATUS_CODES.OK).json(info);
}));

router.post('/seed', auth.convertReqBodyToBasicAuth, auth.basic, incorrectPasswordAuthHandler, safeHandler(async (req, res) => {
    const seed = await authLogic.seed(req.user);

    return res.json(seed);
}

));

router.post('/refresh', auth.jwt, safeHandler((req, res) =>
    authLogic.refresh(req.user)
        .then(jwt => res.json(jwt))
));

module.exports = router;
