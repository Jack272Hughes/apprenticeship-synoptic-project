db.users.createIndex("username", { unique: true });
db.refreshTokens.createIndex("createdAt", {
  expireAfterSeconds: 2592000
});

db.users.insertOne({
  username: "Admin",
  password: "dc362e626c92aef0581351c2308328bc6edbff404b87da8a137ede787995c41c",
  salt: "5diMdMXnRucq0iKDQv6zLw==",
  role: "ADMIN"
});

db.users.insertOne({
  username: "Moderator",
  password: "b8f63bc39087b60f27c31fd22ef666d7d2fdea5dc75297d08d8b52e82f5fcad0",
  salt: "/yvYnnpbVkUEe1vFnjna6Q==",
  role: "MODERATOR"
});

db.users.insertOne({
  username: "User",
  password: "19eb1beae4d065eab13167b59ea9779d77912b052dc31f360c10af94304154ac",
  salt: "ciMT3f3eyePD+U8OcvSkCg==",
  role: "USER"
});

db.quizzes.insertOne({
  _id: ObjectId("5fb4644afa09ec57a97fd13f"),
  userOid: "123abc",
  name: "Maths Quiz",
  description: "Some basic maths questions to warm up your brain"
});

db.questions.insertMany([
  {
    quizId: ObjectId("5fb4644afa09ec57a97fd13f"),
    name: "What is 2 + 2?",
    multipleAnswers: false,
    answers: [
      { correct: true, value: "4" },
      { correct: false, value: "8" }
    ]
  },
  {
    quizId: ObjectId("5fb4644afa09ec57a97fd13f"),
    name: "What is 4 x 6?",
    multipleAnswers: false,
    answers: [
      { correct: true, value: "24" },
      { correct: false, value: "26" }
    ]
  },
  {
    quizId: ObjectId("5fb4644afa09ec57a97fd13f"),
    name: "Which answers will result in 16?",
    multipleAnswers: true,
    answers: [
      { correct: true, value: "4 x 4" },
      { correct: true, value: "8 x 2" },
      { correct: false, value: "6 x 2" }
    ]
  }
]);
