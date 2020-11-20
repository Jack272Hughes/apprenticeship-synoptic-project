import React from "react";
import { render, cleanup, waitFor, fireEvent } from "@testing-library/react";

import Editing from "../../pages/Editing";
import mockedData from "../mockedData.json";
import { axiosInstance } from "../../utils";

let redirectTo = "";
jest.mock("react-router-dom", () => {
  return {
    ...jest.requireActual("react-router-dom"),
    Redirect: function (props) {
      redirectTo = props.to;
      return <div>Redirected</div>;
    }
  };
});

afterAll(cleanup);

beforeAll(() => {
  mockAxios(
    "get",
    "/quizzes/123abc",
    { quiz: mockedData.mockQuizzes[0] },
    { persist: true }
  );
  mockAxios(
    "get",
    "/quizzes/123abc/questions/answers",
    { questions: mockedData.mockAnswers },
    { persist: true }
  );
});

let editing;
async function renderEditing() {
  editing = render(<Editing quizId="123abc" />);

  await waitFor(() => {
    expect(editing.getByText("Quiz Name")).toBeInTheDocument();
  });
}

describe("When testing the editting page", () => {
  it("Should render the edit page with the name and description automatically filled in", async () => {
    await renderEditing();
    const [quizNameInput, quizDescInput] = editing.getAllByRole("textbox");
    expect(quizNameInput).toHaveValue("QuizName1");
    expect(quizDescInput).toHaveValue("QuizDescription1");
  });

  it("Should render the question name automatically filled in", async () => {
    await renderEditing();
    const questionNameInput = editing.getByLabelText("Question");
    expect(questionNameInput).toHaveValue("Question1");
  });

  it("Should render all checkboxes and radio buttons automatically checked or not", async () => {
    await renderEditing();
    const radioValues = [true, false];
    editing.getAllByRole("radio").forEach((radioButton, index) => {
      if (radioValues[index]) {
        expect(radioButton).toBeChecked();
      } else {
        expect(radioButton).not.toBeChecked();
      }
    });

    expect(editing.getByRole("checkbox")).not.toBeChecked();
  });

  it("Should paginate each question correctly", async () => {
    await renderEditing();
    fireEvent.click(editing.getByLabelText("pagination-button-2"));
    await waitFor(() => {
      expect(editing.getByLabelText("Question")).toHaveValue("Question2");
    });

    const checkboxValues = [true, true, true, false, false];
    editing.getAllByRole("checkbox").forEach((checkbox, index) => {
      if (checkboxValues[index]) {
        expect(checkbox).toBeChecked();
      } else {
        expect(checkbox).not.toBeChecked();
      }
    });
    editing.getAllByRole("checkbox");
  });

  it("Should allow the user to change text inputs", async () => {
    await renderEditing();
    const textboxes = editing.getAllByRole("textbox");

    textboxes.forEach(textbox =>
      fireEvent.change(textbox, { target: { value: "NewValue" } })
    );

    await waitFor(() => {
      textboxes.forEach(textbox => expect(textbox).toHaveValue("NewValue"));
    });
  });

  it("Should allow the user to change checkbox or radio button inputs", async () => {
    await renderEditing();
    const radioButtons = editing.getAllByRole("radio");

    radioButtons.forEach(radioButton => fireEvent.click(radioButton));

    await waitFor(() => {
      expect(radioButtons[0]).not.toBeChecked();
      expect(radioButtons[1]).toBeChecked();
    });
  });

  it("Should change the answers input type when clicking Select Multiple switch", async () => {
    await renderEditing();
    const selectMultipleSwitch = editing.getByRole("checkbox");
    fireEvent.click(selectMultipleSwitch);
    await waitFor(() => {
      expect(selectMultipleSwitch).toBeChecked();
    });

    expect(editing.getAllByRole("checkbox")).toHaveLength(3);
  });

  it("Should allow you to add new answers", async () => {
    await renderEditing();
    const answerInput = editing.getByPlaceholderText(
      "Answer to the question..."
    );
    fireEvent.change(answerInput, { target: { value: "NewAnswer" } });

    await waitFor(() => {
      expect(answerInput).toHaveValue("NewAnswer");
    });

    fireEvent.click(editing.getByText("＋"));
    await waitFor(() => {
      expect(editing.getAllByRole("radio")).toHaveLength(3);
    });
  });

  it("Should allow you to remove answers", async () => {
    await renderEditing();
    fireEvent.click(editing.getByText("－"));
    await waitFor(() => {
      expect(editing.getAllByRole("radio")).toHaveLength(1);
    });
  });

  it("Should attempt to save the correct changes to the correct route", async () => {
    mockAxios("patch", "/quizzes/123abc", {});
    await renderEditing();
    const textinputs = editing.getAllByRole("textbox");
    textinputs.forEach(textbox => {
      fireEvent.change(textbox, { target: { value: "NewValue" } });
    });
    fireEvent.click(editing.getByText("＋"));
    await waitFor(() => {
      expect(editing.getByText("NewValue")).toBeInTheDocument();
      fireEvent.click(editing.getAllByRole("radio")[2]);
    });

    fireEvent.click(editing.getByText("Save Quiz"));
    await waitFor(() => {
      expect(editing.getByText("Redirected")).toBeInTheDocument();
    });
    expect(axiosInstance.patch).toBeCalledWith(
      "/quizzes/123abc",
      mockedData.savedQuiz
    );
  });

  it("Should allow you to add new questions", async () => {
    await renderEditing();
    fireEvent.click(editing.getByText("Add Question"));
    await waitFor(() => {
      expect(editing.getByPlaceholderText("What is the question?")).toHaveValue(
        ""
      );
    });
  });

  it("Should allow you to remove questions", async () => {
    await renderEditing();
    fireEvent.click(editing.getByText("Remove Question"));
    await waitFor(() => {
      expect(editing.getByPlaceholderText("What is the question?")).toHaveValue(
        "Question2"
      );
    });
  });
});
