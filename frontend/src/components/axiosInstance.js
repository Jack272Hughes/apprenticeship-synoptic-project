const axios = require("axios");
const jwt = require("jsonwebtoken");
const config = require("../config");

let setCookies;
let removeCookies;

const serverInstance = axios.create({
  baseURL: config.serverHost,
  withCredentials: true
});

const authInstance = axios.create({
  baseURL: config.authHost,
  withCredentials: true
});

function getNewToken() {
  return authInstance.post("/token").catch(err => {
    console.log(err);
    removeCookies(["authToken", "rft"]);
  });
}

function setAuth(token, setCookiesFunc, removeCookiesFunc) {
  serverInstance.defaults.headers.common.Authorization = `Bearer ${token}`;
  setCookies = setCookiesFunc;
  removeCookies = removeCookiesFunc;
}

serverInstance.interceptors.request.use(async req => {
  if (!req.headers.common.Authorization)
    throw new axios.Cancel("No Authorizarion header found");
  const decodedToken = jwt.decode(req.headers.common.Authorization.slice(7));
  if (Math.ceil(Date.now() / 1000) >= decodedToken.exp - 300) {
    await getNewToken().then(response => {
      const { token, rft } = response.data;
      req.headers.common.Authorization = `Bearer ${token}`;
      setCookies({ authToken: token, rft });
    });
  }
  return req;
});

const requestGenerator = (instance, method) => (url, params) => {
  if (method.match(/get|delete/)) params = { params };
  return instance[method](url, params).catch(console.error);
};

module.exports = {
  get: requestGenerator(serverInstance, "get"),
  post: requestGenerator(serverInstance, "post"),
  patch: requestGenerator(serverInstance, "patch"),
  delete: requestGenerator(serverInstance, "delete"),
  postAuth: requestGenerator(authInstance, "post"),
  setAuth,
  getNewToken
};
