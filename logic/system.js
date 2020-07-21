const axios = require('axios');
const semverGt = require('semver/functions/gt');
const semverSatisfies = require('semver/functions/satisfies');
const semverMinVersion = require('semver/ranges/min-version');

const diskLogic = require('logic/disk.js');
const constants = require('utils/const.js');
const NodeError = require('models/errors.js').NodeError;

async function getInfo() {
    try {
        const info = await diskLogic.readUmbrelVersionFile();
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
        const current = await diskLogic.readUmbrelVersionFile();
        const currentVersion = current.version;

        // 'tag' should be master to begin with
        let tag = 'ota-updates';
        let data;
        let isNewVersionAvailable = false;
        let isCompatibleWithCurrentVersion = false;

        // Try finding for a new update until there's a new version available
        // which is compatible with the currently installed version
        do {
            const infoUrl = `https://raw.githubusercontent.com/${constants.GITHUB_REPO}/${tag}/info.json`;

            const latestVersionInfo = await axios.get(infoUrl);
            data = latestVersionInfo.data;

            let latestVersion = data.version;
            let requiresVersionRange = data.requires;

            // A new version is available if the latest version > local version
            isNewVersionAvailable = semverGt(latestVersion, currentVersion, { includePrerelease: true });

            // It's compatible with the current version if current version
            // satisfies the 'requires' condition of the new version
            isCompatibleWithCurrentVersion = semverSatisfies(currentVersion, requiresVersionRange, { includePrerelease: true });

            // Update tag to the minimum satisfying version for the next loop run
            tag = `v${semverMinVersion(requiresVersionRange, { includePrerelease: true })}`;
        } while (isNewVersionAvailable && !isCompatibleWithCurrentVersion);


        if (isNewVersionAvailable && isCompatibleWithCurrentVersion) {
            return data;
        }

        return "Your Umbrel is up-to-date";
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

    // Fetch available update
    try {
        availableUpdate = await getAvailableUpdate();
        if (!availableUpdate.version) {
            return availableUpdate;
        }
    } catch (error) {
        throw new NodeError('Unable to fetch latest release');
    }

    // Make sure an update is not already in progress
    const updateInProgress = await diskLogic.updateLockFileExists();
    if (updateInProgress) {
        throw new NodeError('An update is already in progress');
    }

    // Update status file with update version
    try {
        const updateStatus = await diskLogic.readUpdateStatusFile();
        updateStatus.updateTo = `v${availableUpdate.version}`;
        await diskLogic.writeUpdateStatusFile(updateStatus);
    } catch (error) {
        throw new NodeError('Could not update the update-status file');
    }

    // Write update signal file
    try {
        await diskLogic.writeUpdateSignalFile()
        return { message: "Updating to Umbrel v" + availableUpdate.version };
    } catch (error) {
        throw new NodeError('Unable to write update signal file');
    }
}

async function requestShutdown() {
    try {
        await diskLogic.shutdown();
        return "Shutdown requested";
    } catch (error) {
        throw new NodeError('Unable to request shutdown');
    }
};

async function requestReboot() {
    try {
        await diskLogic.reboot();
        return "Reboot requested";
    } catch (error) {
        throw new NodeError('Unable to request reboot');
    }
};



module.exports = {
    getInfo,
    getHiddenServiceUrl,
    getAvailableUpdate,
    getUpdateStatus,
    startUpdate,
    requestShutdown,
    requestReboot
};
