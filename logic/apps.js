const diskService = require('services/disk.js');
const diskLogic = require('logic/disk.js');
const reposLogic = require('logic/repos.js');
const NodeError = require('models/errors.js').NodeError;
const deriveEntropy = require('modules/derive-entropy');
const constants = require('utils/const.js');
const YAML = require('yaml');
const semver = require('semver');
const path = require('path');

const APP_MANIFEST_FILENAME = "umbrel-app.yml";
const APP_MANIFEST_SUPPORTED_VERSION = 1;

function isValidAppManifest(app) {
  return typeof(app) === "object" && typeof(app.id) === "string";
}

// Using the active repo id and app id
// Return the app's manifest file (as an object)
async function getAppManifest(folder, appId, manifestFilename) {
  let app;
  try {
    const appYamlPath = path.join(folder, appId, manifestFilename);
    const appYaml = await diskService.readFile(appYamlPath, "utf-8");

    app = YAML.parse(appYaml);
  } catch(e) {
    throw new NodeError(`Failed to parse ${appId} manifest file`);
  }

  // Check that app object looks like an app...
  if(! isValidAppManifest(app))
  {
    throw new NodeError(`Invalid ${appId} manifest file`);
  }

  return app;
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

  const filterInstalled = query.installed;

  // Read all app yaml files within the active app repo
  const activeAppRepoFolder = path.join(constants.REPOS_DIR, reposLogic.getId(user));
  const appsFolderToRead = filterInstalled ? constants.APP_DATA_DIR : activeAppRepoFolder;
  const foldersInRepo = await diskService.listDirsInDir(appsFolderToRead);

  // Ignore dot/hidden folders
  const appsInFolder = foldersInRepo.filter(folder => folder[0] !== '.');

  let apps = await Promise.allSettled(appsInFolder.map(appId => getAppManifest(appsFolderToRead, appId, APP_MANIFEST_FILENAME)));

  // Filter to only 'fulfilled' promises and return value (app metadata)
  apps = apps.filter(settled => settled.status === 'fulfilled').map(settled => settled.value);

  // Map some metadata onto each app object
  apps = await addAppMetadata(apps);

  // For the list of installed apps
  // Let's now check whether any have an app update
  if(filterInstalled) {
    await Promise.all(apps.map(async app => {
      try {
        const appYamlPath = path.join(activeAppRepoFolder, app.id, APP_MANIFEST_FILENAME);
        const appYaml = await diskService.readFile(appYamlPath, "utf-8");

        const appInRepo = YAML.parse(appYaml);

        app.updateAvailable = appInRepo.version != app.version;
        // This a hack so that the new version is displayed in the dashboard...
        app.version = appInRepo.version;
      } catch(e) {
        console.error("Error parsing app in app-data", e);
      }
    }));
  }

  return apps;
}

async function isValidAppId(id) {
  // TODO: validate id
  return true;
}

async function canInstallOrUpdateApp(id) {
  const user = await diskLogic.readUserFile();

  const activeAppRepoFolder = path.join(constants.REPOS_DIR, reposLogic.getId(user));
  const app = await getAppManifest(activeAppRepoFolder, id, APP_MANIFEST_FILENAME);

  // Now check the app's manifest version
  return semver.lte(semver.coerce(app.manifestVersion), semver.coerce(APP_MANIFEST_SUPPORTED_VERSION));
}

async function install(id) {
  if(! await isValidAppId(id)) {
    throw new NodeError('Invalid app id');
  }

  if(! await canInstallOrUpdateApp(id)) {
    throw new NodeError('This app requires a newer version of Umbrel. Please update your Umbrel to install it.');
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

  if(! await canInstallOrUpdateApp(id)) {
    throw new NodeError('Unsupported app manifest version. Please update your Umbrel.');
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
