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

router.get('/shutdown', auth.jwt, safeHandler(async (req, res) => {
    const result = await systemLogic.requestShutdown();

    return res.status(constants.STATUS_CODES.OK).json(result);
}));

module.exports = router;
