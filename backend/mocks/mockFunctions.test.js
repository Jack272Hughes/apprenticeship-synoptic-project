const dataAccessor = require("../utils/dataAccessor");

dataAccessor.testFunctions = {
  mockOnce: jest.fn(),
  mockPersist: jest.fn(),
  mockResetLast: jest.fn(),
  mockParameters: jest.fn()
};

mockDataAccessor("testFunctions.mockResetLast", "notResetAfterEach", {
  resetLast: true
});

afterAll(() => delete dataAccessor.testFunctions);

describe("When testing the mockDataAccessor function it", () => {
  it("Should be able to mock the resolved value of a function once", async () => {
    mockDataAccessor("testFunctions.mockOnce", "resolvedValue");

    dataAccessor.testFunctions
      .mockOnce()
      .then(response => expect(response).toBe("resolvedValue"));

    expect(() => {
      dataAccessor.testFunctions.mockOnce().then();
    }).toThrow("Cannot read property 'then' of undefined");
  });

  it("Should be able to mock the rejected value of a function once with option 'reject'", async () => {
    mockDataAccessor("testFunctions.mockOnce", "rejectedValue", {
      reject: true
    });

    dataAccessor.testFunctions
      .mockOnce()
      .catch(response => expect(response).toBe("rejectedValue"));

    expect(() => {
      dataAccessor.testFunctions.mockOnce().catch();
    }).toThrow("Cannot read property 'catch' of undefined");
  });

  it("Should be able to mock a function more than once with option 'persist'", () => {
    mockDataAccessor("testFunctions.mockPersist", "persistentValue", {
      persist: true
    });

    for (let times = 0; times < 2; times++) {
      dataAccessor.testFunctions
        .mockPersist()
        .then(response => expect(response).toBe("persistentValue"));
    }
  });

  it("Should clean mocked functions after each test if not using option 'resetLast'", () => {
    // Mocked objects store all the information about being called in the "mock" key
    Object.values(dataAccessor.testFunctions).forEach(mockedFunction => {
      if (mockedFunction.name !== "mockResetLast") {
        Object.values(mockedFunction.mock).forEach(mockedData => {
          expect(mockedData).toHaveLength(0);
        });
      }
    });
  });

  it("Should be able to mock a function until the end of ALL tests with option 'resetLast'", () => {
    dataAccessor.testFunctions
      .mockResetLast()
      .then(response => expect(response).toBe("notResetAfterEach"));
  });
});
