const bashService = require('services/bash.js');
const {v4: uuidv4} = require('uuid');

function fetchBootUUID() {
  bashService.exec('cat', ['/proc/sys/kernel/random/boot_id'], {})
    .then(uuid => Promise.resolve(uuid))
    .catch(() => Promise.resolve());
}

module.exports = {
  create: uuidv4,
  fetchBootUUID
};
