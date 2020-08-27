const dataAccessor = {};
const { url, dbName } = require("../config.json");

let client;
const mongoClient = new require("mongodb")
  .MongoClient(url, {
    useUnifiedTopology: true
  })
  .connect()
  .then(connection => (client = connection))
  .catch(console.error);

function getConnection(collection) {
  const db = client.db(dbName);
  return collection ? db.collection(collection) : db;
}

function collectionQueryAsPromise(
  collectionName,
  functionName,
  query,
  callback
) {
  return new Promise(async (resolve, reject) => {
    getConnection(collectionName)[functionName](query, (err, result) => {
      if (err) return reject(err);
      if (callback) result = callback(result);
      resolve(result);
    });
  }).catch(err => {
    console.error(err);
    console.log("Error got here");
  });
}

function deleteFromCollection(collection, query) {
  return collectionQueryAsPromise(collection, "deleteMany", query);
}

function insertToCollection(collection, insertions) {
  return collectionQueryAsPromise(
    collection,
    Array.isArray(insertions) ? "insertMany" : "insertOne",
    insertions
  );
}

function extractId(rowObject) {
  const { _id, ...rest } = rowObject;
  rest.id = _id.toString();
  return rest;
}

function findFromCollection(collection, query, options) {
  return collectionQueryAsPromise(
    collection,
    options.findOne ? "findOne" : "find",
    query,
    result => {
      if (!result) return null;
      else return options.findOne ? extractId(result) : result.map(extractId);
    }
  );
}

dataAccessor.refreshTokens = {
  add: (token, username) => {
    return insertToCollection("refreshTokens", {
      token,
      username,
      createdAt: new Date()
    });
  },
  remove: (token, username) => {
    return deleteFromCollection("refreshTokens", { token, username });
  },
  replace: (token, username, newToken) => {
    return new Promise(async (resolve, reject) => {
      getConnection("refreshTokens").replaceOne(
        { token, username },
        { token: newToken, username, createdAt: new Date() },
        (err, result) => {
          if (err) reject(err);
          else resolve(result);
        }
      );
    }).catch(console.error);
  },
  validate: (token, username) => {
    return findFromCollection(
      "refreshTokens",
      { token, username },
      { findOne: true }
    );
  }
};

dataAccessor.users = {
  add: (username, password, salt) => {
    return insertToCollection("users", {
      username,
      password,
      salt,
      role: "user"
    });
  },
  find: username => {
    return findFromCollection("users", { username }, { findOne: true });
  }
};

module.exports = dataAccessor;
