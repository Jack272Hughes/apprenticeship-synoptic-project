import React from "react";
import { axiosInstance } from "../components";
import { Box, Heading } from "grommet";

export default function Question(props) {
  const [questions, setQuestions] = React.useState([]);

  React.useEffect(() => {
    axiosInstance
      .get(`/quizzes/${props.quizId}/questions`)
      .then(response => {
        console.log(response.data.questions);
        setQuestions(response.data.questions);
      })
      .catch(console.error);
  }, []);

  return (
    <Box pad="medium" fill="vertical">
      {questions.map((question, index) => {
        return (
          <Heading key={index} size="medium" level={2}>
            {question.name}
          </Heading>
        );
      })}
    </Box>
  );
}
