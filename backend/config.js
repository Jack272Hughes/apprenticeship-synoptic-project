const config = {
  jwtSecret: "TVhZ99NBWmZ43ZgsVqX4zQ",
  url: "mongodb://localhost:27017",
  dbName: "quizmaster"
};

if (process.env.production === "docker") config.url = "mongodb://mongodb:27017";

module.exports = config;
