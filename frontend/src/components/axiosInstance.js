const axios = require("axios");
const jwt = require("jsonwebtoken");
const config = require("../config");

let setCookie;

const serverInstance = axios.create({
  baseURL: config.serverHost,
  withCredentials: true
});

const authInstance = axios.create({
  baseURL: config.authHost,
  withCredentials: true
});

function getNewToken() {
  return authInstance.post("/token").catch(console.error);
}

serverInstance.interceptors.request.use(async req => {
  const decodedToken = jwt.decode(req.headers.common.Authorization.slice(7));
  if (Math.ceil(Date.now() / 1000) >= decodedToken.exp - 45) {
    await getNewToken().then(response => {
      setCookie("authToken", response.data.token);
      setCookie("rft", response.data.rft);
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
  setAuth: (token, setCookieFunc) => {
    setCookie = setCookieFunc;
    serverInstance.defaults.headers.common.Authorization = `Bearer ${token}`;
  },
  postAuth: requestGenerator(authInstance, "post"),
  getNewToken
};
