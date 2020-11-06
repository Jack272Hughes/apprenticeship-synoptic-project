const jwtHandling = require("../utils/JWTHandling");
const helperFunctions = require("../utils/helperFunctions");

jwtHandling.generateRandomBytes = jest.fn(() => "randomBytes");
jwtHandling.generateJWT = jest.fn(() => "generatedJWT");
jwtHandling.generateRefreshToken = jest.fn(() => "generatedRFT");

helperFunctions.createHash = jest.fn(() => "createdHash");
