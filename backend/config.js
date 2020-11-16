const config = {
  jwtSecret: "TVhZ99NBWmZ43ZgsVqX4zQ", // Wouldn't normally just leave it here for all to see
  url: "mongodb://localhost:27017",
  dbName: "quizmaster"
};

if (process.env.production === "docker") config.url = "mongodb://mongodb:27017";
if (process.env.NODE_ENV === "test") config.jwtSecret = "testingSecret";

module.exports = config;
