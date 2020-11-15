import React from "react";
import { Button } from "grommet";

import { axiosInstance } from "../../components";
import { Questions, Quiz, Results } from "./";

export default function QuizHandler(props) {
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
        return <Results quiz={quiz} />;
      default:
        return (
          <Quiz
            quiz={quiz}
            viewQuestions={() => setQuizStage("questions")}
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
          onClick={() => {
            setQuizStage("quizInfo");
            setUserAnswers({});
          }}
        >
          Return To Quiz Overview
        </Button>
      )}
      {renderStage()}
    </>
  );
}
