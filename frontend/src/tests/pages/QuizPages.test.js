import React from "react";
import { render, cleanup, waitFor, fireEvent } from "@testing-library/react";

import { QuizRouter } from "../../pages/QuizPages";
import { axiosInstance } from "../../utils";
import mockedData from "../mockedData.json";

afterEach(cleanup);

beforeAll(() => {
  mockAxios(
    "get",
    "/quizzes/123abc",
    { quiz: mockedData.mockQuizzes[0] },
    { persist: true }
  );

  mockAxios(
    "get",
    "/quizzes/123abc/questions",
    { questions: mockedData.mockQuestions },
    { persist: true }
  );

  mockAxios(
    "get",
    "/quizzes/123abc/questions/answers",
    { questions: mockedData.mockAnswers },
    { persist: true }
  );

  mockAxios(
    "post",
    "/quizzes/123abc/check",
    { total: 4, correct: 2 },
    { persist: true }
  );
});

let quizRouter;
async function renderQuizRouter(role = "USER") {
  quizRouter = render(
    <QuizRouter
      quizId="123abc"
      roles={mockedData.roles}
      token={{ role, oid: "userOid" }}
    />
  );

  await waitFor(() => {
    expect(quizRouter.getByText("QuizName1")).toBeInTheDocument();
  });
}

describe("When testing the quiz overview page it", () => {
  const buttons = ["Take Quiz", "Show Answers", "Edit Quiz", "Delete Quiz"];

  it("Should render the quiz overview with all the correct information", async () => {
    await renderQuizRouter();
    expect(quizRouter.getByText("QuizName1")).toBeInTheDocument();
    expect(quizRouter.getByText("QuizDescription1")).toBeInTheDocument();
    expect(quizRouter.getByText("Total Questions: 4")).toBeInTheDocument();
    expect(quizRouter.getByText("Maximum Score: 4")).toBeInTheDocument();
  });

  it("Should render one button for users", async () => {
    await renderQuizRouter();
    expect(quizRouter.getByRole("button")).toContainHTML("Take Quiz");
  });

  it("Should render two buttons for moderators", async () => {
    await renderQuizRouter("MODERATOR");
    quizRouter.getAllByRole("button").forEach((button, index) => {
      expect(button).toContainHTML(buttons[index]);
    });
  });

  it("Should render four buttons for admins", async () => {
    await renderQuizRouter("ADMIN");
    quizRouter.getAllByRole("button").forEach((button, index) => {
      expect(button).toContainHTML(buttons[index]);
    });
  });
});

describe("When testing the answers page", () => {
  beforeEach(async () => {
    await renderQuizRouter("MODERATOR");
    fireEvent.click(quizRouter.getByText("Show Answers"));

    await waitFor(() => {
      expect(
        quizRouter.getByText("Return To Quiz Overview")
      ).toBeInTheDocument();
    });
  });

  it("Should render every question on the page", () => {
    expect(quizRouter.getByText("Question1")).toBeInTheDocument();
    expect(quizRouter.getByText("Question2")).toBeInTheDocument();
  });

  it("Should render every correct answer with a tick next to it", () => {
    expect(quizRouter.queryAllByText(/✔️ CorrectAnswer/)).toHaveLength(3);
  });

  it("Should render every correct answer with a cross next to it", () => {
    expect(quizRouter.queryAllByText(/❌ IncorrectAnswer/)).toHaveLength(3);
  });
});

