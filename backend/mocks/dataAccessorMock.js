jest.mock("../utils/dataAccessor");
const dataAccessor = require("../utils/dataAccessor");

let functionsToReset = [];
let functionsToResetLast = [];
let globalFunctionValues = {};

afterEach(() => {
  functionsToReset.forEach(mockedFunction => {
    mockedFunction.mockReset();
    // Checks to see if this function has a globally set value from 'resetLast' option
    // And resets it back to that instead
    if (functionsToResetLast.includes(mockedFunction)) {
      const globalValueObject = globalFunctionValues[mockedFunction.name];
      mockedFunction[globalValueObject.mockFunctionType](
        globalValueObject.returnedValue
      );
    }
  });
  functionsToResetLast.forEach(mockedFunction => mockedFunction.mockClear());
  functionsToReset = [];
});

afterAll(() => {
  functionsToResetLast.forEach(mockedFunction => mockedFunction.mockReset());
  functionsToResetLast = [];
  globalFunctionValues = {};
});

/*
  mockDataAccessor function is for mocking the return values of dataAccessor's functions
  The functions can sometimes be quite deep in the dataAccessor object tree, for example:
      dataAccessor.users.add()
  
  For this reason, when you pass the route to the function, with the functionRoute parameter,
  you can use dot notation, for example:
      "users.add"

  This will find the above function and then mock the resolved value of the promise with
  the returnedValue parameter or, if options contain { reject: true }, it will mock the rejected value.

  If options contain { persist: true } then mockResolvedValue will be preferred over mockResolvedValueOnce
  leading to the function always returning that value until it moves onto the next test

  If options contain { resetLast: true } then it will only reset the mocked function after all tests in a file
  have been finished but will still clear function calls between tests.

  To make sure the dataAccessorMock isn't the cause of any unsuccessful tests due to bad mocking, tests
  have been created and stored within this folder
*/
global.mockDataAccessor = (functionRoute, returnedValue, options = {}) => {
  accessorFunction = functionRoute
    .split(".")
    .reduce(
      (objectTree, objectKey) => (objectTree = objectTree[objectKey]),
      dataAccessor
    );

  let mockFunctionType = options.reject
    ? "mockRejectedValue"
    : "mockResolvedValue";
  if (!options.persist && !options.resetLast) mockFunctionType += "Once";

  accessorFunction[mockFunctionType](returnedValue);

  if (options.resetLast) {
    functionsToResetLast.push(accessorFunction);
    globalFunctionValues[accessorFunction.name] = {
      returnedValue,
      mockFunctionType
    };
  } else functionsToReset.push(accessorFunction);
};
