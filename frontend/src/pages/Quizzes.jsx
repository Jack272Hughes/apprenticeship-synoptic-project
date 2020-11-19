import React from "react";
import { axiosInstance } from "../utils";
import { useHistory } from "react-router-dom";

import { Card, CardHeader, CardBody, Heading, Box } from "grommet";

export default function Quizzes(props) {
  const [quizzes, setQuizzes] = React.useState([]);
  const history = useHistory();

  React.useEffect(() => {
    axiosInstance
      .get("/quizzes")
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
      wrap
    >
      {quizzes.map((quiz, index) => {
        return (
          <Card
            key={`quiz${index}`}
            width="medium"
            onClick={() => history.push(`/quizzes/${quiz.id}`)}
            margin="small"
          >
            <CardHeader wrap justify="center" pad="medium" background="dark-1">
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
