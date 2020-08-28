const crypto = require("crypto");

function createHash(data) {
  const hash = crypto.createHash("sha256");
  hash.update(data);
  return hash.digest("hex");
}

function parseCookies(cookies) {
  return cookies.split(/\;\s/).reduce((acc, cookie) => {
    const [key, value] = cookie.split(/\=(.*)/);
    acc[key] = decodeURIComponent(value);
    return acc;
  }, {});
}

module.exports = { createHash, parseCookies };
