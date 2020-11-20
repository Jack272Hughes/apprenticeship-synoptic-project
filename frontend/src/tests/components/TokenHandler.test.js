import React from "react";
import { render, cleanup, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { cookies, setCookies, removeCookies } from "../mockCookieHandler";
import axiosInstance from "../../utils/axiosInstance";
import TokenHandler from "../../components/TokenHandler";

afterEach(cleanup);

const copyFormData = new FormData();
copyFormData.append("username", "insertedUsername");
copyFormData.append("password", "insertedPassword");

let childProps = {};
const TokenHandlerChild = function (props) {
  childProps = props;
  return <div>Logged in</div>;
};

let tokenHandler;
async function renderTokenHandler(gotoLogin = true) {
  childProps = {};
  tokenHandler = render(
    <TokenHandler>
      <TokenHandlerChild />
    </TokenHandler>
  );

  await waitFor(() => {
    if (gotoLogin) {
      expect(tokenHandler.getByText("Login"));
    } else {
      expect(tokenHandler.getByText("Logged in"));
    }
  });
}

async function attemptLogin(buttonName = "Log In") {
  const usernameInput = tokenHandler.getByPlaceholderText("Username");
  const passwordInput = tokenHandler.getByPlaceholderText("Password");
  userEvent.type(usernameInput, "insertedUsername");
  userEvent.type(passwordInput, "insertedPassword");

  await waitFor(() => {
    expect(usernameInput).toHaveValue("insertedUsername");
    expect(passwordInput).toHaveValue("insertedPassword");
  });

  fireEvent.click(tokenHandler.getByText(buttonName));
}

describe("When testing token handler", () => {
  it("Should render the login page when there is no JWT", async () => {
    setCookies({ authToken: undefined });
    await renderTokenHandler();
  });

  it("Should render the login page when there is no refresh token", async () => {
    setCookies({ rft: undefined });
    await renderTokenHandler();
  });

  it("Should render the app if there is a JWT and RFT", async () => {
    await renderTokenHandler(false);
  });

  it("Should inject decodedToken and logout into child's props when logging in", async () => {
    await renderTokenHandler(false);
    expect(childProps).toMatchObject({
      decodedToken: { oid: "userOid" },
      logout: expect.any(Function)
    });
  });

  it("Should clear the cookies when calling the logout function", async () => {
    mockAxios("postAuth", "/logout", {});
    await renderTokenHandler(false);
    childProps.logout();
    await waitFor(() => {
      expect(cookies.authToken).toBeUndefined();
      expect(cookies.rft).toBeUndefined();
    });
  });

  it("Should send a POST request when logging in", async () => {
    mockAxios("postAuth", "/login", {});
    removeCookies(["token", "rft"]);
    await renderTokenHandler();
    await attemptLogin();
    await waitFor(() => {
      expect(axiosInstance.postAuth).toBeCalledWith("/login", copyFormData);
    });
  });

  it("Should set the cookies correctly on successfuk login", async () => {
    mockAxios("postAuth", "/login", {
      token: "newAuthToken",
      rft: "newRefreshToken"
    });
    removeCookies(["authToken", "rft"]);
    await renderTokenHandler();
    await attemptLogin();
    await waitFor(() => {
      expect(cookies).toMatchObject({
        authToken: "newAuthToken",
        rft: "newRefreshToken"
      });
    });
  });

  it("Should display correct error when there is a 401 status error", async () => {
    mockAxios(
      "postAuth",
      "/login",
      { response: { status: 401 } },
      { reject: true }
    );
    removeCookies(["authToken", "rft"]);
    await renderTokenHandler();
    await attemptLogin();
    await waitFor(() => {
      tokenHandler.getByText("Incorrect username/password");
    });
  });

  it("Should display correct error when there is a 404 status error", async () => {
    mockAxios(
      "postAuth",
      "/login",
      { response: { status: 404 } },
      { reject: true }
    );
    removeCookies(["authToken", "rft"]);
    await renderTokenHandler();
    await attemptLogin();
    await waitFor(() => {
      tokenHandler.getByText("Incorrect username/password");
    });
  });

  it("Should display correct error when there is a 409 status error", async () => {
    mockAxios(
      "postAuth",
      "/login",
      { response: { status: 409 } },
      { reject: true }
    );
    removeCookies(["authToken", "rft"]);
    await renderTokenHandler();
    await attemptLogin();
    await waitFor(() => {
      tokenHandler.getByText("Username is already in use");
    });
  });

  it("Should display default error when there is a unknown status error", async () => {
    mockAxios(
      "postAuth",
      "/login",
      { response: { status: 500 } },
      { reject: true }
    );
    removeCookies(["authToken", "rft"]);
    await renderTokenHandler();
    await attemptLogin();
    await waitFor(() => {
      tokenHandler.getByText("Something went wrong");
    });
  });

  it("Should display default error when there is no status in the error", async () => {
    mockAxios("postAuth", "/login", {}, { reject: true });
    removeCookies(["authToken", "rft"]);
    await renderTokenHandler();
    await attemptLogin();
    await waitFor(() => {
      tokenHandler.getByText("Something went wrong");
    });
  });
});
