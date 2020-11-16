const jwt = require("jsonwebtoken");

function createToken(role) {
  return jwt.sign(
    { oid: "1", username: "username", role: role },
    "testingSecret"
  );
}

module.exports = {
  USER: createToken("USER"),
  MODERATOR: createToken("MODERATOR"),
  ADMIN: createToken("ADMIN")
};
