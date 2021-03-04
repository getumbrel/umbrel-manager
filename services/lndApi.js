/* eslint-disable unicorn/filename-case */
const fetch = require('node-fetch');

const middlewareUrl = process.env.MIDDLEWARE_API_URL || 'http://localhost';
const middlewarePort = process.env.MIDDLEWARE_API_PORT || 3005;

async function changePassword(currentPassword, newPassword, jwt) {
  const headers = {
    Authorization: 'JWT ' + jwt,
    'Content-Type': 'application/json'
  };

  const body = {
    currentPassword,
    newPassword
  };

  return fetch(`${middlewareUrl}:${middlewarePort}/v1/lnd/wallet/changePassword`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body)
  });
}

async function initializeWallet(password, seed, jwt) {
  const headers = {
    Authorization: 'JWT ' + jwt,
    'Content-Type': 'application/json'
  };

  const body = {
    password,
    seed
  };

  return fetch(`${middlewareUrl}:${middlewarePort}/v1/lnd/wallet/init`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body)
  });
}

async function unlockLnd(password, jwt) {
  const headers = {
    Authorization: 'JWT ' + jwt,
    'Content-Type': 'application/json'
  };

  const body = {
    password
  };

  return fetch(`${middlewareUrl}:${middlewarePort}/v1/lnd/wallet/unlock`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body)
  });
}

async function getBitcoindAddresses(jwt) {
  const headers = {
    Authorization: 'JWT ' + jwt,
    'Content-Type': 'application/json'
  };

  return fetch(`${middlewareUrl}:${middlewarePort}/v1/bitcoind/info/addresses`, {
    method: 'POST',
    headers
  });
}

module.exports = {
  changePassword,
  initializeWallet,
  unlockLnd,
  getBitcoindAddresses
};
