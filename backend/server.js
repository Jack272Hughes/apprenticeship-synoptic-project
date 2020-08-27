const app = require("express")();
const upload = require("multer")();
const cors = require("cors");
const assert = require("assert");

const { url, dbName } = require("./config.json");

const client = new require("mongodb").MongoClient(url, {
  useUnifiedTopology: true
});
client
  .connect()
  .then(client => {
    console.log("Connection Successful!");

    const db = client.db(dbName);
    db.collection("users")
      .findOne({ username: "Username" })
      .then(result => console.log(result._id.toString()))
      .catch(console.error);
  })
  .catch(console.error);

app.use(upload.array());
app.use(
  cors({
    origin: ["http://localhost:3000"],
    credentials: true
  })
);

app.get("/quizes", (req, res) => {
  res.end();
});

// app.listen(8080);

// db.collection("users").insertOne({
//   username: "Username",
//   salt: "123abc",
//   password:
//     "96634cddae74babd0e48403d1ea1eb3c9961151d8bd39611e837bfc015431e26"
// });
