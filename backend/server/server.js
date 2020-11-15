const express = require("express");
const app = express();
const upload = require("multer")();
const cors = require("cors");
const expressJwt = require("express-jwt");

const { jwtSecret } = require("../config.js");
const dataAccessor = require("../utils/dataAccessor");

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

app.get("/quizzes", (req, res) => {
  dataAccessor.quizzes.all().then(quizzes => {
    res.json({ quizzes });
  });
});

app.get("/quizzes/:quizId/questions", (req, res) => {
  const quizId = req.params.quizId;
  dataAccessor.questions.all(quizId).then(questions => {
    res.json({ questions });
  });
});

app.post("/quizzes/:quizId/check", (req, res) => {
  const quizId = req.params.quizId;
  const { answers: userAnswers } = req.body;
  dataAccessor.answers.allCorrect(quizId).then(actualAnswers => {
    let result = { total: 0, correct: 0 };
    actualAnswers.forEach(({ questionId, answers }) => {
      answers.forEach(answer => {
        result.total++;
        if (userAnswers[questionId].includes(answer)) result.correct++;
      });
    });
    res.json(result);
  });
});

if (process.env.NODE_ENV !== "test") app.listen(8080);

module.exports = app;
