const diskService = require('services/disk.js');
const constants = require('utils/const.js');
const NodeError = require('models/errors.js').NodeError;
const path = require('path');
const YAML = require('yaml');

// Based on a user return the active repo id
function getId(user) {
  if(typeof(user.appRepo) !== "string")
  {
    throw new NodeError("appRepo is not defined within user.json");
  }

  // Replace all non alpha-numeric characters with hyphen
  return user.appRepo.replace(/[\W_]+/g, "-");
}

// Using the active repo id and app id
// Return the app's manifest file (as an object)
async function getAppManifest(repoId, appId, manifestFilename) {
  const appDataFolder = constants.APP_DATA_DIR;
  const appRepoFolder = constants.REPOS_DIR;

  try {
    const appYamlPath = path.join(appRepoFolder, repoId, appId, manifestFilename);
    const appYaml = await diskService.readFile(appYamlPath, "utf-8");

    return YAML.parse(appYaml);
  } catch(e) {
    throw new NodeError(`Failed to parse ${appId} manifest file`);
  }
}

module.exports = {
  getId,
  getAppManifest
};