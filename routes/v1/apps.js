const express = require('express');
const router = express.Router();

const appsLogic = require('logic/apps.js');

const auth = require('middlewares/auth.js');

const constants = require('utils/const.js');
const safeHandler = require('utils/safeHandler');

router.post('/:id/install', auth.jwt, safeHandler(async (req, res) => {
    const {id} = req.params;
    const result = await appsLogic.install(id);

    return res.status(constants.STATUS_CODES.OK).json(result);
}));

module.exports = router;
