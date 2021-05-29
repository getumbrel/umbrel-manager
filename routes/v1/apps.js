const express = require('express');
const router = express.Router();

const appsLogic = require('logic/apps.js');

const auth = require('middlewares/auth.js');

const constants = require('utils/const.js');
const safeHandler = require('utils/safeHandler');

router.get('/', auth.jwt, safeHandler(async (req, res) => {
    const query = {
      installed: req.query.installed === '1',
    };
    const apps = await appsLogic.get(query);

    return res.status(constants.STATUS_CODES.OK).json(apps);
}));

router.get('/updateRegistry', auth.jwt, safeHandler(async (req, res) => {
    await appsLogic.generateRegisty();
    return res.status(constants.STATUS_CODES.OK);
}));

router.post('/:id/install', auth.jwt, safeHandler(async (req, res) => {
    const {id} = req.params;
    const result = await appsLogic.install(id);

    return res.status(constants.STATUS_CODES.OK).json(result);
}));

router.post('/:id/uninstall', auth.jwt, safeHandler(async (req, res) => {
    const {id} = req.params;
    const result = await appsLogic.uninstall(id);

    return res.status(constants.STATUS_CODES.OK).json(result);
}));

module.exports = router;
