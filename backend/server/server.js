const express = require("express");
const app = express();
const upload = require("multer")();
const cors = require("cors");
const expressJwt = require("express-jwt");
const jwt = require("jsonwebtoken");

const { jwtSecret } = require("../config.js");
const dataAccessor = require("../utils/dataAccessor");
const roles = { USER: 0, MODERATOR: 1, ADMIN: 2 };

app.use(express.json());
app.use(upload.array());
app.use(
  cors({
    origin: ["http://localhost:3000"],
    credentials: true
  })
);

if (process.env.NODE_ENV !== "test") {
  app.use(expressJwt({ secret: jwtSecret, algorithms: ["HS256"] }));
}

const shouldHaveRole = role => (req, res, next) => {
  const [, bearerToken] = Object.entries(req.headers).find(
    ([headerKey]) => headerKey.toLowerCase() === "authorization"
  );

  const authToken = jwt.decode(bearerToken.slice(7));
  const currentRole = roles[authToken.role];

  if (currentRole < roles[role]) return res.sendStatus(403);
  else next();
};

function objectIsEmpty(obj) {
  return JSON.stringify(obj) === "{}";
}

app.get("/quizzes", (req, res) => {
  dataAccessor.quizzes.all().then(quizzes => {
    res.json({ quizzes });
  });
});

app.post("/quizzes", shouldHaveRole("ADMIN"), (req, res) => {
  const { quiz } = req.body;

  if (!quiz || objectIsEmpty(quiz)) return res.sendStatus(404);

  dataAccessor.quizzes
    .add(quiz)
    .then(() => res.sendStatus(200))
    .catch(() => res.sendStatus(500));
});

app.patch("/quizzes/:quizId", shouldHaveRole("ADMIN"), (req, res) => {
  const quizId = req.params.quizId;
  const { quiz } = req.body;

  if (!quiz || objectIsEmpty(quiz)) return res.sendStatus(404);

  dataAccessor.quizzes
    .update(quizId, quiz)
    .then(() => res.sendStatus(200))
    .catch(() => res.sendStatus(500));
});

app.delete("/quizzes/:quizId", shouldHaveRole("ADMIN"), (req, res) => {
  const quizId = req.params.quizId;

  dataAccessor.quizzes
    .delete(quizId)
    .then(() => res.sendStatus(200))
    .catch(() => res.sendStatus(500));
});

app.get("/quizzes/:quizId", (req, res) => {
  const quizId = req.params.quizId;
  dataAccessor.quizzes.get(quizId).then(quiz => {
    if (quiz.length === 0) res.sendStatus(404);
    else res.json({ quiz: quiz[0] });
  });
});

app.get("/quizzes/:quizId/questions", (req, res) => {
  const quizId = req.params.quizId;
  dataAccessor.questions.all(quizId).then(questions => {
    res.json({ questions });
  });
});

app.get(
  "/quizzes/:quizId/questions/answers",
  shouldHaveRole("MODERATOR"),
  (req, res) => {
    const quizId = req.params.quizId;

    dataAccessor.questions.answers.all(quizId).then(questions => {
      res.json({ questions });
    });
  }
);

app.post("/quizzes/:quizId/check", (req, res) => {
  const quizId = req.params.quizId;
  const { answers: userAnswers } = req.body;
  if (!userAnswers) return res.sendStatus(404);

  dataAccessor.questions.answers.correct(quizId).then(questions => {
    if (objectIsEmpty(userAnswers)) {
      return res.json({
        total: questions.reduce((acc, { answers }) => acc + answers.length, 0),
        correct: 0
      });
    }

    let result = { total: 0, correct: 0 };

    questions.forEach(({ id: questionId, answers }) => {
      let userAnswer = userAnswers[questionId];
      if (!Array.isArray(userAnswer)) userAnswer = [userAnswer];

      answers.forEach(answer => {
        result.total++;
        if (userAnswer.includes(answer)) result.correct++;
      });
    });
    res.json(result);
  });
});

app.post("/users/:userOid/scores", (req, res) => {
  const userOid = req.params.userOid;
  const { score } = req.body;

  if (!score || objectIsEmpty(score)) return res.sendStatus(404);

  dataAccessor.scores
    .add(userOid, score)
    .then(() => res.sendStatus(200))
    .catch(() => res.sendStatus(500));
});

if (process.env.NODE_ENV !== "test") app.listen(8080);

module.exports = app;
