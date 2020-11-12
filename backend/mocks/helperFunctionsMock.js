const jwtHandling = require("../utils/JWTHandling");
const helperFunctions = require("../utils/helperFunctions");

jest.mock("../utils/JWTHandling");

jwtHandling.generateRandomBytes.mockReturnValue("randomBytes");
jwtHandling.generateJWT.mockReturnValue("generatedJWT");
jwtHandling.generateRefreshToken.mockReturnValue("generatedRFT");

helperFunctions.createHash = jest.fn(() => "createdHash");

beforeEach(() => {
  jwtHandling.generateRandomBytes.mockClear();
  jwtHandling.generateJWT.mockClear();
  jwtHandling.generateRefreshToken.mockClear();
  helperFunctions.createHash.mockClear();
});
