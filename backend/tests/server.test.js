const supertest = require("supertest");
const server = require("../server/server");

const dataAccessor = require("../utils/dataAccessor");
const mockAuthTokens = require("../server/mockAuthTokens");

jest.unmock("jsonwebtoken");
let app, request;

afterAll(() => {
  app.close();
});

const requestGenerator = httpMethod => (route, role = "ADMIN") => {
  return request[httpMethod](route).set(
    "Authorization",
    `Bearer ${mockAuthTokens[role]}`
  );
};

const requestWithAuth = {
  get: requestGenerator("get"),
  post: requestGenerator("post"),
  patch: requestGenerator("patch"),
  delete: requestGenerator("delete")
};

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

describe("When calling the route POST /quizzes it", () => {
  const mockQuiz = { quiz: { name: "quiz1" } };

  beforeEach(() => {
    mockDataAccessor("quizzes.add", true);
  });

  it("Should send a status of 404 when no body is sent", done => {
    requestWithAuth.post("/quizzes", "ADMIN").expect(404, done);
  });

  it("Should send a status of 404 when an empty object is sent", done => {
    requestWithAuth
      .post("/quizzes", "ADMIN")
      .send({ quiz: {} })
      .expect(404, done);
  });

  it("Should send a status of 403 when a non-admin authorization token is sent", done => {
    requestWithAuth.post("/quizzes", "MODERATOR").expect(403, done);
  });

  it("Should call dataAccessor.quizzes.add function wuth correct parameter", async () => {
    await requestWithAuth.post("/quizzes", "ADMIN").send(mockQuiz);
    expect(dataAccessor.quizzes.add).toBeCalledWith({ name: "quiz1" });
  });

  it("Should send a status of 200 when adding successfully", done => {
    requestWithAuth.post("/quizzes", "ADMIN").send(mockQuiz).expect(200, done);
  });
});

describe("When calling the route PATCH /quizzes/1 it", () => {
  const mockQuiz = { quiz: { name: "quiz1" } };

  beforeEach(() => {
    mockDataAccessor("quizzes.update", true);
  });

  it("Should send a status of 404 when no body is sent", done => {
    requestWithAuth.patch("/quizzes/1", "ADMIN").expect(404, done);
  });

  it("Should send a status of 404 when an empty object is sent", done => {
    requestWithAuth
      .patch("/quizzes/1", "ADMIN")
      .send({ quiz: {} })
      .expect(404, done);
  });

  it("Should send a status of 403 when a non-admin authorization token is sent", done => {
    requestWithAuth.patch("/quizzes/1", "MODERATOR").expect(403, done);
  });

  it("Should call dataAccessor.quizzes.update function wuth correct parameters", async () => {
    await requestWithAuth.patch("/quizzes/1", "ADMIN").send(mockQuiz);
    expect(dataAccessor.quizzes.update).toBeCalledWith("1", { name: "quiz1" });
  });

  it("Should send a status of 200 when updating successfully", done => {
    requestWithAuth
      .patch("/quizzes/1", "ADMIN")
      .send(mockQuiz)
      .expect(200, done);
  });
});

describe("When calling the route DELETE /quizzes/1 it", () => {
  beforeEach(() => {
    mockDataAccessor("quizzes.delete", true);
  });

  it("Should send a status of 403 when a non-admin authorization token is sent", done => {
    requestWithAuth.delete("/quizzes/1", "MODERATOR").expect(403, done);
  });

  it("Should call dataAccessor.quizzes.delete function with correct parameter", async () => {
    await requestWithAuth.delete("/quizzes/1", "ADMIN");
    expect(dataAccessor.quizzes.delete).toBeCalledWith("1");
  });

  it("Should send a status of 200 when successfully deleting", done => {
    requestWithAuth.delete("/quizzes/1", "ADMIN").expect(200, done);
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

  it("Should return the correct quiz in an object", done => {
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

describe("When calling the route GET /quizzes/1/questions/answers it", () => {
  const mockQuestions = [{ id: "quiz1" }];

  beforeEach(() => {
    mockDataAccessor("questions.answers.all", mockQuestions);
  });

  it("Should send a status of 403 when a non-moderator authorization token is sent", done => {
    requestWithAuth
      .get("/quizzes/1/questions/answers", "USER")
      .expect(403, done);
  });

  it("Should call dataAccessor.questions.answers.all function with correct parameter", async () => {
    await requestWithAuth.get("/quizzes/1/questions/answers", "MODERATOR");
    expect(dataAccessor.questions.answers.all).toBeCalledWith("1");
  });

  it("Should return all questions successfully", done => {
    requestWithAuth
      .get("/quizzes/1/questions/answers", "MODERATOR")
      .expect(200, { questions: mockQuestions }, done);
  });
});

describe("When calling the route POST /quizzes/1/check it", () => {
  const mockQuestions = [
    { id: "radio", answers: ["a"] },
    { id: "checkbox", answers: ["b", "c"] }
  ];

  beforeEach(() => {
    mockDataAccessor("questions.answers.correct", mockQuestions);
  });

  it("Should return a status of 404 if no body is sent", done => {
    request.post("/quizzes/1/check").expect(404, done);
  });

  it("Should call dataAccessor.questions.answers.correct function with correct parameter", async () => {
    await request
      .post("/quizzes/1/check")
      .send({ answers: { radio: [], checkbox: [] } });
    expect(dataAccessor.questions.answers.correct).toBeCalledWith("1");
  });

  it("Should return maximum total and 0 correct when results is an empty object", done => {
    request
      .post("/quizzes/1/check")
      .send({ answers: {} })
      .expect(200, { total: 3, correct: 0 }, done);
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

describe("When calling the route POST /users/1/scores it", () => {
  beforeEach(() => {
    mockDataAccessor("scores.add", true);
  });

  it("Should return a status of 404 if no body is sent", done => {
    request.post("/users/1/scores").expect(404, done);
  });

  it("Should return a status of 404 if scores is an empty object", done => {
    request.post("/users/1/scores").send({ score: {} }).expect(404, done);
  });

  it("Should call dataAccessor.scores.add function with correct parameter", async () => {
    await request.post("/users/1/scores").send({ score: { correct: 1 } });
    expect(dataAccessor.scores.add).toBeCalledWith("1", { correct: 1 });
  });

  it("Should return a status of 200 when adding successfully", done => {
    request
      .post("/users/1/scores")
      .send({ score: { correct: 1 } })
      .expect(200, done);
  });
});
