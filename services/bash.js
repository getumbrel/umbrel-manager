const childProcess = require('child_process');

const exec = (command, args, opts) => new Promise((resolve, reject) => {
  const options = opts || {};

  const cwd = options.cwd || null;

  let spawnOptions = {
    cwd
  }

  // Env should not contain sensitive data, because environment variables are not secure.
  if (options.env) {
    spawnOptions.env = options.env;
  }

  const childProc = childProcess.spawn(command, args, spawnOptions);

  childProc.on('error', err => {
    reject(err);
  });

  const result = {
    err: '',
    out: ''
  };

  childProc.stdout.on('data', chunk => {
    result.out += chunk.toString();
  });

  childProc.stderr.on('data', chunk => {
    result.err += chunk.toString();
  });

  childProc.on('close', code => {
    if (code === 0) {
      resolve(result);
    } else {
      reject(result.err);
    }
  });

  if (options.log) {
    childProc.stdout.pipe(process.stdout);
    childProc.stderr.pipe(process.stderr);
  }
});

module.exports = {
  exec,
};
