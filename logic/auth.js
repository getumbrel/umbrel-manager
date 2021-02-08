const path = require('path');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { CipherSeed } = require('aezeed');
const iocane = require("iocane");
const compose = require("docker-compose");
const diskLogic = require('logic/disk.js');
const lndApiService = require('services/lndApi.js');
const bashService = require('services/bash.js');
const NodeError = require('models/errors.js').NodeError;
const JWTHelper = require('utils/jwt.js');
const constants = require('utils/const.js');
const UUID = require('utils/UUID.js');

const saltRounds = 10;
const SYSTEM_USER = UUID.fetchBootUUID() || 'admin';

let devicePassword = '';
let changePasswordStatus;

resetChangePasswordStatus();

function resetChangePasswordStatus() {
    changePasswordStatus = { percent: 0 };
}

async function sleepSeconds(seconds) {
    return new Promise(resolve => {
        setTimeout(resolve, seconds * constants.TIME.ONE_SECOND_IN_MILLIS);
    });
}

// Caches the password.
function cachePassword(password) {
    devicePassword = Buffer.from(password, "base64").toString("utf-8");
}

// Gets the cached the password.
function getCachedPassword() {
    return devicePassword;
}

// Change the device and lnd password.
async function changePassword(currentPassword, newPassword, jwt) {

    currentPassword = Buffer.from(currentPassword, "base64").toString("utf-8");
    newPassword = Buffer.from(newPassword, "base64").toString("utf-8");

    resetChangePasswordStatus();
    changePasswordStatus.percent = 1; // eslint-disable-line no-magic-numbers

    // restart lnd
    try {
        await compose.restartOne('lnd', { cwd: constants.DOCKER_COMPOSE_DIRECTORY });
    } catch (error) {
        throw new Error('Unable to change password as lnd wouldn\'t restart');
    }

    changePasswordStatus.percent = 40; // eslint-disable-line no-magic-numbers

    let complete = false;
    let attempt = 0;
    const MAX_ATTEMPTS = 20;

    do {
        try {
            attempt++;

            // call lnapi to change password
            changePasswordStatus.percent = 60 + attempt; // eslint-disable-line no-magic-numbers
            await lndApiService.changePassword(currentPassword, newPassword, jwt);

            // update user file
            const user = await diskLogic.readUserFile();
            const credentials = hashCredentials(SYSTEM_USER, newPassword);

            // re-encrypt seed with new password
            const decryptedSeed = await iocane.createSession().decrypt(user.seed, currentPassword);
            const encryptedSeed = await iocane.createSession().encrypt(decryptedSeed, newPassword);

            // update user file
            await diskLogic.writeUserFile({ ...user, password: credentials.password, seed: encryptedSeed });

            // update ssh password
            // await hashAccountPassword(newPassword);

            complete = true;

            // cache the password for later use
            cachePassword(newPassword);

            changePasswordStatus.percent = 100;
        } catch (error) {

            // wait for lnd to boot up
            if (error.response.status === constants.STATUS_CODES.BAD_GATEWAY) {
                await sleepSeconds(1);

                // user supplied incorrect credentials
            } else if (error.response.status === constants.STATUS_CODES.FORBIDDEN) {
                changePasswordStatus.unauthorized = true;

                // unknown error occurred
            } else {
                changePasswordStatus.error = true;
                changePasswordStatus.percent = 100;

                throw error;
            }
        }
    } while (!complete && attempt < MAX_ATTEMPTS && !changePasswordStatus.unauthorized && !changePasswordStatus.error);

    if (!complete && attempt === MAX_ATTEMPTS) {
        changePasswordStatus.error = true;
        changePasswordStatus.percent = 100;

        throw new Error('Unable to change password');
    }

}

function getChangePasswordStatus() {
    return changePasswordStatus;
}

