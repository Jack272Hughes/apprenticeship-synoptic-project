import React from "react";
import {
  FormField,
  Box,
  Button,
  TextInput,
  Text,
  RadioButtonGroup,
  CheckBoxGroup,
  CheckBox
} from "grommet";
import { Redirect } from "react-router-dom";

import { axiosInstance, Pagination } from "../components";
import {
  formDataToDatabaseObject,
  databaseObjectToFormData,
  validateFormData
} from "../utils/formFormatter";

export default function EditQuiz(props) {
  // Object to be used as a template for each question
  const formQuestionTemplate = Object.freeze({
    useCheckboxes: false,
    buttonGroupAnswers: [],
    selectedAnswers: "", // Will be an array if useCheckboxes is true
    answerInputField: "",
    questionValue: ""
  });

  const [formData, setFormData] = React.useState([{ ...formQuestionTemplate }]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = React.useState(0);

  const [quizName, setQuizName] = React.useState("");
  const [quizDescription, setQuizDescription] = React.useState("");

  const [redirectToQuizzes, setRedirectToQuizzes] = React.useState(false);
  const [errors, setErrors] = React.useState([]);

  // Get existing information about the quiz
  // Total existing questions can be 0 however quiz name and description should always be defined
  React.useEffect(() => {
    const getQuizInfo = [
      axiosInstance.get(`quizzes/${props.quizId}`),
      axiosInstance.get(`quizzes/${props.quizId}/questions/answers`)
    ];

    Promise.all(getQuizInfo)
      .then(([quizResponse, questionsResponse]) => {
        const { quiz } = quizResponse.data;
        const { questions } = questionsResponse.data;

        if (!quiz.name || !quiz.description) setRedirectToQuizzes(true);

        setQuizName(quiz.name);
        setQuizDescription(quiz.description);

        if (questions.length > 0)
          setFormData(databaseObjectToFormData(questions));
      })
      .catch(() => setRedirectToQuizzes(true));
  }, [props.quizId]);

  // Error handling and saving quiz changes to the database
  const handleSave = () => {
    const errors = validateFormData(formData);
    if (errors) return setErrors(Object.entries(errors));
    else if (!quizName || !quizDescription) return;
    else {
      const databaseFormat = formDataToDatabaseObject(props.quizId, formData);
      axiosInstance
        .patch(`/quizzes/${props.quizId}`, {
          questions: databaseFormat,
          quiz: { name: quizName, description: quizDescription }
        })
        .then(() => setRedirectToQuizzes(true));
    }
  };

  // Field values extraction
  const {
    useCheckboxes,
    buttonGroupAnswers,
    answerInputField,
    selectedAnswers,
    questionValue
  } = formData[currentQuestionIndex];

  // Choosing to use either checkboxes or radiobuttons for answers button group
  const ButtonGroup = useCheckboxes ? CheckBoxGroup : RadioButtonGroup;
  // Define function for changing fields in the formData object
  const setFormFields = newValuesObject => {
    const formDataCopy = formData.slice();
    Object.entries(newValuesObject).forEach(([fieldName, newValue]) => {
      formDataCopy[currentQuestionIndex][fieldName] = newValue;
    });
    setFormData(formDataCopy);
  };

  // Handler for when ButtonGroup value changes
  const handleSelection = event => {
    const { value } = useCheckboxes ? event : event.target;
    setFormFields({ selectedAnswers: value });
  };

  // Handler for adding an answer using the text field supplied
  const handleNewAnswer = () => {
    if (answerInputField && !buttonGroupAnswers.includes(answerInputField)) {
      setFormFields({
        buttonGroupAnswers: [...buttonGroupAnswers, answerInputField],
        answerInputField: ""
      });
    }
  };

  // Handler for removing an answer and also unselecting it if selected
  const handleRemoveAnswer = () => {
    const buttonGroupCopy = buttonGroupAnswers.slice();
    const removedAnswer = String(buttonGroupCopy.splice(-1, 1));

    let newSelectedAnswers = selectedAnswers;
    if (useCheckboxes)
      newSelectedAnswers = selectedAnswers.filter(
        answer => answer !== removedAnswer
      );
    else if (selectedAnswers === removedAnswer) {
      newSelectedAnswers = "";
    }

    setFormFields({
      buttonGroupAnswers: buttonGroupCopy,
      selectedAnswers: newSelectedAnswers
    });
  };

  return redirectToQuizzes ? (
    <Redirect to="/quizzes" />
  ) : (
    <Box justify="center" align="center" pad="medium" fill="vertical">
      {/* Text fields for changing quiz title and description */}
      <FormField width="medium" label={<Text size="xlarge">Quiz Name</Text>}>
        <TextInput
          onBlur={event => event.target.reportValidity()}
          onChange={event => setQuizName(event.target.value)}
          value={quizName}
          size="xlarge"
          placeholder="Name of the quiz"
          required
        />
      </FormField>
      <FormField
        width="large"
        label={<Text size="large">Quiz Description</Text>}
      >
        <TextInput
          onBlur={event => event.target.reportValidity()}
          onChange={event => setQuizDescription(event.target.value)}
          value={quizDescription}
          size="large"
          placeholder="Describe the quiz..."
          required
        />
      </FormField>

      {/* Pagination to switch between questions */}
      <Pagination
        currentIndex={currentQuestionIndex}
        setCurrentIndex={setCurrentQuestionIndex}
        maxLength={formData.length - 1}
      />

      {/* Error message area for giving information on missing information */}
      {errors.length > 0 && (
        <Box gap="xsmall" background="light-3" pad="medium" round>
          {errors.map(([errorMessage, erroredIndexes], index) => {
            return (
              <Text key={index}>
                The following questions have {errorMessage}:{" "}
                {erroredIndexes.join(", ")}
              </Text>
            );
          })}
        </Box>
      )}

      {/* Text field for changing the question */}
      <FormField
        margin="medium"
        width="large"
        label={<Text size="xlarge">Question</Text>}
      >
        <TextInput
          value={questionValue}
          onChange={event =>
            setFormFields({ questionValue: event.target.value })
          }
          size="large"
          required
          placeholder="What is the question?"
          name="question-name"
        />
      </FormField>

      {/* Switch for choosing if you can pick multiple answers */}
      <CheckBox
        checked={useCheckboxes}
        onChange={event => {
          const { checked } = event.target;
          setFormFields({
            selectedAnswers: checked ? [] : "",
            useCheckboxes: checked
          });
        }}
        name="question-type"
        toggle
        label="Select Multiple"
      />

      {/* Button group of either checkboxes or radio buttons (defined by the switch above)
      for creating answers and choosing which ones are the correct answers */}
      <ButtonGroup
        required
        margin="medium"
        name="question-answers"
        options={buttonGroupAnswers}
        value={selectedAnswers}
        onChange={handleSelection}
      />

      {/* Buttons for adding or removing answers with a text input */}
      <Box
        margin="small"
        direction="row"
        gap="small"
        align="center"
        width="large"
      >
        <Button onClick={handleNewAnswer} size="xlarge" plain={false}>
          ＋
        </Button>
        <TextInput
          onKeyDown={event => {
            if (event.key === "Enter") handleNewAnswer();
          }}
          placeholder="Answer to the question..."
          value={answerInputField}
          onChange={event =>
            setFormFields({ answerInputField: event.target.value })
          }
        />
        <Button onClick={handleRemoveAnswer} size="xlarge" plain={false}>
          －
        </Button>
      </Box>

      {/* Buttons for adding and removing questions and saving questions */}
      <Box direction="row" margin="large" gap="medium">
        <Button
          onClick={() => {
            if (formData.length < 10) {
              setFormData([...formData, { ...formQuestionTemplate }]);
              setCurrentQuestionIndex(formData.length);
            }
          }}
          primary
          plain={false}
        >
          Add Question
        </Button>
        <Button
          onClick={() => {
            if (formData.length > 1) {
              // Create a copy as to not mutate the existing formData
              // Else React will not properly set state
              const formDataCopy = formData.slice();
              formDataCopy.splice(currentQuestionIndex, 1);
              if (currentQuestionIndex >= formDataCopy.length) {
                setCurrentQuestionIndex(currentQuestionIndex - 1);
              }
              setFormData(formDataCopy);
            }
          }}
          primary
          plain={false}
        >
          Remove Question
        </Button>
        <Button primary plain={false} onClick={handleSave}>
          Save Quiz
        </Button>
      </Box>
    </Box>
  );
}
