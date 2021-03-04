const express = require('express');
const router = express.Router();

const systemLogic = require('logic/system.js');

const auth = require('middlewares/auth.js');

const constants = require('utils/const.js');
const safeHandler = require('utils/safeHandler');

router.get('/info', auth.jwt, safeHandler(async (request, res) => {
  const info = await systemLogic.getInfo();

  return res.status(constants.STATUS_CODES.OK).json(info);
}));

router.get('/dashboard-hidden-service', auth.jwt, safeHandler(async (request, res) => {
  const url = await systemLogic.getHiddenServiceUrl();

  return res.status(constants.STATUS_CODES.OK).json(url);
}));

router.get('/electrum-connection-details', auth.jwt, safeHandler(async (request, res) => {
  const connectionDetails = await systemLogic.getElectrumConnectionDetails();

  return res.status(constants.STATUS_CODES.OK).json(connectionDetails);
}));

router.get('/bitcoin-p2p-connection-details', auth.jwt, safeHandler(async (request, res) => {
  const connectionDetails = await systemLogic.getBitcoinP2PConnectionDetails();

  return res.status(constants.STATUS_CODES.OK).json(connectionDetails);
}));

router.get('/bitcoin-rpc-connection-details', auth.jwt, safeHandler(async (request, res) => {
  const connectionDetails = await systemLogic.getBitcoinRPCConnectionDetails();

  return res.status(constants.STATUS_CODES.OK).json(connectionDetails);
}));

router.get('/lndconnect-urls', auth.jwt, safeHandler(async (request, res) => {
  const urls = await systemLogic.getLndConnectUrls();

  return res.status(constants.STATUS_CODES.OK).json(urls);
}));

router.get('/get-update', auth.jwt, safeHandler(async (request, res) => {
  const update = await systemLogic.getAvailableUpdate();

  return res.status(constants.STATUS_CODES.OK).json(update);
}));

router.get('/update-status', safeHandler(async (request, res) => {
  const update = await systemLogic.getUpdateStatus();

  return res.status(constants.STATUS_CODES.OK).json(update);
}));

router.post('/update', auth.jwt, safeHandler(async (request, res) => {
  const status = await systemLogic.startUpdate();

  return res.status(constants.STATUS_CODES.OK).json(status);
}));

router.get('/backup-status', safeHandler(async (request, res) => {
  const backup = await systemLogic.getBackupStatus();

  return res.status(constants.STATUS_CODES.OK).json(backup);
}));

router.post('/shutdown', auth.jwt, safeHandler(async (request, res) => {
  const result = await systemLogic.requestShutdown();

  return res.status(constants.STATUS_CODES.OK).json(result);
}));

router.post('/reboot', auth.jwt, safeHandler(async (request, res) => {
  const result = await systemLogic.requestReboot();

  return res.status(constants.STATUS_CODES.OK).json(result);
}));

module.exports = router;
