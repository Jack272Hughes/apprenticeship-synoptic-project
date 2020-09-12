const app = require("express")();
const upload = require("multer")();
const cors = require("cors");
const expressJwt = require("express-jwt");

const { jwtSecret } = require("./config.js");
const dataAccessor = require("./utils/dataAccessor");

app.use(upload.array());
app.use(
  cors({
    origin: ["http://localhost:3000"],
    credentials: true
  })
);

app.use(expressJwt({ secret: jwtSecret, algorithms: ["HS256"] }));

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

app.get("/question/:questionId/answers", (req, res) => {
  const questionId = req.params.questionId;
  dataAccessor.answers.all(questionId).then(answers => {
    res.json({ answers });
  });
});

app.listen(8080);
