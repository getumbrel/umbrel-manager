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

function isValidAppManifest(app) {
  return typeof(app) === "object" && typeof(app.id) === "string";
}

// Using the active repo id and app id
// Return the app's manifest file (as an object)
async function getAppManifest(repoId, appId, manifestFilename) {
  try {
    const appYamlPath = path.join(constants.REPOS_DIR, repoId, appId, manifestFilename);
    const appYaml = await diskService.readFile(appYamlPath, "utf-8");

    const app = YAML.parse(appYaml);

    // Check that app object looks like an app...
    if(! isValidAppManifest(app))
    {
      throw new NodeError(`Invalid ${appId} manifest file`);
    }

    return app;
  } catch(e) {
    throw new NodeError(`Failed to parse ${appId} manifest file`);
  }
}

module.exports = {
  getId,
  getAppManifest
};