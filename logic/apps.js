const diskLogic = require('logic/disk.js');
const NodeError = require('models/errors.js').NodeError;

async function get(query) {
  const registryExists = await diskLogic.checkAppRegistry();
  if (!registryExists) {
    await generateRegisty();
  }
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
}

async function generateRegisty() {
  const apps = diskLogic.listAppsInAppsDir();
  let appRegistry;
  apps.forEach(app => {
    const parsedInfo = {};
    const appInfo = diskLogic.readAppInfo(app);
    if (appInfo.version !== 0 || !appInfo.meta) {
      console.warn(`${app} is using incompatible app.yml (Version ${appInfo.version})`);

      return;
    }
    ['category', 'name', 'version', 'tagline', 'description', 'developer', 'repo', 'support', 'port'].forEach(property => {
      if (!appInfo.meta[property]) {
        console.warn(`${app} does not define required property meta.${property}`);

        return;
      }
      parsedInfo[property] = appInfo.meta[property];
    });
    parsedInfo.id = app;

    // Optional properties
    parsedInfo.dependencies = appInfo.meta.dependencies || [];
    parsedInfo.defaultPassword = appInfo.meta.defaultPassword || undefined;
    parsedInfo.path = appInfo.meta.path || '/';
    parsedInfo.gallery = appInfo.meta.galler || ['1.jpg', '2.jpg', '3.jpg'];
    appRegistry.push(parsedInfo);
  });
  await diskLogic.writeAppRegistry(appRegistry);
}

module.exports = {
  get,
  install,
  uninstall,
  generateRegisty
};
