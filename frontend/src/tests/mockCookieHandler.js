import mockedData from "./mockedData.json";
import cookieHandler from "../utils/cookieHandler";

jest.mock("../utils/cookieHandler");

const cookies = {};
const setCookies = jest.fn();
const removeCookies = jest.fn();

setCookies.mockImplementation(newCookies => {
  Object.entries(newCookies).forEach(([cookieKey, cookieValue]) => {
    cookies[cookieKey] = cookieValue;
  });
});
removeCookies.mockImplementation(cookieKeys => {
  cookieKeys.forEach(key => delete cookies[key]);
});

beforeEach(() => {
  setCookies.mockClear();
  removeCookies.mockClear();
  cookies.authToken = mockedData.mockedAuthToken;
  cookies.rft = "1234567890abcdefghij==";
});

cookieHandler.mockImplementation(() => {
  return [cookies, setCookies, removeCookies];
});

export { cookies, setCookies, removeCookies };
