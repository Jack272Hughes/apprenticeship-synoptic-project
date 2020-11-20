import axios from "axios";
jest.mock("axios");

let interceptorFunction;
const interceptorsUse = jest.fn(func => (interceptorFunction = func));
const mockedAxiosCall = jest.fn();
const mockCookiesFunction = jest.fn();
axios.create = () => {
  return {
    defaults: { headers: { common: {} } },
    interceptors: { request: { use: interceptorsUse } },
    get: mockedAxiosCall,
    post: mockedAxiosCall,
    patch: mockedAxiosCall,
    delete: mockedAxiosCall
  };
};

beforeEach(() => mockedAxiosCall.mockReset());

const axiosInstance = jest.requireActual("../../utils/axiosInstance").default;
import mockedData from "../mockedData.json";

describe("When testing axiosInstance", () => {
  it("Should be able to call setAuth to pass a token and cookie functions", () => {
    axiosInstance.setAuth(
      "authToken",
      mockCookiesFunction,
      mockCookiesFunction
    );
  });

  it("Should add an interceptor when initiliasing", () => {
    expect(interceptorsUse).toBeCalledWith(expect.any(Function));
  });

  let dateSpy;
  it("Should attempt to get a new token when the existing token is about to expire", async () => {
    dateSpy = jest.spyOn(Date, "now").mockImplementation(() => 400000);
    mockedAxiosCall.mockResolvedValue({
      data: { token: "newToken", rft: "newRft" }
    });

    await interceptorFunction({
      headers: {
        common: { Authorization: mockedData.bearerToken }
      }
    });

    expect(mockedAxiosCall).toBeCalledWith("/token");
  });

  it("Should attempt to store the new token in cookies when getting a new token", () => {
    expect(mockCookiesFunction).toBeCalledWith({
      authToken: "newToken",
      rft: "newRft"
    });

    mockCookiesFunction.mockReset();
    dateSpy.mockRestore();
  });

  it("Should call the current function with correct parameters with GET", () => {
    axiosInstance.get("/route", { param1: "param1" });
    expect(mockedAxiosCall).toBeCalledWith("/route", {
      params: { param1: "param1" }
    });
  });

  it("Should call the current function with correct parameters with POST", () => {
    axiosInstance.post("/route", { param1: "param1" });
    expect(mockedAxiosCall).toBeCalledWith("/route", { param1: "param1" });
  });

  it("Should call the current function with correct parameters with PATCH", () => {
    axiosInstance.patch("/route", { param1: "param1" });
    expect(mockedAxiosCall).toBeCalledWith("/route", { param1: "param1" });
  });

  it("Should call the current function with correct parameters with DELETE", () => {
    axiosInstance.delete("/route", { param1: "param1" });
    expect(mockedAxiosCall).toBeCalledWith("/route", {
      params: { param1: "param1" }
    });
  });

  it("Should call the current function with correct parameters with POST to auth", () => {
    axiosInstance.postAuth("/route", { param1: "param1" });
    expect(mockedAxiosCall).toBeCalledWith("/route", { param1: "param1" });
  });
});