// Returns an object with the hashed credentials inside.
function hashCredentials(username, password) {
    password = Buffer.from(password, "base64").toString("utf-8");
    const hash = bcrypt.hashSync(password, saltRounds);

    return { password: hash, username, plainTextPassword: password };
}

// Returns true if the user is registered otherwise false.
async function isRegistered() {
    try {
        await diskLogic.readUserFile();

        return { registered: true };
    } catch (error) {
        return { registered: false };
    }
}

// Derives the root umbrel seed and persists it to disk to be used for
// determinstically deriving further entropy for any other Umbrel service.
async function deriveUmbrelSeed(user) {
  if (await diskLogic.umbrelSeedFileExists()) {
    return;
  }
  const mnemonic = (await seed(user)).seed.join(' ');
  const {entropy} = CipherSeed.fromMnemonic(mnemonic);
  const umbrelSeed = crypto
    .createHmac('sha256', entropy)
    .update('umbrel-seed')
    .digest('hex');
  return diskLogic.writeUmbrelSeedFile(umbrelSeed);
}

// Log the user into the device. Caches the password if login is successful. Then returns jwt.
async function login(user) {
    try {
        const jwt = await JWTHelper.generateJWT(user.username);

        // Cache plain text password
        // cachePassword(user.plainTextPassword);
        cachePassword(user.password);

        //unlock lnd wallet
        // await lndApiService.unlock(user.plainTextPassword, jwt);

        deriveUmbrelSeed(user)

        return { jwt: jwt };

    } catch (error) {
        throw new NodeError('Unable to generate JWT');
    }
}

async function getInfo() {
    try {
        const user = await diskLogic.readUserFile();

        //remove sensitive info
        delete user.password;
        delete user.seed;

        return user;
    } catch (error) {
        throw new NodeError('Unable to get account info');
    }
};

async function seed(user) {

    //Decrypt mnemonic seed
    try {
        const { seed } = await diskLogic.readUserFile();

        const decryptedSeed = await iocane.createSession().decrypt(seed, user.plainTextPassword);

        return { seed: decryptedSeed.split(",") };

    } catch (error) {
        throw new NodeError('Unable to decrypt mnemonic seed');
    }
}

// Registers the the user to the device. Returns an error if a user already exists.
async function register(user, seed) {
    if ((await isRegistered()).registered) {
        throw new NodeError('User already exists', 400); // eslint-disable-line no-magic-numbers
    }

    //Encrypt mnemonic seed for storage
    let encryptedSeed;
    try {
        encryptedSeed = await iocane.createSession().encrypt(seed.join(), user.plainTextPassword);
    } catch (error) {
        throw new NodeError('Unable to encrypt mnemonic seed');
    }

    //save user
    try {
        await diskLogic.writeUserFile({ name: user.name, password: user.password, seed: encryptedSeed });
    } catch (error) {
        throw new NodeError('Unable to register user');
    }

    //derive Umbrel seed
    try {
        await deriveUmbrelSeed(user);
    } catch (error) {
        throw new NodeError('Unable to create Umbrel seed');
    }

    //generate JWt
    let jwt;
    try {
        jwt = await JWTHelper.generateJWT(user.username);
    } catch (error) {
        await diskLogic.deleteUserFile();
        throw new NodeError('Unable to generate JWT');
    }

    //initialize lnd wallet
    try {
        await lndApiService.initializeWallet(user.plainTextPassword, seed, jwt);
    } catch (error) {
        await diskLogic.deleteUserFile();
        throw new NodeError(error.response.data);
    }

    //return token
    return { jwt: jwt };
}

// Generate and return a new jwt token.
async function refresh(user) {
    try {
        const jwt = await JWTHelper.generateJWT(user.username);

        return { jwt: jwt };
    } catch (error) {
        throw new NodeError('Unable to generate JWT');
    }
}


module.exports = {
    changePassword,
    getCachedPassword,
    getChangePasswordStatus,
    hashCredentials,
    isRegistered,
    getInfo,
    seed,
    login,
    register,
    refresh,
};
