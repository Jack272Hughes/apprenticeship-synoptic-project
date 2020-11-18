const url = "mongodb://localhost:27017";
const dbName = "quizmaster";

const client = new require("mongodb").MongoClient(url, {
  useUnifiedTopology: true
});

client
  .connect()
  .then(client => {
    console.log("Connection Successful!");

    const operations = [];
    const db = client.db(dbName);

    operations.push(
      db.collection("users").createIndex("username", { unique: true })
    );
    operations.push(
      db.collection("refreshTokens").createIndex("createdAt", {
        expireAfterSeconds: 2592000
      })
    );

    operations.push(
      db.users.insertOne({
        username: "Admin",
        password:
          "dc362e626c92aef0581351c2308328bc6edbff404b87da8a137ede787995c41c",
        salt: "5diMdMXnRucq0iKDQv6zLw==",
        role: "ADMIN"
      })
    );

    operations.push(
      db.users.insertOne({
        username: "Moderator",
        password:
          "b8f63bc39087b60f27c31fd22ef666d7d2fdea5dc75297d08d8b52e82f5fcad0",
        salt: "/yvYnnpbVkUEe1vFnjna6Q==",
        role: "MODERATOR"
      })
    );

    operations.push(
      db.users.insertOne({
        username: "User",
        password:
          "19eb1beae4d065eab13167b59ea9779d77912b052dc31f360c10af94304154ac",
        salt: "ciMT3f3eyePD+U8OcvSkCg==",
        role: "USER"
      })
    );

    operations.push(
      new Promise((resolve, reject) => {
        db.collection("quizzes")
          .insertOne({
            userOid: "123abc",
            name: "Maths Quiz",
            description: "Some basic maths questions to warm up your brain"
          })
          .then(dataObj => {
            const questionId = dataObj.insertedId;
            db.collection("questions")
              .insertMany([
                {
                  quizId: questionId,
                  name: "What is 2 + 2?",
                  multipleAnswers: false,
                  answers: [
                    { correct: true, value: "4" },
                    { correct: false, value: "8" }
                  ]
                },
                {
                  quizId: questionId,
                  name: "What is 4 x 6?",
                  multipleAnswers: false,
                  answers: [
                    { correct: true, value: "24" },
                    { correct: false, value: "26" }
                  ]
                },
                {
                  quizId: questionId,
                  name: "Which answers will result in 16?",
                  multipleAnswers: true,
                  answers: [
                    { correct: true, value: "4 x 4" },
                    { correct: true, value: "8 x 2" },
                    { correct: false, value: "6 x 2" }
                  ]
                }
              ])
              .then(() => resolve())
              .catch(err => reject(err));
          })
          .catch(err => reject(err));
      })
    );

    Promise.all(operations)
      .then(() => client.close())
      .catch(console.error);
  })
  .catch(console.error);
