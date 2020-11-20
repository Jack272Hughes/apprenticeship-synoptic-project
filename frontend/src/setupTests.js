import "@testing-library/jest-dom/extend-expect";
import React from "react";
import axiosInstance from "./utils/axiosInstance";

// Unfortunately, grommet's Meter component fails to render due to a problem with styled components global
jest.mock("grommet", () => {
  return {
    ...jest.requireActual("grommet"),
    Meter: () => <div></div>
  };
});

// Mock MutationObserver otherwise react testing library complains
global.MutationObserver = class {
  constructor(callback) {}
  disconnect() {}
  observe(element, initObject) {}
};

jest.mock("./utils/axiosInstance", () => {
  return {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
    setAuth: jest.fn(),
    postAuth: jest.fn(),
    getNewToken: jest.fn()
  };
});

const httpMethods = ["get", "post", "patch", "delete", "postAuth"];
const mockImplementation = httpMethod => url => {
  return new Promise((resolve, reject) => {
    const routeObject = routes.find(
      route => route.url === url && route.httpMethod === httpMethod
    );
    if (!routeObject) {
      console.log(
        `${httpMethod.toUpperCase()} ${url} has not been given a mocked value`
      );
      return resolve({ data: {} });
    }

    if (routeObject.reject) reject(routeObject.value);
    else resolve({ data: routeObject.value });
  });
};

httpMethods.forEach(method =>
  axiosInstance[method].mockImplementation(mockImplementation(method))
);

let routes = [];
afterEach(() => {
  httpMethods.forEach(functionName => {
    axiosInstance[functionName].mockClear();
  });
  routes = routes.filter(route => route.persist);
});

afterAll(() => {
  routes = [];
});

/*
  mockAxios is a simple function that mocks any call made to the axiosInstance.
  The function takes a http method, route and value to resolve to and stores it
  as an object in the routes array.

  Everytime axiosInstance is called it will check the routes array and see if
  any of the objects matche the url and httpMethod then, if it finds something,
  it will resolve with that value, otherwise it will resolve with an empty array.

  If options contain { persist: true } the routeObject will only be removed after
  every test has been done in a file

  If options contain { reject: true } the value in the routeObject will be used
  to reject the call rather than resolve

  Any unknown routes that found no match will be outputted to the console.

  To make sure axiosMock isn't the cause for any unsuccessful tests due to bad
  mocking, tests have been created in the test/utils folder
*/
global.mockAxios = (httpMethod, route, value, options) => {
  routes.unshift({
    httpMethod,
    value,
    url: route,
    ...options
  });
};
