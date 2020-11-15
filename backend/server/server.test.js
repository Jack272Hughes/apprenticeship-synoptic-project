const supertest = require("supertest");
const server = require("./server");

const dataAccessor = require("../utils/dataAccessor");

let app, request;

afterAll(() => {
  app.close();
});

describe("When running the authServer it", () => {
  afterAll(async () => {
    request = supertest(app);
  });

  it("Should start successfully", done => {
    app = server.listen(0, what => {
      expect(app).toBeDefined();
      done();
    });
  });
});

describe("When calling the route GET /quizzes it", () => {
  const mockQuizzes = [{ name: "quiz1" }, { name: "quiz2" }];

  beforeEach(() => {
    mockDataAccessor("quizzes.all", mockQuizzes);
  });

  it("Should call dataAccessor.quizzes.all function", async () => {
    await request.get("/quizzes");
    expect(dataAccessor.quizzes.all).toBeCalled();
  });

  it("Should return all correct quizzes in an object", done => {
    request.get("/quizzes").expect(200, { quizzes: mockQuizzes }, done);
  });
});

describe("When calling the route GET /quizzes/1 it", () => {
  const mockQuiz = [{ name: "quiz1" }];

  beforeEach(() => {
    mockDataAccessor("quizzes.get", mockQuiz);
  });

  it("Should call dataAccessor.quizzes.get function", async () => {
    await request.get("/quizzes/1");
    expect(dataAccessor.quizzes.get).toBeCalledWith("1");
  });

  it("Should return all correct quizzes in an object", done => {
    request.get("/quizzes/1").expect(200, { quiz: mockQuiz[0] }, done);
  });
});

describe("When calling the route GET /quizzes/:quizId/questions it", () => {
  const mockQuestions = [{ name: "question1" }, { name: "question2" }];

  beforeEach(() => {
    mockDataAccessor("questions.all", mockQuestions);
  });

  it("Should call dataAccessor.questions.all function with correct parameter", async () => {
    await request.get("/quizzes/1/questions");
    expect(dataAccessor.questions.all).toBeCalledWith("1");
  });

  it("Should return all correct questions in an object", done => {
    request
      .get("/quizzes/1/questions")
      .expect(200, { questions: mockQuestions }, done);
  });
});

describe("When calling the route POST /quizzes/1/check it", () => {
  const mockCorrectAnswers = [
    { questionId: "radio", answers: ["a"] },
    { questionId: "checkbox", answers: ["b", "c"] }
  ];

  beforeEach(() => {
    mockDataAccessor("questions.answers.correct", mockCorrectAnswers);
  });

  it("Should call dataAccessor.questions.answers.correct function with correct parameter", async () => {
    await request
      .post("/quizzes/1/check")
      .send({ answers: { radio: [], checkbox: [] } });
    expect(dataAccessor.questions.answers.correct).toBeCalledWith("1");
  });

  it("Should return maximum total and total correct", done => {
    request
      .post("/quizzes/1/check")
      .send({
        answers: {
          radio: "a",
          checkbox: ["b", "e"]
        }
      })
      .expect(200, { total: 3, correct: 2 }, done);
  });
});

// describe("When calling the route POST /quizzes it", () => {
//   it("Should call the dataAccessor.quizzes.add function", async () => {
//     await request.post("/quizzes").send({});
//     expect(dataAccessor.quizzes.add).toBeCalledWith({});
//   });
// });

// describe("When calling the route PATCH /quizzes/1 it", () => {});

// describe("When calling the route DELETE /quizzes/1 it", () => {});
