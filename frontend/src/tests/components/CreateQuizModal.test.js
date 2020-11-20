import React from "react";
import { render, cleanup, waitFor, fireEvent } from "@testing-library/react";

import CreateQuizModal from "../../components/CreateQuizModal";
import axiosInstance from "../../utils/axiosInstance";

let redirectTo = "";
jest.mock("react-router-dom", () => {
  return {
    ...jest.requireActual("react-router-dom"),
    Redirect: function (props) {
      redirectTo = props.to;
      return <div></div>;
    }
  };
});

afterEach(cleanup);

let quizModal;
const setModalContent = jest.fn();
async function renderQuizModal() {
  redirectTo = "";
  quizModal = render(
    <CreateQuizModal setModalContent={setModalContent} userOid="userOid" />
  );

  await waitFor(() => {
    expect(quizModal.getByText("Create Quiz!")).toBeInTheDocument();
  });
}

function getInputs() {
  return [
    quizModal.getByPlaceholderText("Name of the quiz"),
    quizModal.getByPlaceholderText("Describe the quiz...")
  ];
}

describe("When testing the create quiz modal component", () => {
  it("Should render inputs and heading correctly", async () => {
    await renderQuizModal();
    const [nameInput, descInput] = getInputs();

    expect(nameInput).toBeInTheDocument();
    expect(descInput).toBeInTheDocument();
    expect(quizModal.getByText("Create")).toBeInTheDocument();
    expect(quizModal.getByText("Cancel")).toBeInTheDocument();
  });

  it("Should allow the user to input a name and description", async () => {
    await renderQuizModal();
    const [nameInput, descInput] = getInputs();

    fireEvent.change(nameInput, { target: { value: "insertedName" } });
    fireEvent.change(descInput, { target: { value: "insertedDescription" } });

    await waitFor(() => {
      expect(nameInput).toHaveValue("insertedName");
      expect(descInput).toHaveValue("insertedDescription");
    });
  });

  it("Should call the setModalContent function with null when clicking Cancel", async () => {
    await renderQuizModal();
    fireEvent.click(quizModal.getByText("Cancel"));

    await waitFor(() => {
      expect(setModalContent).toBeCalledWith(null);
    });
  });

  it("Should make a POST request with inputs when clicking Create", async () => {
    mockAxios("post", "/quizzes", { insertedId: "123abc" });
    await renderQuizModal();
    const [nameInput, descInput] = getInputs();

    fireEvent.change(nameInput, { target: { value: "insertedName" } });
    fireEvent.change(descInput, { target: { value: "insertedDescription" } });
    fireEvent.click(quizModal.getByText("Create"));

    await waitFor(() => {
      expect(axiosInstance.post).toBeCalledWith("/quizzes", {
        quiz: {
          description: "insertedDescription",
          name: "insertedName",
          userOid: "userOid"
        }
      });
    });
  });

  it("Should attempt to redirect to the editing page", async () => {
    mockAxios("post", "/quizzes", { insertedId: "123abc" });
    await renderQuizModal();
    const [nameInput, descInput] = getInputs();

    fireEvent.change(nameInput, { target: { value: "insertedName" } });
    fireEvent.change(descInput, { target: { value: "insertedDescription" } });
    fireEvent.click(quizModal.getByText("Create"));

    await waitFor(() => {
      expect(redirectTo).toBe("/quizzes/123abc/edit");
    });
  });
});
