import React from "react";
import { Box, Heading, Text, Button, Main, Card, CardBody } from "grommet";
import { Redirect } from "react-router-dom";

import { axiosInstance } from "../../utils";

export default function Quiz(props) {
  const [redirect, setRedirect] = React.useState("");

  const {
    quiz,
    viewAnswers,
    viewQuestions,
    roles,
    token,
    buttons = true
  } = props;

  function buttonList() {
    const currentRole = roles[token.role];
    const buttonList = {};

    if (currentRole >= roles.USER) {
      buttonList["Take Quiz"] = viewQuestions;
    }

    if (currentRole >= roles.MODERATOR) {
      buttonList["Show Answers"] = viewAnswers;
    }

    if (currentRole >= roles.ADMIN) {
      buttonList["Edit Quiz"] = () => setRedirect(`/quizzes/${quiz.id}/edit`);
      buttonList["Delete Quiz"] = () => {
        axiosInstance
          .delete(`/quizzes/${quiz.id}`)
          .then(() => setRedirect("/quizzes"))
          .catch(console.error);
      };
    }

    return Object.entries(buttonList).map(([buttonName, onClickFunction]) => {
      return (
        <Button
          a11yTitle={`${buttonName.toLowerCase().replace(" ", "-")}-button`}
          key={buttonName}
          plain={false}
          primary
          onClick={onClickFunction}
        >
          {buttonName}
        </Button>
      );
    });
  }
  return redirect ? (
    <Redirect to={redirect} />
  ) : (
    <Main justify="center" align="center" pad="xlarge">
      <Heading textAlign="center">{quiz.name}</Heading>
      <Text textAlign="center" size="xlarge">
        {quiz.description}
      </Text>
      <Box pad="large" gap="small" direction="row">
        <Card>
          <CardBody pad="small" background="dark-3">
            Total Questions: {quiz.totalQuestions}
          </CardBody>
        </Card>
        <Card>
          <CardBody pad="small" background="dark-3">
            Maximum Score: {quiz.maximumScore}
          </CardBody>
        </Card>
      </Box>
      <Box gap="small" direction="row">
        {buttons && buttonList()}
      </Box>
    </Main>
  );
}
