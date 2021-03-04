const express = require('express');
const pjson = require('../package.json');
const router = express.Router();

router.get('/', (request, res) => {
  res.json({version: 'umbrel-manager-' + pjson.version});
});

module.exports = router;
