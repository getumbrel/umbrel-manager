const axios = require('axios');
const semverGt = require('semver/functions/gt')

const diskLogic = require('logic/disk.js');
const constants = require('utils/const.js');
const NodeError = require('models/errors.js').NodeError;


async function getHiddenServiceUrl() {
    try {
        const url = await diskLogic.readHiddenService();
        return url;
    } catch (error) {
        throw new NodeError('Unable to get hidden service url');
    }
};

async function getAvailableUpdate() {
    try {
        const current = await diskLogic.readUpdateVersionFile();
        const currentVersion = current.version;

        const { data } = await axios.get(constants.UPDATE_URL);
        const latestVersion = data.version;

        const isUpdateAvailable = semverGt(latestVersion, currentVersion);

        if (isUpdateAvailable) {
            return data;
        } else {
            return "Your Umbrel is up-to-date";
        }
    }
    catch (error) {
        throw new NodeError('Unable to check for update');
    }
};

async function getUpdateStatus() {
    try {
        const status = await diskLogic.readUpdateStatusFile()
        return status;
    } catch (error) {
        throw new NodeError('Unable to get update status');
    }
}


module.exports = {
    getHiddenServiceUrl,
    getAvailableUpdate,
    getUpdateStatus
};
