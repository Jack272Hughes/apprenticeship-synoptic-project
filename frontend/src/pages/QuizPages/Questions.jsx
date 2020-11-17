import React from "react";
import { axiosInstance, Pagination } from "../../components";
import {
  Box,
  Heading,
  CheckBoxGroup,
  RadioButtonGroup,
  Text,
  Button
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

  if (questions === null) return <></>;
  else if (questions.length > 0) {
    const question = questions[currentQuestion];
    const ComponentToUse = question.multipleAnswers
      ? CheckBoxGroup
      : RadioButtonGroup;

    const handleSelection = event => {
      const { value } = question.multipleAnswers ? event : event.target;
      userAnswers[question.id] = value;
      setUserAnswers(userAnswers);
    };

    return (
      <Box justify="center" align="center" pad="medium" fill="vertical">
        <Pagination
          currentIndex={currentQuestion}
          setCurrentIndex={setCurrentQuestion}
          maxLength={questions.length - 1}
        />
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