describe("When testing the questions page", () => {
  beforeEach(async () => {
    await renderQuizRouter();
    fireEvent.click(quizRouter.getByText("Take Quiz"));

    await waitFor(() => {
      expect(
        quizRouter.getByText("Return To Quiz Overview")
      ).toBeInTheDocument();
    });
  });

  it("Should render the first question", () => {
    expect(quizRouter.getByText("Question1")).toBeInTheDocument();
  });

  it("Should allow the user to choose one answer for radio buttons", async () => {
    fireEvent.click(quizRouter.getAllByRole("radio")[0]);
    await waitFor(() => {
      expect(quizRouter.getAllByRole("radio")[0]).toBeChecked();
    });
  });

  it("Should allow the user to go to the second question", async () => {
    fireEvent.click(quizRouter.getByLabelText("pagination-button-2"));
    await waitFor(() => {
      expect(quizRouter.getByText("Question2")).toBeInTheDocument();
    });
  });

  it("Should allow the user to choose multiple answers for checkboxes", async () => {
    fireEvent.click(quizRouter.getByLabelText("pagination-button-2"));
    await waitFor(() => {
      expect(quizRouter.getByText("Question2")).toBeInTheDocument();
    });

    const [firstCheckBox, secondCheckbox] = quizRouter.getAllByRole("checkbox");
    fireEvent.click(firstCheckBox), fireEvent.click(secondCheckbox);

    const checkboxChecked = [true, true, false, false];
    await waitFor(() => {
      quizRouter.getAllByRole("checkbox").forEach((checkbox, index) => {
        if (checkboxChecked[index]) expect(checkbox).toBeChecked();
        else expect(checkbox).not.toBeChecked();
      });
    });
  });

  it("Should only render the Check Answers button on the last question", async () => {
    fireEvent.click(quizRouter.getByLabelText("pagination-button-2"));
    await waitFor(() => {
      expect(quizRouter.getByText("Check Answers")).toBeInTheDocument();
    });
  });
});

describe("When testing the results page", () => {
  beforeEach(async () => {
    await renderQuizRouter();
    fireEvent.click(quizRouter.getByText("Take Quiz"));

    await waitFor(() => {
      expect(
        quizRouter.getByText("Return To Quiz Overview")
      ).toBeInTheDocument();
    });
  });

  async function goToResults() {
    // Click the first radio button
    fireEvent.click(quizRouter.getAllByRole("radio")[0]);
    await waitFor(() => {
      expect(quizRouter.getAllByRole("radio")[0]).toBeChecked();
    });
    // Go to the next question
    fireEvent.click(quizRouter.getByText(">"));
    await waitFor(() => {
      expect(quizRouter.getByText("Question2")).toBeInTheDocument();
    });
    // Click the first checkbox
    fireEvent.click(quizRouter.getAllByRole("checkbox")[0]);
    // Click Check Answers button
    fireEvent.click(quizRouter.getByText("Check Answers"));
    await waitFor(() => {
      expect(quizRouter.getByText("50%"));
    });
  }

  it("Should display all the correct information", async () => {
    await goToResults();
    expect(quizRouter.getByText("Results")).toBeInTheDocument();
    expect(quizRouter.getByText("QuizName1 - 4 Questions")).toBeInTheDocument();
  });

  it("Should POST the user's answers to the correct route", async () => {
    await goToResults();
    expect(axiosInstance.post).toBeCalledWith("/quizzes/123abc/check", {
      answers: { questionId1: "Answer1", questionId2: ["Answer1"] }
    });
  });

  it("Should POST the results to the correct route when clicking Save Answers", async () => {
    mockAxios("post", "/users/userOid/scores", {});
    await goToResults();
    fireEvent.click(quizRouter.getByText("Save Answers"));
    await waitFor(() => {
      expect(quizRouter.getByText("Take Quiz"));
    });
    expect(axiosInstance.post).toBeCalledWith("/users/userOid/scores", {
      score: { correct: 2, quizId: "123abc", total: 4 }
    });
  });

  it("Should return to the questions with answers reset when clicking Retake Quiz", async () => {
    await goToResults();
    fireEvent.click(quizRouter.getByText("Retake Quiz"));
    await waitFor(() => {
      expect(quizRouter.getByText("Question1")).toBeInTheDocument();
      expect(quizRouter.getAllByRole("radio")[0]).not.toBeChecked();
    });
  });
});
