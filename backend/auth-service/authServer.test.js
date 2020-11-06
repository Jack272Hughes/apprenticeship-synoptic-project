const server = require("./authServer");
let app = {};

afterAll(() => {
  app.close();
});

describe("When running the authServer", () => {
  it("Should start successfully", async () => {
    server.on("close", () => console.log("closing"));
    app = server.listen(0, () => {
      expect(app).toMatchObject(expect.any(Object));
    });
  });
});
