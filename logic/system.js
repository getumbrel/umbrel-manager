const axios = require('axios');
const semverGt = require('semver/functions/gt')

const diskLogic = require('logic/disk.js');
const constants = require('utils/const.js');
const NodeError = require('models/errors.js').NodeError;

async function getInfo() {
    try {
        const info = await diskLogic.readUpdateVersionFile();
        return info;
    } catch (error) {
        throw new NodeError('Unable to get system information');
    }
};

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

        const infoUrl = `https://raw.githubusercontent.com/${constants.GITHUB_REPO}/ota-updates/info.json`;

        const { data } = await axios.get(infoUrl);
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

async function startUpdate() {

    let availableUpdate;

    try {
        availableUpdate = await getAvailableUpdate();
        if (!availableUpdate.version) {
            return availableUpdate;
        }
    } catch (error) {
        throw new NodeError('Unable to fetch latest release');
    }

    const updateInProgress = await diskLogic.updateLockFileExists();
    if (updateInProgress) {
        throw new NodeError('An update is already in progress');
    }

    try {
        await diskLogic.writeUpdateSignalFile(availableUpdate.version)
        return { message: "Updating to Umbrel v" + availableUpdate.version };
    } catch (error) {
        console.log(error);
        throw new NodeError('Unable to write update signal file');
    }
}


module.exports = {
    getInfo,
    getHiddenServiceUrl,
    getAvailableUpdate,
    getUpdateStatus,
    startUpdate
};
