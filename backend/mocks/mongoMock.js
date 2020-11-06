jest.mock("mongodb", () => {
  return {
    MongoClient: class {
      connect() {
        return new Promise(resolve => resolve({}));
      }
    }
  };
});
