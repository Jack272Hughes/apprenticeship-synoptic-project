const { ObjectId } = require("mongodb");

module.exports = {
  // Get quiz for a given quiz id
  // Count total questions as totalQuestions
  // Count total answers with { correct: true } as maximumScore
  getQuiz: quizId => [
    { $match: { _id: ObjectId(quizId) } },
    {
      $lookup: {
        from: "questions",
        localField: "_id",
        foreignField: "quizId",
        as: "questions"
      }
    },
    {
      $project: {
        name: 1,
        description: 1,
        totalQuestions: { $size: "$questions" },
        maximumScore: {
          $sum: {
            $map: {
              input: "$questions",
              as: "question",
              in: {
                $size: {
                  $filter: {
                    input: "$$question.answers",
                    as: "answer",
                    cond: { $eq: ["$$answer.correct", true] }
                  }
                }
              }
            }
          }
        }
      }
    }
  ],

  // Get all questions for a given quiz id and their answers
  // Don't include quizId field and don't include correct field on answers
  allQuestions: quizId => [
    { $match: { quizId: ObjectId(quizId) } },
    { $project: { "answers.correct": 0, quizId: 0 } }
  ],

  // Get all answers with { correct: true } for given quiz id
  correctAnswersForQuestion: quizId => [
    { $match: { quizId: ObjectId(quizId) } },
    {
      $project: {
        answers: {
          $map: {
            input: {
              $filter: {
                input: "$answers",
                as: "answer",
                cond: { $eq: ["$$answer.correct", true] }
              }
            },
            as: "answer",
            in: "$$answer.value"
          }
        }
      }
    }
  ]
};
