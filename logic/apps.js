const diskService = require('services/disk.js');
const diskLogic = require('logic/disk.js');
const NodeError = require('models/errors.js').NodeError;
const deriveEntropy = require('modules/derive-entropy');
const constants = require('utils/const.js');
const YAML = require('yaml');
const path = require('path');

const APP_MANIFEST_FILENAME = "umbrel-app.yml";

function getRepoId(user) {
  if(typeof(user.appRepo) !== "string")
  {
    throw new NodeError("appRepo is not defined within user.json");
  }

  // Replace all non alpha-numeric characters with hyphen
  return user.appRepo.replace(/[\W_]+/g, "-");
}

async function addAppMetadata(apps) {
  // Do all hidden service lookups concurrently
  await Promise.all(apps.map(async app => {
    try {
      app.hiddenService = await diskLogic.readHiddenService(`app-${app.id}`);
    } catch(e) {
      app.hiddenService = '';
    }
  }));

  // Derive all passwords concurrently
  await Promise.all(apps.filter(app => app.deterministicPassword).map(async app => {
    try {
      app.defaultPassword = await deriveEntropy(`app-${app.id}-seed-APP_PASSWORD`);
    } catch(e) {
      app.defaultPassword = '';
    }
  }));

  // Set some app update defaults
  apps = apps.map((app) => {
    app.updateAvailable = false;

    return app;
  });

  return apps;
}

async function get(query) {
  const user = await diskLogic.readUserFile();

  // Read all app yaml files within the active app repo
  const appDataFolder = constants.APP_DATA_DIR;
  const appRepoFolder = constants.REPOS_DIR;
  const activeRepoId = getRepoId(user);
  const foldersInRepo = await diskService.listDirsInDir(path.join(appRepoFolder, activeRepoId));

  let apps = await Promise.all(foldersInRepo.map(async app => {
    // Ignore dot/hidden folders
    if(app[0] === ".")
    {
      return null;
    }

    try {
      const appYamlPath = path.join(appRepoFolder, activeRepoId, app, APP_MANIFEST_FILENAME);
      const appYaml = await diskService.readFile(appYamlPath, "utf-8");

      return YAML.parse(appYaml)
    } catch(e) {
      console.error("Error parsing app in repo", e);

      return null
    }
  }));

  // Filter out non-app objects
  apps = apps.filter(app => app !== null && typeof(app) === "object" && typeof(app.id) === "string");

  if(query.installed)
  {
    apps = apps.filter(app => user.installedApps.includes(app.id));
  }

  apps = await addAppMetadata(apps);

  let appsMap = {};
  apps.forEach(app => {
    appsMap[app.id] = app;
  });

  // Now check if any of the installed apps have an update available
  await Promise.all(user.installedApps.map(async app => {
    try {
      const appYamlPath = path.join(appDataFolder, app, APP_MANIFEST_FILENAME);
      const appYaml = await diskService.readFile(appYamlPath, "utf-8");

      let installedApp = YAML.parse(appYaml)

      // We have to check if app exists in apps map
      // Because they could have an installed app that is no longer available in the repo
      if(appsMap[app])
      {
        appsMap[app].updateAvailable = installedApp.version != appsMap[app].version;
      }
    } catch(e) {
      console.error("Error parsing app in app-data", e);
    }
  }));

  return Object.values(appsMap);
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

async function update(id) {
  if(! await isValidAppId(id)) {
    throw new NodeError('Invalid app id');
  }

  try {
    await diskLogic.writeSignalFile(`app-update-${id}`);
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
  update
};
