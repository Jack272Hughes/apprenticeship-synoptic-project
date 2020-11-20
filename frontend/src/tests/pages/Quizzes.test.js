import React from "react";
import { render, cleanup, waitFor } from "@testing-library/react";

import Quizzes from "../../pages/Quizzes";
import mockedData from "../mockedData.json";

afterEach(cleanup);

beforeAll(() => {
  mockAxios(
    "get",
    "/quizzes",
    { quizzes: mockedData.mockQuizzes },
    { persist: true }
  );
});

describe("When testing the quizzes page", () => {
  it("Should render both quizzes on the page", async () => {
    const { getByText } = render(<Quizzes />);
    await waitFor(() => {
      expect(getByText("QuizName1")).toBeInTheDocument();
      expect(getByText("QuizDescription1")).toBeInTheDocument();
      expect(getByText("QuizName2")).toBeInTheDocument();
      expect(getByText("QuizDescription2")).toBeInTheDocument();
    });
  });
});
