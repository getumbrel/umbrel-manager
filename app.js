require('module-alias/register');
require('module-alias').addPath('.');
require('dotenv').config();

const express = require('express');
const path = require('path');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const passport = require('passport');
const cors = require('cors');

// Keep requestCorrelationId middleware as the first middleware. Otherwise we risk losing logs.
const requestCorrelationMiddleware = require('middlewares/requestCorrelationId.js'); // eslint-disable-line id-length
const camelCaseReqMiddleware = require('middlewares/camelCaseRequest.js').camelCaseRequest;
const corsOptions = require('middlewares/cors.js').corsOptions;
const errorHandleMiddleware = require('middlewares/errorHandling.js');
require('middlewares/auth.js');

const logger = require('utils/logger.js');

const ping = require('routes/ping.js');
const account = require('routes/v1/account.js');
const system = require('routes/v1/system.js');
const external = require('routes/v1/external.js');
const apps = require('routes/v1/apps.js');

const app = express();

// Handles CORS
app.use(cors(corsOptions));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(passport.initialize());
app.use(passport.session());

app.use(requestCorrelationMiddleware);
app.use(camelCaseReqMiddleware);
app.use(morgan(logger.morganConfiguration));

app.use('/ping', ping);
app.use('/v1/account', account);
app.use('/v1/system', system);
app.use('/v1/external', external);
app.use('/v1/apps', apps);

app.use(errorHandleMiddleware);
app.use((req, res) => {
  res.status(404).json(); // eslint-disable-line no-magic-numbers
});

module.exports = app;
