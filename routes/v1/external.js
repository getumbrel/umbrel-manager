const express = require('express');
const router = express.Router();

const auth = require('middlewares/auth.js');

const constants = require('utils/const.js');
const safeHandler = require('utils/safeHandler');

const {SocksProxyAgent} = require('socks-proxy-agent');
const axios = require('axios');

const agent = new SocksProxyAgent(`socks5h://${constants.TOR_PROXY_IP}:${constants.TOR_PROXY_PORT}`);

router.get('/price', auth.jwt, safeHandler(async(req, res) => {
  // Default to USD
  const currency = req.query.currency || "USD";
  const response = await axios({
    url: `https://min-api.cryptocompare.com/data/price?fsym=BTC&tsyms=${currency}`,
    httpsAgent: agent,
    method: 'GET'
  });

  if (response.data) {
    return res.status(constants.STATUS_CODES.OK).json(response.data);
  }

  return res.status(constants.STATUS_CODES.BAD_GATEWAY).json();
}));

router.post('/upload', auth.jwt, safeHandler(async(req, res) => {
  const {data} = req.body;

  const response = await axios({
    url: 'https://umbrel-paste.vercel.app/documents',
    data,
    httpsAgent: agent,
    method: 'POST',
    headers: {
      'Content-Type': 'text/plain',
    }
  });

  if (!(response.data && response.data.key)) {
    return res.status(500).json('Unable to upload data');
  }

  const url = `https://umbrel-paste.vercel.app/${response.data.key}`;
  return res.status(constants.STATUS_CODES.OK).json(url);
}));

module.exports = router;
