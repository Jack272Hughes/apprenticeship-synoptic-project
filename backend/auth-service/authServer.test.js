const supertest = require("supertest");
const server = require("./authServer");

const jwtHandling = require("../utils/JWTHandling.js");
const helperFunctions = require("../utils/helperFunctions.js");
const dataAccessor = require("../utils/dataAccessor");

let app, request;
const basicLogin = { username: "username", password: "password" };

afterAll(() => {
  app.close();
});

beforeAll(() => {
  mockDataAccessor("users.find", false, { persist: true, resetLast: true });
});

describe("When running the authServer it", () => {
  afterAll(async () => {
    request = supertest(app);
  });

  it("Should start successfully", async () => {
    app = server.listen(0, () => {
      expect(app).toMatchObject(expect.any(Object));
    });
  });
});

describe("When calling the /signup route it", () => {
  it("Should return a 404 status when no username or password is passed", done => {
    request.post("/signup").expect(404, done);
  });

  it("Should return a 409 status when a given username already exists", done => {
    mockDataAccessor("users.find", true);
    request.post("/signup").send(basicLogin).expect(409, done);
  });

  it("Should return a 500 status when it fails to add a new user", done => {
    mockDataAccessor("users.add", false);
    request.post("/signup").send(basicLogin).expect(500, done);
  });

  it("Should contain the correct parameters when calling the users.find function", async () => {
    mockDataAccessor("users.find", true);
    await request.post("/signup").send(basicLogin);
    expect(dataAccessor.users.find).toBeCalledWith("username");
  });

  it("Should call the correct helper functions with correct parameters", async () => {
    mockDataAccessor("users.add", {
      ops: [{ ...basicLogin, role: "mockedRole" }],
      insertedId: 0
    });

    await request.post("/signup").send(basicLogin);

    expect(jwtHandling.generateRandomBytes).toBeCalled();
    expect(helperFunctions.createHash).toBeCalledWith("passwordrandomBytes");
    expect(jwtHandling.generateJWT).toBeCalledWith({
      oid: 0,
      role: "mockedRole",
      username: "username"
    });
    expect(jwtHandling.generateRefreshToken).toBeCalledWith("username");
  });

  it("Should contain the correct parameters when calling the users.add function", async () => {
    mockDataAccessor("users.add", {
      ops: [{ ...basicLogin, role: "mockedRole" }],
      insertedId: 0
    });

    await request.post("/signup").send(basicLogin);

    expect(dataAccessor.users.add).toBeCalledWith(
      "username",
      "createdHash",
      "randomBytes"
    );
  });

  it("Should return a JWT and RFT token, on success", async () => {
    mockDataAccessor("users.add", { ops: [basicLogin], insertedId: 0 });

    const response = await request.post("/signup").send(basicLogin);
    expect(response.body).toMatchObject({
      token: "generatedJWT",
      rft: "generatedRFT"
    });
  });
});

describe("When calling the /login route it", () => {
  it("Should return with a 404 status when no username or password is passed", done => {
    request.post("/login").expect(404, done);
  });

  it("Should return with a 404 status when a username doesn't exist", done => {
    mockDataAccessor("users.find", false);
    request.post("/login").send(basicLogin).expect(404, done);
  });

  it("Should return with a 401 status when the password is incorrect", done => {
    mockDataAccessor("users.find", { password: "incorrectPassword" });
    request.post("/login").send(basicLogin).expect(401, done);
  });

  it("Should call correct helper functions with correct parameters", async () => {
    mockDataAccessor("users.find", {
      password: "createdHash",
      salt: "mockedSalt",
      id: 0,
      username: "username",
      role: "mockedRole"
    });
    await request.post("/login").send(basicLogin);

    expect(helperFunctions.createHash).toBeCalledWith("passwordmockedSalt");
    expect(jwtHandling.generateJWT).toBeCalledWith({
      oid: 0,
      role: "mockedRole",
      username: "username"
    });
    expect(jwtHandling.generateRefreshToken).toBeCalledWith("username");
  });

  it("Should contain the correct parameters when calling the users.find function", async () => {
    await request.post("/login").send(basicLogin);
    expect(dataAccessor.users.find).toBeCalledWith("username");
  });

  it("Should return a JWT and RFT token on success", async () => {
    mockDataAccessor("users.find", { password: "createdHash" });

    const response = await request.post("/login").send(basicLogin);
    expect(response.body).toMatchObject({
      token: "generatedJWT",
      rft: "generatedRFT"
    });
  });
});
