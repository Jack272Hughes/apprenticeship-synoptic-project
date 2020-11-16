const dataAccessor = {};
const { MongoClient, ObjectId, Cursor } = require("mongodb");

const { url, dbName } = require("../config.js");
const mongodbQueries = require("./mongodbQueries");

let client;
new MongoClient(url, { useUnifiedTopology: true })
  .connect()
  .then(connection => {
    if (process.env.NODE_ENV !== "test") console.log("Connected to MongoDB");
    client = connection;
  })
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

function findOneFromCollection(collection, query) {
  return collectionQueryAsPromise(collection, "findOne", query, result => {
    console.log(result);
    if (!result) return null;
    else return extractId(result);
  });
}

function findManyFromCollection(collection, query) {
  return new Promise(async (resolve, reject) => {
    getConnection(collection)
      .find(query)
      .toArray((err, results) => {
        if (err) return reject(err);
        resolve(results.map(extractId));
      });
  }).catch(err => {
    console.error(err);
  });
}

function aggregateManyFromCollection(collection, query) {
  return new Promise(async (resolve, reject) => {
    getConnection(collection).aggregate(query, (err, cursor) => {
      if (err) reject(err);
      console.log(cursor instanceof Cursor);
      cursor.toArray((err, results) => {
        if (err) reject(err);
        resolve(results.map(extractId));
      });
    });
  }).catch(console.error);
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
    return findOneFromCollection("refreshTokens", { token, username });
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
    return findOneFromCollection("users", { username }, { findOne: true });
  }
};

dataAccessor.quizzes = {
  all: () => {
    findOneFromCollection("quizzes", { title: "diuehfie" });
    return findManyFromCollection("quizzes", {});
  },
  add: (userOid, name, description) => {
    return insertToCollection("quizzes", { userOid, name, description });
  },
  get: quizId => {
    return aggregateManyFromCollection(
      "quizzes",
      mongodbQueries.getQuiz(quizId)
    );
  },
  update: (quizId, quiz) => {
    // db.quizzes.update({ _id: "" }, { $set: { role: "USER" }})
  },
  delete: quizId => {
    // db.quizzes.deleteOne({ _id: "" })
  }
};

dataAccessor.questions = {
  all: quizId => {
    return aggregateManyFromCollection(
      "questions",
      mongodbQueries.allQuestions(quizId)
    );
  },
  add: (quizId, name, answers) => {
    return insertToCollection("questions", { name, quizId, answers });
  },
  answers: {
    correct: quizId => {
      return aggregateManyFromCollection(
        "questions",
        mongodbQueries.correctAnswersForQuestion(quizId)
      );
    }
  }
};

module.exports = dataAccessor;
