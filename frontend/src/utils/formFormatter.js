// Used to format forms between frontend and backend
// Both are an array of objects which are shown below
// Having two different formats makes it easier to read variable
// names in context and makes it easier for components to handle
/* { frontend formData structure
  id: NULL OR STRING
  useCheckboxes: BOOL,
  buttonGroupAnswers: ARRAY,
  selectedAnswers: ARRAY OR STRING
  answerInputField: STRING,
  questionValue: STRING
} */

/* { backend databaseObject structure
  id: STRING,
  quizId: STRING,
  name: STRING,
  multipleAnswers: BOOL,
  answers: [{ correct BOOL, value STRING }]
} */
function formDataToDatabaseObject(quizId, formData) {
  return formData.map(formDataSegment => {
    const formattedData = {
      quizId,
      multipleAnswers: formDataSegment.useCheckboxes,
      name: formDataSegment.questionValue
    };

    if (formDataSegment.id) formattedData.id = formDataSegment.id;

    formattedData.answers = formDataSegment.buttonGroupAnswers.map(value => {
      return {
        value,
        correct: formDataSegment.useCheckboxes
          ? formDataSegment.selectedAnswers.includes(value)
          : formDataSegment.selectedAnswers === value
      };
    });

    return formattedData;
  });
}

function databaseObjectToFormData(databaseObjects) {
  return databaseObjects.map(databaseObject => {
    const formattedData = {
      id: databaseObject.id,
      useCheckboxes: databaseObject.multipleAnswers,
      questionValue: databaseObject.name,
      answerInputField: ""
    };

    let selectedAnswers = [];
    formattedData.buttonGroupAnswers = databaseObject.answers.map(answerObj => {
      if (answerObj.correct) {
        if (databaseObject.multipleAnswers) {
          selectedAnswers.push(answerObj.value);
        } else {
          selectedAnswers = answerObj.value;
        }
      }
      return answerObj.value;
    });
    formattedData.selectedAnswers = selectedAnswers;

    return formattedData;
  });
}

// Check that formData contains the minimal required values
/* { Example minimal requirements
  id: null,
  useCheckboxes: true or false,
  buttonGroupAnswers: ["two", "values"],
  selectedAnswers: ["at least one"] or "one"
  answerInputField: "",
  questionValue: "Non-empty string"
} */
function validateFormData(formData) {
  const errors = {
    "missing questions": [],
    "missing answers": [],
    "missing correct answers": []
  };

  formData.forEach((formSegment, index) => {
    if (!formSegment.questionValue) errors["missing questions"].push(index + 1);

    if (formSegment.buttonGroupAnswers.length < 2)
      errors["missing answers"].push(index + 1);

    if (formSegment.selectedAnswers.length === 0)
      errors["missing correct answers"].push(index + 1);
  });

  let foundError = false;
  Object.entries(errors).forEach(([errorName, errorQuestionNums]) => {
    if (errorQuestionNums.length === 0) delete errors[errorName];
    else foundError = true;
  });

  return foundError ? errors : null;
}

export default {
  formDataToDatabaseObject,
  databaseObjectToFormData,
  validateFormData
};
