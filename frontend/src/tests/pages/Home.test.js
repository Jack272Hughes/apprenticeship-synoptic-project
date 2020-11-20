import React from "react";
import { render, cleanup, waitFor } from "@testing-library/react";

import Home from "../../pages/Home";

afterAll(cleanup);

describe("When testing the Home page", () => {
  it("Should render a welcoming message", async () => {
    const { getByText } = render(<Home />);
    await waitFor(() => {
      expect(getByText("Welcome to the home page")).toBeInTheDocument();
    });
  });
});
