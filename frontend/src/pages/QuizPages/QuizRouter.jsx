import React from "react";
import { Button } from "grommet";

import { axiosInstance } from "../../components";
import { Answers, Questions, Quiz, Results } from "./";

export default function QuizRouter(props) {
  const [quiz, setQuiz] = React.useState({});
  const [quizStage, setQuizStage] = React.useState("quizInfo");
  const [userAnswers, setUserAnswers] = React.useState({});

  const { roles, token, quizId } = props;

  React.useEffect(() => {
    axiosInstance
      .get(`/quizzes/${quizId}`)
      .then(response => {
        setQuiz(response.data.quiz);
      })
      .catch(console.error);
  }, [quizId]);

  const viewQuizOverview = () => {
    setQuizStage("quizInfo");
    setUserAnswers({});
  };

  const renderStage = () => {
    switch (quizStage) {
      case "questions":
        return (
          <Questions
            userAnswers={{ ...userAnswers }}
            setUserAnswers={setUserAnswers}
            quizId={quizId}
            viewResults={() => setQuizStage("results")}
          />
        );
      case "results":
        return (
          <Results
            quiz={quiz}
            userAnswers={userAnswers}
            userOid={token.oid}
            viewQuizOverview={viewQuizOverview}
            viewQuestions={() => {
              setQuizStage("questions");
              setUserAnswers({});
            }}
          />
        );
      case "answers":
        return <Answers quizId={quizId} />;
      default:
        return (
          <Quiz
            quiz={quiz}
            viewQuestions={() => setQuizStage("questions")}
            viewAnswers={() => setQuizStage("answers")}
            roles={roles}
            token={token}
          />
        );
    }
  };

  return (
    <>
      {quizStage !== "quizInfo" && (
        <Button
          margin="medium"
          primary
          plain={false}
          onClick={viewQuizOverview}
        >
          Return To Quiz Overview
        </Button>
      )}
      {renderStage()}
    </>
  );
}
