import React from "react";
import { render, cleanup, waitFor, fireEvent } from "@testing-library/react";
import { Router } from "react-router-dom";

import Navbar from "../../components/Navbar";
import mockedData from "../mockedData.json";
const links = ["Home", "Quizzes", "Logout", "Create Quiz"];

afterEach(cleanup);

let navbar;
const logout = jest.fn();
const setModalContent = jest.fn();
async function renderNavbar(role = "USER") {
  navbar = render(
    <Router history={{ createHref: () => {}, listen: () => {}, location: {} }}>
      <Navbar
        token={{ role, oid: "userOid", username: "username" }}
        roles={mockedData.roles}
        logout={logout}
        setModalContent={setModalContent}
      />
    </Router>
  );

  await waitFor(() => {
    expect(navbar.getByText("username")).toBeInTheDocument();
  });
}

describe("When testing the navbar", () => {
  it("Should render the navbar with correct links as a user", async () => {
    await renderNavbar();

    const userLinks = links.slice(0, 3);
    userLinks.forEach(link => {
      expect(navbar.getByText(link)).toBeInTheDocument();
    });

    expect(navbar.queryByText("Create Quiz")).not.toBeInTheDocument();
  });

  it("Should render the navbar with correct links as an admin", async () => {
    await renderNavbar("ADMIN");

    links.forEach(link => {
      expect(navbar.getByText(link)).toBeInTheDocument();
    });
  });

  it("Should call the logout function when clicking on the Logout button", async () => {
    await renderNavbar();
    fireEvent.click(navbar.getByText("Logout"));
    await waitFor(() => {
      expect(logout).toBeCalled();
    });
  });

  it("Should call the setModalContent function when clicking on the Create Quiz button", async () => {
    await renderNavbar("ADMIN");
    fireEvent.click(navbar.getByText("Create Quiz"));
    await waitFor(() => {
      expect(setModalContent).toBeCalled();
    });
  });
});
