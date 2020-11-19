const url = "mongodb://localhost:27017";
const dbName = "quizmaster";
const { MongoClient, ObjectId } = require("mongodb");

const client = new MongoClient(url, {
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
      db.collection("users").insertOne({
        username: "Admin",
        password:
          "dc362e626c92aef0581351c2308328bc6edbff404b87da8a137ede787995c41c",
        salt: "5diMdMXnRucq0iKDQv6zLw==",
        role: "ADMIN"
      })
    );

    operations.push(
      db.collection("users").insertOne({
        username: "Moderator",
        password:
          "b8f63bc39087b60f27c31fd22ef666d7d2fdea5dc75297d08d8b52e82f5fcad0",
        salt: "/yvYnnpbVkUEe1vFnjna6Q==",
        role: "MODERATOR"
      })
    );

    operations.push(
      db.collection("users").insertOne({
        username: "User",
        password:
          "19eb1beae4d065eab13167b59ea9779d77912b052dc31f360c10af94304154ac",
        salt: "ciMT3f3eyePD+U8OcvSkCg==",
        role: "USER"
      })
    );

    operations.push(
      db.collection("quizzes").insertMany([
        {
          _id: ObjectId("5fb4644afa09ec57a97fd13f"),
          userOid: "123abc",
          name: "Basic Quiz",
          description: "A basic quiz to show off radio buttons and check boxes"
        },
        {
          _id: ObjectId("5fb589da1e1cfcd1fef45633"),
          userOid: "123abc",
          name: "Short Quiz",
          description: "A quiz with just one lonely question in it"
        },
        {
          _id: ObjectId("5fb589da1e1cfcd1fef45634"),
          userOid: "123abc",
          name: "Empty Quiz",
          description:
            "A quiz with no questions in it, should have a 404 error when trying to take test"
        },
        {
          _id: ObjectId("5fb589da1e1cfcd1fef45635"),
          userOid: "123abc",
          name: "Incorrect Quiz",
          description:
            "Contains some incorrect values, if only an admin would fix them..."
        }
      ])
    );

    operations.push(
      db.collection("questions").insertMany([
        {
          quizId: ObjectId("5fb4644afa09ec57a97fd13f"),
          name: "What is 2 + 2?",
          multipleAnswers: false,
          answers: [
            { correct: false, value: "2" },
            { correct: true, value: "4" },
            { correct: false, value: "6" },
            { correct: false, value: "8" }
          ]
        },
        {
          quizId: ObjectId("5fb4644afa09ec57a97fd13f"),
          name: "What is 4 x 6?",
          multipleAnswers: false,
          answers: [
            { correct: true, value: "24" },
            { correct: false, value: "26" },
            { correct: false, value: "20" },
            { correct: false, value: "46" }
          ]
        },
        {
          quizId: ObjectId("5fb4644afa09ec57a97fd13f"),
          name: "Which answers will result in 16?",
          multipleAnswers: true,
          answers: [
            { correct: true, value: "4 x 4" },
            { correct: false, value: "6 x 2" },
            { correct: true, value: "8 x 2" },
            { correct: false, value: "12 x 1" }
          ]
        },
        {
          quizId: ObjectId("5fb4644afa09ec57a97fd13f"),
          name: "What are the factors of 8?",
          multipleAnswers: true,
          answers: [
            { correct: true, value: "1" },
            { correct: true, value: "2" },
            { correct: true, value: "4" },
            { correct: true, value: "8" }
          ]
        },
        {
          quizId: ObjectId("5fb589da1e1cfcd1fef45633"),
          name: "What does LOL not stand for?",
          multipleAnswers: true,
          answers: [
            { correct: true, value: "Load Of Laughs" },
            { correct: true, value: "Lots Of Love" },
            { correct: false, value: "Laugh Out Loud" }
          ]
        },
        {
          quizId: ObjectId("5fb589da1e1cfcd1fef45635"),
          name: "Whathas exactly 4 lines of symmetry?",
          multipleAnswers: true,
          answers: [
            { correct: true, value: "Circle" },
            { correct: false, value: "Triangle" },
            { correct: true, value: "Square" },
            { correct: false, value: "Rectangle" }
          ]
        }
      ])
    );

    Promise.all(operations)
      .then(() => client.close())
      .catch(console.error);
  })
  .catch(console.error);
