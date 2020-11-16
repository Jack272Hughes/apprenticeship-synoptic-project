import React from "react";
import { Box, Heading, Text, Button, Main, Card, CardBody } from "grommet";

export default function Quiz(props) {
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
      buttonList["Edit Quiz"] = () => {};
      buttonList["Delete Quiz"] = () => {};
    }

    return Object.entries(buttonList).map(([buttonName, onClickFunction]) => {
      return (
        <Button
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
  return (
    <Main justify="center" align="center" pad="xlarge">
      <Heading>{quiz.name}</Heading>
      <Text size="xlarge">{quiz.description}</Text>
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
