const app = require("express")();
const upload = require("multer")();
const cors = require("cors");
const jwt = require("jsonwebtoken");

const dataAccessor = require("./dataAccessor/dataAccessor");
const { createHash, parseCookies } = require("./utils/helperFunctions");
const {
  generateJWT,
  validateRefreshToken,
  generateRandomBytes,
  generateRefreshToken
} = require("./utils/JWTHandling");

app.use(
  cors({
    origin: ["http://localhost:3000"],
    credentials: true
  })
);
app.use(upload.array());

app.post("/signup", async (req, res) => {
  if (!req.body || !req.body.username || !req.body.password)
    return res.sendStatus(404);

  const userExists = await dataAccessor.users.find(req.body.username);
  if (userExists) return res.sendStatus(409);

  const salt = generateRandomBytes();
  dataAccessor.users
    .add(req.body.username, createHash(req.body.password + salt), salt)
    .then(result => {
      if (!result) return res.sendStatus(409);
      const userData = {
        ...result.ops[0],
        oid: result.insertedId
      };

      res.json({
        token: generateJWT({
          username: userData.username,
          role: userData.role,
          oid: userData.oid
        }),
        rft: generateRefreshToken(userData.username)
      });
    });
});

app.post("/login", async (req, res) => {
  if (!req.body || !req.body.username || !req.body.password)
    return res.sendStatus(404);
  const userData = await dataAccessor.users.find(req.body.username);

  if (!userData) return res.sendStatus(401);
  if (createHash(req.body.password + userData.salt) !== userData.password)
    return res.sendStatus(401);

  res.json({
    token: generateJWT({
      username: userData.username,
      role: userData.role,
      oid: userData.id
    }),
    rft: generateRefreshToken(userData.username)
  });
});

app.post("/token", async (req, res) => {
  if (!req.headers.cookie) return res.sendStatus(404);
  const cookies = parseCookies(req.headers.cookie);
  if (!cookies.authToken || !cookies.rft) return res.sendStatus(404);

  const hashedRFT = await validateRefreshToken(cookies.authToken, cookies.rft);
  if (!hashedRFT) return res.sendStatus(403);

  const { username, role, oid } = jwt.decode(cookies.authToken);
  res.json({
    token: generateJWT({ username, role, oid }),
    rft: generateRefreshToken(username, hashedRFT)
  });
});

app.post("/logout", (req, res) => {
  if (!req.headers.cookie) return res.sendStatus(404);
  const cookies = parseCookies(req.headers.cookie);
  if (!cookies.authToken) return res.sendStatus(404);

  const decodedToken = jwt.decode(cookies.authToken);
  if (!decodedToken.rft) return res.sendStatus(200);

  dataAccessor.refreshTokens.remove(
    createHash(decodedToken.rft),
    decodedToken.username
  );
  res.sendStatus(200);
});

app.listen(5000);
