import React from "react";
import { axiosInstance } from "../../components";
import {
  Box,
  Heading,
  CheckBoxGroup,
  RadioButtonGroup,
  Text,
  Button,
  Grommet
} from "grommet";

export default function Question(props) {
  const [questions, setQuestions] = React.useState(null);
  const [currentQuestion, setCurrentQuestion] = React.useState(0);
  const { userAnswers, setUserAnswers, viewResults, quizId } = props;

  React.useEffect(() => {
    axiosInstance
      .get(`/quizzes/${quizId}/questions`)
      .then(response => {
        setQuestions(response.data.questions);
      })
      .catch(console.error);
  }, [quizId]);

  const theme = {
    button: {
      default: {},
      primary: {
        color: "white",
        background: {
          color: "dark-2"
        }
      }
    }
  };

  const handlePagination = type => {
    if (type === "increase" && currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else if (type === "decrease" && currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  if (questions === null) return <></>;
  else if (questions.length > 0) {
    const question = questions[currentQuestion];
    const ComponentToUse =
      question.type === "radio" ? RadioButtonGroup : CheckBoxGroup;

    const handleSelection = event => {
      const { value } = question.type === "radio" ? event.target : event;
      userAnswers[question.id] = value;
      setUserAnswers(userAnswers);
    };

    return (
      <Box justify="center" align="center" pad="medium" fill="vertical">
        <Grommet theme={theme}>
          <Box gap="medium" direction="row" pad="large">
            <Button onClick={() => handlePagination("decrease")}>&lt;</Button>
            {questions.map((question, index) => (
              <Button
                key={index}
                primary={index === currentQuestion}
                onClick={() => setCurrentQuestion(index)}
              >
                {index + 1}
              </Button>
            ))}
            <Button onClick={() => handlePagination("increase")}>&gt;</Button>
          </Box>
        </Grommet>
        <Heading size="medium" level={2}>
          {question.name}
          <Box pad="medium" fill="vertical">
            <Text size="xlarge">
              <ComponentToUse
                options={question.answers.map(answer => answer.value)}
                name={question.id}
                onChange={handleSelection}
                value={userAnswers[question.id]}
              />
            </Text>
          </Box>
        </Heading>
        {currentQuestion === questions.length - 1 && (
          <Button primary plain={false} onClick={viewResults}>
            Check Answers
          </Button>
        )}
      </Box>
    );
  } else {
    return (
      <Box justify="center" align="center" pad="medium" fill="vertical">
        <Heading>Error 404</Heading>
        <Text>No questions were found for this quiz</Text>
      </Box>
    );
  }
}
