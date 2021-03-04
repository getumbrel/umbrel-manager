const corsOptions = {
  origin: (origin, callback) => {
    const allowList = [
      'http://localhost:3000',
      'http://localhost:8080',
      'http://localhost',
      'http://umbrel.local',
      ...process.env.DEVICE_HOSTS.split(',')
    ];

    if (allowList.includes(origin) || !origin) {
      return callback(null, true);
    }

    return callback(new Error('Not allowed by CORS'));
  }
};

module.exports = {
  corsOptions
};
