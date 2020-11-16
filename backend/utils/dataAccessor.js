const dataAccessor = {};
const { MongoClient, ObjectId, Cursor, ObjectID } = require("mongodb");

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

function extractId(rowObject) {
  const { _id, ...rest } = rowObject;
  rest.id = _id.toString();
  return rest;
}

function collectionQueryAsPromise(
  collectionName,
  functionName,
  query = {},
  options = {}
) {
  return new Promise((resolve, reject) => {
    let response;
    if (options.multiParams) {
      response = getConnection(collectionName)[functionName](...query);
    } else {
      response = getConnection(collectionName)[functionName](query);
    }

    if (response instanceof Cursor) response = response.toArray();

    response
      .then(results => {
        if (options.extractId && results !== null) {
          if (Array.isArray(results)) {
            resolve(results.map(extractId));
          } else {
            resolve(extractId(results));
          }
        } else {
          resolve(results);
        }
      })
      .catch(reject);
  }).catch(console.error);
}

function deleteFromCollection(collection, selection) {
  return collectionQueryAsPromise(collection, "deleteMany", selection);
}

function insertIntoCollection(collection, insertions) {
  return collectionQueryAsPromise(
    collection,
    Array.isArray(insertions) ? "insertMany" : "insertOne",
    insertions
  );
}

function findOneFromCollection(collection, selection) {
  return collectionQueryAsPromise(collection, "findOne", selection, {
    extractId: true
  });
}

function findManyFromCollection(collection, selection) {
  return collectionQueryAsPromise(collection, "find", selection, {
    extractId: true
  });
}

function aggregateManyFromCollection(collection, selection) {
  return collectionQueryAsPromise(collection, "aggregate", selection, {
    extractId: true
  });
}

function replaceOneFromCollection(collection, selection, replacement) {
  return collectionQueryAsPromise(
    collection,
    "replaceOne",
    [selection, replacement],
    {
      multiParams: true
    }
  );
}

function updateOneFromCollection(collection, selection, updateQuery) {
  return collectionQueryAsPromise(
    collection,
    "updateOne",
    [selection, { $set: { updateQuery } }],
    { multiParams: true }
  );
}

dataAccessor.refreshTokens = {
  add: (token, username) => {
    return insertIntoCollection("refreshTokens", {
      token,
      username,
      createdAt: new Date()
    });
  },
  delete: (token, username) => {
    return deleteFromCollection("refreshTokens", { token, username });
  },
  replace: (token, username, newToken) => {
    return replaceOneFromCollection(
      "refeshTokens",
      { token, username },
      { token: newToken, username, createdAt: new Date() }
    );
  },
  validate: (token, username) => {
    return findOneFromCollection("refreshTokens", { token, username });
  }
};

dataAccessor.users = {
  add: (username, password, salt) => {
    return insertIntoCollection("users", {
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
  add: ({ userOid, name, description }) => {
    return insertIntoCollection("quizzes", {
      userOid: ObjectId(userOid),
      name,
      description
    });
  },
  get: quizId => {
    return aggregateManyFromCollection(
      "quizzes",
      mongodbQueries.getQuiz(quizId)
    );
  },
  update: (quizId, quiz) => {
    updateOneFromCollection("quizzes", { _id: ObjectId(quizId) }, quiz);
  },
  delete: quizId => {
    deleteFromCollection("quizzes", { _id: ObjectId(quizId) });
  }
};

dataAccessor.questions = {
  all: quizId => {
    return aggregateManyFromCollection(
      "questions",
      mongodbQueries.allQuestions(quizId)
    );
  },
  add: ({ quizId, name, answers }) => {
    return insertIntoCollection("questions", {
      name,
      quizId: ObjectId(quizId),
      answers
    });
  },
  answers: {
    all: quizId => {
      return findManyFromCollection("questions", { quizId: ObjectId(quizId) });
    },
    correct: quizId => {
      return aggregateManyFromCollection(
        "questions",
        mongodbQueries.correctAnswersForQuestion(quizId)
      );
    }
  }
};

dataAccessor.scores = {
  add: (userOid, { total, correct }) => {
    return insertIntoCollection("scores", {
      userOid: ObjectId(userOid),
      total,
      correct
    });
  }
};

module.exports = dataAccessor;
