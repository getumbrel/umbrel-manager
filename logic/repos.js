const NodeError = require('models/errors.js').NodeError;

// Based on a user return the active repo id
function getId(user) {
  if(typeof(user.appRepo) !== "string")
  {
    throw new NodeError("appRepo is not defined within user.json");
  }

  // Replace all non alpha-numeric characters with hyphen
  return user.appRepo.replace(/[^a-zA-Z0-9]/g, "-");
}

module.exports = {
  getId
};