import React from "react";
import { Box, Heading, Text } from "grommet";

import { axiosInstance } from "../../utils";

export default function Answers(props) {
  const [questions, setQuestions] = React.useState([]);
  const { quizId } = props;

  React.useEffect(() => {
    axiosInstance.get(`/quizzes/${quizId}/questions/answers`).then(response => {
      setQuestions(response.data.questions);
    });
  }, [quizId]);

  return (
    <Box justify="center" align="center" pad="xlarge">
      {questions.map(question => {
        return (
          <Box
            justify="center"
            direction="row"
            align="center"
            fill="horizontal"
            margin="medium"
            pad="medium"
            border={true}
            round
          >
            <Box width="40%" align="center">
              <Heading size="small">{question.name}</Heading>
            </Box>
            <Box width="40%" align="center">
              {question.answers.map(answer => {
                return (
                  <Text size="xlarge">
                    {answer.correct ? "✔️" : "❌"} {answer.value}
                  </Text>
                );
              })}
            </Box>
          </Box>
        );
      })}
    </Box>
  );
}
