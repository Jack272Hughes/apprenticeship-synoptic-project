import React from "react";
import { Box, Heading, Form, FormField, Button, TextInput } from "grommet";
import { Redirect } from "react-router-dom";

import { axiosInstance } from "../utils";

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
        <FormField htmlFor="quiz-name" label="Title">
          <TextInput
            required
            placeholder="Name of the quiz"
            id="quiz-name"
            name="name"
          />
        </FormField>
        <FormField htmlFor="quiz-description" label="Description">
          <TextInput
            required
            placeholder="Describe the quiz..."
            id="quiz-description"
            name="description"
          />
        </FormField>
        <Box direction="row">
          <Button
            a11yTitle="create-quiz-button"
            primary
            plain={false}
            margin="small"
            type="submit"
          >
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
