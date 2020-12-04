const diskLogic = require('logic/disk.js');
const NodeError = require('models/errors.js').NodeError;

async function install(id) {
  // TODO: validate id
  if(false) {
    throw new NodeError('Invalid app id');
  }

  try {
    await diskLogic.writeSignalFile(`app-install-${id}`);
  } catch (error) {
    throw error;
    throw new NodeError('Could not write the signal file');
  }
};

module.exports = {
  install,
};
