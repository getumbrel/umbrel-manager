const diskLogic = require('logic/disk.js');
const NodeError = require('models/errors.js').NodeError;


async function getHiddenServiceUrl() {
    try {
        const url = await diskLogic.readHiddenService();
        return url;
    } catch (error) {
        throw new NodeError('Unable to get hidden service url');
    }
};


module.exports = {
    getHiddenServiceUrl
};
