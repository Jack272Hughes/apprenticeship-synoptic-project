const dataAccessor = {};
const { url, dbName } = require("../config.js");
const { MongoClient, ObjectId } = require("mongodb");

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
    return findManyFromCollection("quizzes", {});
  },
  add: (userOid, name, description) => {
    return insertToCollection("quizzes", { userOid, name, description });
  }
};

dataAccessor.questions = {
  all: quizId => {
    return aggregateManyFromCollection("questions", [
      { $match: { quizId: ObjectId(quizId) } },
      {
        $lookup: {
          from: "answers",
          let: { question_id: "$_id" },
          pipeline: [
            { $match: { $expr: { $eq: ["$questionId", "$$question_id"] } } },
            { $project: { correct: 0 } }
          ],
          as: "answers"
        }
      }
    ]);
  },
  add: (quizId, name) => {
    return insertToCollection("questions", { name, quizId });
  }
};

dataAccessor.answers = {
  allCorrect: () => {
    return new Promise(resolve => resolve());
  },
  add: (questionId, correct) => {
    return insertToCollection("answers", { questionId, correct });
  }
};

module.exports = dataAccessor;
