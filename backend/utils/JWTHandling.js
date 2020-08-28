const crypto = require("crypto");
const jwt = require("jsonwebtoken");

const { jwtSecret } = require("../config.json");
const dataAccessor = require("../dataAccessor/dataAccessor");
const { createHash } = require("./helperFunctions");

function generateRefreshToken(username, oldRft) {
  const rft = generateRandomBytes();
  if (oldRft)
    dataAccessor.refreshTokens.replace(oldRft, username, createHash(rft));
  else dataAccessor.refreshTokens.add(createHash(rft), username);
  return rft;
}

function generateRandomBytes(totalBytes = 16) {
  return crypto.randomBytes(totalBytes).toString("base64");
}

function generateJWT(userObject) {
  const { username, role = "user", oid } = userObject;
  return (token = jwt.sign({ oid, username, role }, jwtSecret, {
    expiresIn: "30m"
  }));
}

async function validateRefreshToken(expiredToken, rft) {
  try {
    jwt.verify(expiredToken, jwtSecret);
  } catch (err) {
    if (!err.name === "TokenExpiredError") {
      console.error(err);
      return null;
    }
  } finally {
    const decodedToken = jwt.decode(expiredToken);
    const hashedToken = createHash(rft);
    const tokenValid = await dataAccessor.refreshTokens.validate(
      hashedToken,
      decodedToken.username
    );
    if (tokenValid) return hashedToken;
    else return null;
  }
}

module.exports = {
  generateJWT,
  validateRefreshToken,
  generateRandomBytes,
  generateRefreshToken
};
