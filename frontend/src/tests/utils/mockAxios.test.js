import axiosInstance from "../../utils/axiosInstance";

beforeAll(() => {
  mockAxios("get", "/global", "GlobalValue", { persist: true });
});

describe("When testing mockAxios it", () => {
  it("Should allow you to mock the resolved value for a route", async () => {
    mockAxios("get", "/resolve", "ResolvedValue");
    await axiosInstance
      .get("/resolve")
      .then(response =>
        expect(response).toStrictEqual({ data: "ResolvedValue" })
      );
  });

  it("Should allow you to mock the rejected value for a route", async () => {
    mockAxios("get", "/reject", "RejectedValue", { reject: true });
    await axiosInstance
      .get("/reject")
      .catch(response => expect(response).toStrictEqual("RejectedValue"));
  });

  it("Should allow you to overwrite an existing mock", async () => {
    mockAxios("get", "/overwrite", "OldValue");
    mockAxios("get", "/overwrite", "NewValue");
    await axiosInstance
      .get("/overwrite")
      .then(response => expect(response).toStrictEqual({ data: "NewValue" }));
  });

  it("Should only mock a route for a specific http method", async () => {
    mockAxios("post", "/route", "PostValue");
    mockAxios("get", "/route", "GetValue");
    await axiosInstance
      .post("/route")
      .then(response => expect(response).toStrictEqual({ data: "PostValue" }));
  });

  let consoleLogSpy;
  it("Should resolve to an empty array if no route is specified", async () => {
    // The mockAxios function console logs when a route isn't mocked but in this case, that is expected
    consoleLogSpy = jest.spyOn(console, "log").mockImplementation(() => {});

    await axiosInstance
      .get("/unknown")
      .then(response => expect(response).toStrictEqual({ data: {} }));

    expect(consoleLogSpy).toBeCalledWith(
      "GET /unknown has not been given a mocked value"
    );
  });

  it("Should reset all non persistent routes after each test", async () => {
    await axiosInstance
      .get("/resolve")
      .then(response => expect(response).toStrictEqual({ data: {} }));

    // Re-enable console logging
    consoleLogSpy.mockRestore();
  });

  it("Should not reset persistent routes until after every test", async () => {
    await axiosInstance
      .get("/global")
      .then(response =>
        expect(response).toStrictEqual({ data: "GlobalValue" })
      );
  });
});
