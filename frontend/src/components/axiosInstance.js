const axios = require("axios");
const jwt = require("jsonwebtoken");
const config = require("../config");

let setCookie;
let removeCookie;

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
    console.error(err);
    if (err.response && err.response.status === 403) {
      removeCookie("authToken");
      removeCookie("rft");
    }
  });
}

serverInstance.interceptors.request.use(async req => {
  const decodedToken = jwt.decode(req.headers.common.Authorization.slice(7));
  if (Math.ceil(Date.now() / 1000) >= decodedToken.exp - 45) {
    await getNewToken().then(response => {
      const { token, rft } = response.data;
      req.headers.common.Authorization = `Bearer ${token}`;
      setCookie("authToken", token);
      setCookie("rft", rft);
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
  setAuth: (token, setCookieFunc, removeCookieFunc) => {
    setCookie = setCookieFunc;
    removeCookie = removeCookieFunc;
    serverInstance.defaults.headers.common.Authorization = `Bearer ${token}`;
  },
  postAuth: requestGenerator(authInstance, "post"),
  getNewToken
};
