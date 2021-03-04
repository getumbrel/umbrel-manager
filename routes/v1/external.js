import {Router as router} from 'express';

const auth = require('middlewares/auth.js');

const constants = require('utils/const.js');
const safeHandler = require('utils/safeHandler');

const {SocksProxyAgent} = require('socks-proxy-agent');
const fetch = require('node-fetch');

const agent = new SocksProxyAgent(`socks5h://${constants.TOR_PROXY_IP}:${constants.TOR_PROXY_PORT}`);

router.get('/price', auth.jwt, safeHandler(async (request, response) => {
  // Default to USD
  const currency = request.query.currency || 'USD';

  const apiResponse = await fetch(`https://min-api.cryptocompare.com/data/price?fsym=BTC&tsyms=${currency}`, {
    agent
  });

  if (apiResponse.data) {
    return response.status(constants.STATUS_CODES.OK).json(apiResponse.data);
  }

  return response.status(constants.STATUS_CODES.BAD_GATEWAY).json();
}));

module.exports = router;
