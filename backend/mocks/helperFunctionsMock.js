const jwtHandling = require("../utils/JWTHandling");
const helperFunctions = require("../utils/helperFunctions");
const jwt = require("jsonwebtoken");

jest.mock("../utils/JWTHandling");
jest.mock("../utils/helperFunctions");
jest.mock("jsonwebtoken");

Object.entries(jwtHandling).forEach(([functionName, functionActual]) => {
  functionActual.mockReturnValue(
    functionName
      .replace("generate", "generated")
      .replace("validate", "validated")
  );
});

helperFunctions.createHash.mockReturnValue("createdHash");
helperFunctions.parseCookies.mockReturnValue({
  authToken: "mockAuthToken",
  rft: "mockRefreshToken"
});

jwt.decode.mockReturnValue({
  username: "username",
  role: "mockedRole",
  oid: 0
});

beforeEach(() => {
  Object.values(jwtHandling).forEach(func => func.mockClear());
  Object.values(helperFunctions).forEach(func => func.mockClear());
  jwt.decode.mockClear();
});
