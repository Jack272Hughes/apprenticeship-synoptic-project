import React from "react";
import axios from "axios";
import { useHistory } from "react-router-dom";

import { Card, CardHeader, CardBody, Heading, Box } from "grommet";

export default function Quizzes(props) {
  const [quizzes, setQuizzes] = React.useState([]);
  const history = useHistory();

  React.useEffect(() => {
    axios
      .get("http://localhost:8080/quizzes")
      .then(response => {
        setQuizzes(response.data.quizzes);
      })
      .catch(console.error);
  }, []);

  return (
    <Box
      pad="medium"
      fill="vertical"
      align="center"
      justify="center"
      direction="row"
      gap="medium"
    >
      {quizzes.map((quiz, index) => {
        return (
          <Card
            key={`quiz${index}`}
            width="medium"
            onClick={() => history.push(`/quizzes/${quiz.id}`)}
          >
            <CardHeader pad="medium" background="dark-1">
              <Heading size="medium" level={2}>
                {quiz.name}
              </Heading>
            </CardHeader>
            <CardBody pad="medium" background="dark-2">
              {quiz.description}
            </CardBody>
          </Card>
        );
      })}
    </Box>
  );
}
