import React from "react";
import { axiosInstance } from "../components";
import { Box, Heading, CheckBoxGroup, RadioButtonGroup } from "grommet";

export default function Question(props) {
  const [questions, setQuestions] = React.useState([]);

  React.useEffect(() => {
    axiosInstance
      .get(`/quizzes/${props.quizId}/questions`)
      .then(response => {
        setQuestions(response.data.questions);
      })
      .catch(console.error);
  }, []);

  return (
    <Box pad="medium" fill="vertical">
      {questions.map((question, questionIndex) => {
        const ComponentToUse =
          question.type === "radio" ? RadioButtonGroup : CheckBoxGroup;
        return (
          <Heading key={questionIndex} size="medium" level={2}>
            {question.name}
            <Box pad="small" fill="vertical">
              <ComponentToUse
                options={question.answers.map(answer => answer.value)}
                name={question.id}
              />
            </Box>
          </Heading>
        );
      })}
    </Box>
  );
}
