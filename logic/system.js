const axios = require('axios');
const semverGt = require('semver/functions/gt');
const semverSatisfies = require('semver/functions/satisfies');
const semverMinVersion = require('semver/ranges/min-version');
const encode = require('lndconnect').encode;

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
        const url = await diskLogic.readHiddenService('web');
        return url;
    } catch (error) {
        throw new NodeError('Unable to get hidden service url');
    }
};

async function getElectrumConnectionDetails() {
    try {
        const address = await diskLogic.readElectrumHiddenService();
        const port = constants.ELECTRUM_PORT;
        const connectionString = `${address}:${port}:t`;
        return {
            address,
            port,
            connectionString
        };
    } catch (error) {
        throw new NodeError('Unable to get Electrum hidden service url');
    }
};

async function getBitcoinP2PConnectionDetails() {
    try {
        const address = await diskLogic.readBitcoinP2PHiddenService();
        const port = constants.BITCOIN_P2P_PORT;
        const connectionString = `${address}:${port}`;
        return {
            address,
            port,
            connectionString
        };
    } catch (error) {
        throw new NodeError('Unable to get Bitcoin P2P hidden service url');
    }
};

async function getBitcoinRPCConnectionDetails() {
    try {
        const [user, hiddenService] = await Promise.all([
          diskLogic.readUserFile(),
          diskLogic.readBitcoinRPCHiddenService(),
        ]);
        const label = encodeURIComponent(`${user.name}'s Umbrel`);
        const rpcuser = constants.BITCOIN_RPC_USER;
        const rpcpassword = constants.BITCOIN_RPC_PASSWORD;
        const address = hiddenService;
        const port = constants.BITCOIN_RPC_PORT;
        const connectionString = `btcrpc://${rpcuser}:${rpcpassword}@${address}:${port}?label=${label}`;
        return {
            rpcuser,
            rpcpassword,
            address,
            port,
            connectionString
        };
    } catch (error) {
        throw new NodeError('Unable to get Bitcoin RPC connection details');
    }
};

async function getAvailableUpdate() {
    try {
        const current = await diskLogic.readUmbrelVersionFile();
        const currentVersion = current.version;

        // 'tag' should be master to begin with
        let tag = 'master';
        let data;
        let isNewVersionAvailable = true;
        let isCompatibleWithCurrentVersion = false;

        // Try finding for a new update until there's a new version available
        // which is compatible with the currently installed version
        while (isNewVersionAvailable && !isCompatibleWithCurrentVersion) {
            const infoUrl = `https://raw.githubusercontent.com/${constants.GITHUB_REPO}/${tag}/info.json`;

            const latestVersionInfo = await axios.get(infoUrl);
            data = latestVersionInfo.data;

            let latestVersion = data.version;
            let requiresVersionRange = data.requires;

            // A new version is available if the latest version > local version
            isNewVersionAvailable = semverGt(latestVersion, currentVersion);

            // It's compatible with the current version if current version
            // satisfies the 'requires' condition of the new version
            isCompatibleWithCurrentVersion = semverSatisfies(currentVersion, requiresVersionRange);

            // Calculate the minimum required version
            let minimumVersionRequired = `v${semverMinVersion(requiresVersionRange)}`;

            // If the minimum required version is what we just checked for, exit
            // This usually happens when an OTA update breaking release x.y.z is made
            // that also has x.y.z as the minimum required version
            if (tag === minimumVersionRequired) {
                break;
            }

            // Update tag to the minimum required version for the next loop run
            tag = minimumVersionRequired;
        }


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

async function getBackupStatus() {
    try {
        const status = await diskLogic.readBackupStatusFile()
        return status;
    } catch (error) {
        throw new NodeError('Unable to get backup status');
    }
}

async function getLndConnectUrls() {

    let cert;
    try {
        cert = await diskLogic.readLndCert();
    } catch (error) {
        throw new NodeError('Unable to read lnd cert file');
    }

    let macaroon;
    try {
        macaroon = await diskLogic.readLndAdminMacaroon();
    } catch (error) {
        throw new NodeError('Unable to read lnd macaroon file');
    }

    let macaroonReadonly;
    try {
        macaroonReadonly = await diskLogic.readLndReadonlyMacaroon();
    } catch (error) {
        throw new NodeError('Unable to read lnd readonly.macaroon file');
    }

    let restTorHost;
    try {
        restTorHost = await diskLogic.readLndRestHiddenService();
        restTorHost += ':8080';
    } catch (error) {
        throw new NodeError('Unable to read lnd REST hostname file');
    }
    const restTor = encode({
        host: restTorHost,
        cert,
        macaroon,
    });

    let grpcTorHost;
    try {
        grpcTorHost = await diskLogic.readLndGrpcHiddenService();
        grpcTorHost += ':10009';
    } catch (error) {
        throw new NodeError('Unable to read lnd gRPC hostname file');
    }
    const grpcTor = encode({
        host: grpcTorHost,
        cert,
        macaroon,
    });

    let restLocalHost = `${constants.DEVICE_HOSTNAME}:8080`;
    const restLocal = encode({
        host: restLocalHost,
        cert,
        macaroon,
    });

    let grpcLocalHost = `${constants.DEVICE_HOSTNAME}:10009`;
    const grpcLocal = encode({
        host: grpcLocalHost,
        cert,
        macaroon,
    });

    return {
        restTor,
        restLocal,
        grpcTor,
        grpcLocal,
        adminMacaroonHex: macaroon.toString('hex'),
        readonlyMacaroonHex: macaroonReadonly.toString('hex')
    };

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
    getElectrumConnectionDetails,
    getBitcoinP2PConnectionDetails,
    getBitcoinRPCConnectionDetails,
    getAvailableUpdate,
    getUpdateStatus,
    startUpdate,
    getBackupStatus,
    getLndConnectUrls,
    requestShutdown,
    requestReboot
};
