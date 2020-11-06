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

describe("When making calling the /signup route it", () => {
  it("Should return a 404 status when no username and password is passed", done => {
    request.post("/signup").expect(404, done);
  });

  it("Should return a 409 status when a given username already exists", done => {
    mockDataAccessor("users.find", true);
    request.post("/signup").send(basicLogin).expect(409, done);
  });

  it("Should call the correct functions when adding a new user", async () => {
    mockDataAccessor("users.add", { ops: [basicLogin], insertedId: 0 });

    await request.post("/signup").send(basicLogin);

    expect(jwtHandling.generateRandomBytes).toBeCalled();
    expect(helperFunctions.createHash).toBeCalledWith("passwordrandomBytes");
  });

  it("Should contain the correct parameters when adding a new user", async () => {
    mockDataAccessor("users.add", { ops: [basicLogin], insertedId: 0 });

    await request.post("/signup").send(basicLogin);

    expect(dataAccessor.users.add).toBeCalledWith(
      "username",
      "createdHash",
      "randomBytes"
    );
  });

  it("Should return a JWT and RFT token", async () => {
    mockDataAccessor("users.add", { ops: [basicLogin], insertedId: 0 });

    const response = await request.post("/signup").send(basicLogin);
    expect(response.body).toMatchObject({
      token: "generatedJWT",
      rft: "generatedRFT"
    });
  });
});
