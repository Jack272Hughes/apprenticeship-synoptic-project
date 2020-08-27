const { url, dbName } = require("../config.json");

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
      db
        .collection("users")
        .insertOne({
          username: "Username",
          salt: "123abc",
          password:
            "96634cddae74babd0e48403d1ea1eb3c9961151d8bd39611e837bfc015431e26",
          role: "admin"
        })
    );

    Promise.all(operations)
      .then(() => client.close())
      .catch(console.error);
  })
  .catch(console.error);
