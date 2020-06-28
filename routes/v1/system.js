const express = require('express');
const router = express.Router();

const systemLogic = require('logic/system.js');

const auth = require('middlewares/auth.js');

const constants = require('utils/const.js');
const safeHandler = require('utils/safeHandler');


router.get('/dashboard-hidden-service', auth.jwt, safeHandler(async (req, res) => {
    const url = await systemLogic.getHiddenServiceUrl();

    return res.status(constants.STATUS_CODES.OK).json(url);
}));

router.get('/get-update', auth.jwt, safeHandler(async (req, res) => {
    const update = await systemLogic.getAvailableUpdate();

    return res.status(constants.STATUS_CODES.OK).json(update);
}));

router.get('/update-status', auth.jwt, safeHandler(async (req, res) => {
    const update = await systemLogic.getUpdateStatus();

    return res.status(constants.STATUS_CODES.OK).json(update);
}));

router.post('/update', auth.jwt, safeHandler(async (req, res) => {
    const status = await systemLogic.startUpdate();

    return res.status(constants.STATUS_CODES.OK).json(status);
}));

module.exports = router;
