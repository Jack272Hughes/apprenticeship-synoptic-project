const {
  formDataToDatabaseObject,
  databaseObjectToFormData,
  validateFormData
} = require("../../utils/formFormatter");

const mockFormDataArray = [
  {
    useCheckboxes: true,
    buttonGroupAnswers: ["answer1", "answer2", "answer3", "answer4"],
    selectedAnswers: ["answer1", "answer3"],
    answerInputField: "leftoverInput",
    questionValue: "question1"
  },
  {
    id: "mockDataId",
    useCheckboxes: false,
    buttonGroupAnswers: ["answer5", "answer6", "answer7", "answer8"],
    selectedAnswers: "answer7",
    answerInputField: "",
    questionValue: "question2"
  }
];

const mockDatabaseObjectArray = [
  {
    quizId: "mockQuizId",
    multipleAnswers: true,
    name: "question1",
    answers: [
      { value: "answer1", correct: true },
      { value: "answer2", correct: false },
      { value: "answer3", correct: true },
      { value: "answer4", correct: false }
    ]
  },
  {
    quizId: "mockQuizId",
    multipleAnswers: false,
    name: "question2",
    id: "mockDataId",
    answers: [
      { value: "answer5", correct: false },
      { value: "answer6", correct: false },
      { value: "answer7", correct: true },
      { value: "answer8", correct: false }
    ]
  }
];

describe("When testing the formDataToDatabaseObject function it", () => {
  it("Should return the formData correctly formatted", () => {
    expect(
      formDataToDatabaseObject("mockQuizId", mockFormDataArray)
    ).toMatchObject(mockDatabaseObjectArray);
  });
});

describe("When testing the databaseObjectToFormData function it", () => {
  it("Should return the databaseObject correctly formatted", () => {
    // Will always generate a copy because otherwise the original objects inside array will get mutated
    const mockFormDataCopy = JSON.parse(JSON.stringify(mockFormDataArray));
    mockFormDataCopy[0].answerInputField = "";

    expect(databaseObjectToFormData(mockDatabaseObjectArray)).toMatchObject(
      mockFormDataCopy
    );
  });
});

describe("When testing the validateFormData function it", () => {
  let mockFormDataCopy;
  beforeEach(
    () => (mockFormDataCopy = JSON.parse(JSON.stringify(mockFormDataArray)))
  );

  it("Should return missingQuestions error with an array of question numbers when questionValue is empty", () => {
    delete mockFormDataCopy[0].questionValue;
    expect(validateFormData(mockFormDataCopy)).toMatchObject({
      "missing questions": [1]
    });
  });

  it("Should return missingAnswers error with an array of question numbers when buttonGroupAnswers has less than two elements", () => {
    mockFormDataCopy[0].buttonGroupAnswers = [];
    mockFormDataCopy[1].buttonGroupAnswers = ["answer1"];
    expect(validateFormData(mockFormDataCopy)).toMatchObject({
      "missing answers": [1, 2]
    });
  });

  it("Should return missingCorrectAnswers error with an array of question numbers when selected answers is empty", () => {
    mockFormDataCopy[0].selectedAnswers = [];
    mockFormDataCopy[1].selectedAnswers = "";
    expect(validateFormData(mockFormDataCopy)).toMatchObject({
      "missing correct answers": [1, 2]
    });
  });

  it("Should return null when it successfully validates", () => {
    expect(validateFormData(mockFormDataCopy)).toBeNull();
  });
});
