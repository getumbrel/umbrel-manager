const diskLogic = require('logic/disk.js');
const NodeError = require('models/errors.js').NodeError;

async function get(query) {
  let apps = await diskLogic.readAppRegistry();

  // Do all hidden service lookups concurrently
  await Promise.all(apps.map(async app => {
    try {
      app.hiddenService = await diskLogic.readHiddenService(`app-${app.id}`);
    } catch(e) {
      app.hiddenService = '';
    }
  }));

  if (query.installed === true) {
    const {installedApps} = await diskLogic.readUserFile();
    apps = apps.filter(app => installedApps.includes(app.id));
  }

  return apps;
}

async function isValidAppId(id) {
  // TODO: validate id
  return true;
}

async function install(id) {
  if(! await isValidAppId(id)) {
    throw new NodeError('Invalid app id');
  }

  try {
    await diskLogic.writeSignalFile(`app-install-${id}`);
  } catch (error) {
    throw new NodeError('Could not write the signal file');
  }
};

async function uninstall(id) {
  if(! await isValidAppId(id)) {
    throw new NodeError('Invalid app id');
  }

  try {
    await diskLogic.writeSignalFile(`app-uninstall-${id}`);
  } catch (error) {
    throw new NodeError('Could not write the signal file');
  }
};

module.exports = {
  get,
  install,
  uninstall,
};
