import React from "react";
import { Box, Heading, Form, FormField, Button, TextInput } from "grommet";
import { Redirect } from "react-router-dom";

import { axiosInstance } from "./";

export default function CreateQuizModal(props) {
  const [redirectRoute, setRedirectRoute] = React.useState(false);
  const [formValue, setFormValue] = React.useState({
    name: "",
    description: ""
  });

  const { setModalContent, userOid } = props;

  const handleSubmit = () => {
    axiosInstance
      .post("/quizzes", { quiz: { ...formValue, userOid } })
      .then(response => {
        if (response.data)
          setRedirectRoute(`/quizzes/${response.data.insertedId}/edit`);
        setModalContent(null);
      });
  };

  if (redirectRoute) return <Redirect to={redirectRoute} />;

  return (
    <Box justify="center" align="center" pad="xlarge">
      <Heading size="medium">Create Quiz!</Heading>
      <Form value={formValue} onChange={setFormValue} onSubmit={handleSubmit}>
        <FormField htmlFor="quiz-name" label="Name">
          <TextInput required id="quiz-name" name="name" />
        </FormField>
        <FormField htmlFor="quiz-description" label="Description">
          <TextInput required id="quiz-description" name="description" />
        </FormField>
        <Box direction="row">
          <Button primary plain={false} margin="small" type="submit">
            Create
          </Button>
          <Button
            onClick={() => setModalContent(null)}
            primary
            plain={false}
            margin="small"
          >
            Cancel
          </Button>
        </Box>
      </Form>
    </Box>
  );
}
