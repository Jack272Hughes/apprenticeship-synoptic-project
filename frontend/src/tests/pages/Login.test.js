import React from "react";
import { render, cleanup, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import Login from "../../pages/Login";

afterAll(cleanup);

beforeAll(() => {
  mockAxios("postAuth", "/signup", {});
  mockAxios("postAuth", "/login", {});
});

const loginParams = {};
const handleSubmit = ({ target }) => {
  const formData = new FormData(target);
  loginParams.username = formData.get("username");
  loginParams.password = formData.get("password");
};
const setSigningup = jest.fn();

let loginPage;
async function renderLogin(errorMessage = "") {
  loginPage = render(
    <Login
      handleSubmit={handleSubmit}
      errorMsg={errorMessage}
      setSigningup={setSigningup}
    />
  );

  await waitFor(() => {
    expect(loginPage.getByText("Quizzical")).toBeInTheDocument();
  });
}

async function enterCredentials() {
  const usernameInput = loginPage.getByPlaceholderText("Username");
  const passwordInput = loginPage.getByPlaceholderText("Password");

  userEvent.type(usernameInput, "insertedUsername");
  userEvent.type(passwordInput, "insertedPassword");

  await waitFor(() => {
    expect(usernameInput).toHaveValue("insertedUsername");
    expect(passwordInput).toHaveValue("insertedPassword");
  });
}

describe("When testing the login page", () => {
  it("Should render the login page correctly", async () => {
    await renderLogin();
    expect(loginPage.getByText("Login")).toBeInTheDocument();
    expect(loginPage.getByPlaceholderText("Username")).toBeInTheDocument();
    expect(loginPage.getByPlaceholderText("Password")).toBeInTheDocument();
    expect(loginPage.getByText("Log In")).toBeInTheDocument();
    expect(loginPage.getByText("Sign Up")).toBeInTheDocument();
  });

  it("Should be able to display an error message", async () => {
    await renderLogin("This is a testing error");
    expect(loginPage.getByText("This is a testing error")).toBeInTheDocument();
  });

  it("Should allow the user to enter a username and password", async () => {
    await renderLogin();
    await enterCredentials();
  });

  let consoleError;
  it("Should call the handleSubmit function with the form and setSigningUp with false when clicking Log In", async () => {
    await renderLogin();
    await enterCredentials();

    // Submitting forms is not implemented in react testing library, this temporarily removes the unnecessary error
    consoleError = jest.spyOn(console, "error").mockImplementation(() => {});

    fireEvent.click(loginPage.getByText("Log In"));
    await waitFor(() => {
      expect(setSigningup).toBeCalledWith(false);
      expect(loginParams).toStrictEqual({
        username: "insertedUsername",
        password: "insertedPassword"
      });
    });
  });

  it("Should call the handleSubmit function with the form and setSigningUp with true when clicking Sign In", async () => {
    await renderLogin();
    await enterCredentials();

    fireEvent.click(loginPage.getByText("Sign Up"));
    await waitFor(() => {
      expect(setSigningup).toBeCalledWith(true);
      expect(loginParams).toStrictEqual({
        username: "insertedUsername",
        password: "insertedPassword"
      });
    });

    // Re-enable console.error function
    consoleError.mockRestore();
  });
});
