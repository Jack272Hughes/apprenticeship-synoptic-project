import React from "react";
import { Box, Heading, Stack, Text, Meter, Button } from "grommet";

import { axiosInstance } from "../../components";

export default function Results(props) {
  const [userResults, setUserResults] = React.useState({});
  const [meterLabel, setMeterLabel] = React.useState("");

  const { quiz, userAnswers, userOid, viewQuizOverview, viewQuestions } = props;
  const totalCorrectPercentage = Math.floor(
    (userResults.correct / userResults.total) * 100
  );

  React.useEffect(() => {
    if (quiz.id && userAnswers) {
      axiosInstance
        .post(`/quizzes/${quiz.id}/check`, { answers: userAnswers })
        .then(response => setUserResults(response.data))
        .catch(() => setUserResults({ correct: 0, total: 1 }));
    }
  }, [quiz, userAnswers]);

  React.useEffect(() => {
    setMeterLabel(totalCorrectPercentage + "%");
  }, [totalCorrectPercentage]);

  const handleHover = isHovered => {
    if (isHovered)
      setMeterLabel(`${userResults.correct} / ${userResults.total}`);
    else setMeterLabel(totalCorrectPercentage + "%");
  };

  const handleSave = () => {
    axiosInstance
      .post(`/users/${userOid}/scores`, {
        score: { ...userResults, quizId: quiz.id }
      })
      .finally(viewQuizOverview);
  };

  return (
    <Box justify="center" align="center" pad="medium" fill="vertical">
      <Heading>Results</Heading>
      <Heading size="small">
        {quiz.name} - {quiz.totalQuestions} Questions
      </Heading>
      <Stack interactiveChild="first" margin="medium">
        <Meter
          background="light-3"
          thickness="xlarge"
          type="circle"
          max={userResults.total}
          values={[
            { value: userResults.correct, label: "score", onHover: handleHover }
          ]}
        />
        <Box justify="center" align="center" pad="medium" fill="vertical">
          <Text size="xxlarge">{meterLabel}</Text>
        </Box>
      </Stack>
      <Box direction="row">
        <Button
          primary
          margin="medium"
          size="large"
          plain={false}
          onClick={handleSave}
        >
          Save Answers
        </Button>
        <Button
          primary
          margin="medium"
          size="large"
          plain={false}
          onClick={viewQuestions}
        >
          Retake Quiz
        </Button>
      </Box>
    </Box>
  );
}
