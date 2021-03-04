const passport = require('passport');
const passportJWT = require('passport-jwt');
const passportHTTP = require('passport-http');
const bcrypt = require('bcrypt');
const diskLogic = require('logic/disk.js');
const authLogic = require('logic/auth.js');
const NodeError = require('models/errors.js').NodeError;
const constants = require('utils/const.js');
const unauthorized = constants.STATUS_CODES.UNAUTHORIZED;
const UUID = require('utils/UUID.js');
const rsa = require('node-rsa');

const JwtStrategy = passportJWT.Strategy;
const BasicStrategy = passportHTTP.BasicStrategy;
const ExtractJwt = passportJWT.ExtractJwt;

const JWT_AUTH = 'jwt';
const REGISTRATION_AUTH = 'register';
const BASIC_AUTH = 'basic';

const SYSTEM_USER = UUID.fetchBootUUID() || 'admin';

const b64encode = string => Buffer.from(string, 'utf-8').toString('base64');
const b64decode = b64 => Buffer.from(b64, 'base64').toString('utf-8');

async function generateJWTKeys() {
  const key = new rsa({b: 512});

  const privateKey = key.exportKey('private');
  const publicKey = key.exportKey('public');

  await diskLogic.writeJWTPrivateKeyFile(privateKey);
  await diskLogic.writeJWTPublicKeyFile(publicKey);
}

async function createJwtOptions() {
  await generateJWTKeys();
  const pubKey = await diskLogic.readJWTPublicKeyFile();

  return {
    jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme('jwt'),
    secretOrKey: pubKey,
    algorithm: 'RS256'
  };
}

passport.serializeUser((user, done) => {
  return done(null, SYSTEM_USER);
});

passport.use(BASIC_AUTH, new BasicStrategy((username, password, next) => {
  password = b64decode(password);
  const user = {
    username: SYSTEM_USER,
    password,
    plainTextPassword: password
  };
  return next(null, user);
}));

createJwtOptions().then(data => {
  const jwtOptions = data;

  passport.use(JWT_AUTH, new JwtStrategy(jwtOptions, ((jwtPayload, done) => {
    return done(null, {username: SYSTEM_USER});
  })));
});

passport.use(REGISTRATION_AUTH, new BasicStrategy((username, password, next) => {
  password = b64decode(password);
  const credentials = authLogic.hashCredentials(SYSTEM_USER, password);

  return next(null, credentials);
}));

// Override the authorization header with password that is in the body of the request if basic auth was not supplied.
function convertRequestBodyToBasicAuth(request, response, next) {
  if (request.body.password && !request.headers.authorization) {
    // We need to Base64 encode because Passport breaks on ":" characters
    const password = b64encode(request.body.password);
    request.headers.authorization = 'Basic ' + Buffer.from(SYSTEM_USER + ':' + password).toString('base64');
  }

  next();
}

function basic(request, response, next) {
  passport.authenticate(BASIC_AUTH, {session: false}, (error, user) => {
    function handleCompare(equal) {
      if (!equal) {
        return next(new NodeError('Incorrect password', unauthorized));
      }

      request.logIn(user, error_ => {
        if (error_) {
          return next(new NodeError('Unable to authenticate', unauthorized));
        }

        return next(null, user);
      });
    }

    if (error || user === false) {
      return next(new NodeError('Invalid state', unauthorized));
    }

    diskLogic.readUserFile()
      .then(userData => {
        const storedPassword = userData.password;

        bcrypt.compare(user.password, storedPassword)
          .then(handleCompare)
          .catch(next);
      })
      .catch(() => next(new NodeError('No user registered', unauthorized)));
  })(request, response, next);
}

function jwt(request, response, next) {
  passport.authenticate(JWT_AUTH, {session: false}, (error, user) => {
    if (error || user === false) {
      return next(new NodeError('Invalid JWT', unauthorized));
    }

    request.logIn(user, error_ => {
      if (error_) {
        return next(new NodeError('Unable to authenticate', unauthorized));
      }

      return next(null, user);
    });
  })(request, response, next);
}

async function accountJWTProtected(request, response, next) {
  const isRegistered = await authLogic.isRegistered();
  if (isRegistered.registered) {
    passport.authenticate(JWT_AUTH, {session: false}, (error, user) => {
      if (error || user === false) {
        return next(new NodeError('Invalid JWT', unauthorized));
      }

      request.logIn(user, error_ => {
        if (error_) {
          return next(new NodeError('Unable to authenticate', unauthorized));
        }

        return next(null, user);
      });
    })(request, response, next);
  } else {
    return next(null, 'not-registered');
  }
}

function register(request, response, next) {
  passport.authenticate(REGISTRATION_AUTH, {session: false}, (error, user) => {
    if (error || user === false) {
      return next(new NodeError('Invalid state', unauthorized));
    }

    request.logIn(user, error_ => {
      if (error_) {
        return next(new NodeError('Unable to authenticate', unauthorized));
      }

      return next(null, user);
    });
  })(request, response, next);
}

module.exports = {
  basic,
  convertReqBodyToBasicAuth: convertRequestBodyToBasicAuth,
  jwt,
  register,
  accountJWTProtected
};
