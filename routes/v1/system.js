const express = require('express');
const router = express.Router();

const systemLogic = require('logic/system.js');

const auth = require('middlewares/auth.js');

const constants = require('utils/const.js');
const safeHandler = require('utils/safeHandler');

router.get('/info', auth.jwt, safeHandler(async (req, res) => {
    const info = await systemLogic.getInfo();

    return res.status(constants.STATUS_CODES.OK).json(info);
}));

router.get('/dashboard-hidden-service', auth.jwt, safeHandler(async (req, res) => {
    const url = await systemLogic.getHiddenServiceUrl();

    return res.status(constants.STATUS_CODES.OK).json(url);
}));

router.get('/bitcoin-p2p-hidden-service', auth.jwt, safeHandler(async (req, res) => {
    const url = await systemLogic.getBitcoinP2PHiddenServiceUrl();

    return res.status(constants.STATUS_CODES.OK).json(url);
}));

router.get('/get-update', auth.jwt, safeHandler(async (req, res) => {
    const update = await systemLogic.getAvailableUpdate();

    return res.status(constants.STATUS_CODES.OK).json(update);
}));

router.get('/update-status', safeHandler(async (req, res) => {
    const update = await systemLogic.getUpdateStatus();

    return res.status(constants.STATUS_CODES.OK).json(update);
}));

router.post('/update', auth.jwt, safeHandler(async (req, res) => {
    const status = await systemLogic.startUpdate();

    return res.status(constants.STATUS_CODES.OK).json(status);
}));

router.post('/shutdown', auth.jwt, safeHandler(async (req, res) => {
    const result = await systemLogic.requestShutdown();

    return res.status(constants.STATUS_CODES.OK).json(result);
}));

router.post('/reboot', auth.jwt, safeHandler(async (req, res) => {
    const result = await systemLogic.requestReboot();

    return res.status(constants.STATUS_CODES.OK).json(result);
}));

module.exports = router;
