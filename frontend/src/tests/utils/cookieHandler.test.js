import React from "react";
import {
  render,
  cleanup,
  waitFor,
  fireEvent,
  act
} from "@testing-library/react";

import useCookies from "../../utils/cookieHandler";

afterEach(cleanup);

let cookies, setCookies, removeCookies;
function MockReactComponent() {
  const [mockCookies, mockSetCookies, mockRemoveCookies] = useCookies();
  cookies = mockCookies;
  setCookies = mockSetCookies;
  removeCookies = mockRemoveCookies;
  return <div>Rendered</div>;
}

let renderedComponent;
async function renderWithCookies(cookies = {}) {
  document.cookie = `authToken=${cookies.auth || "mockedAuthToken"}`;
  document.cookie = `rft=${cookies.rft || "mockedRft"}`;

  renderedComponent = render(<MockReactComponent />);

  await waitFor(() => {
    renderedComponent.getByText("Rendered");
  });
}

describe("When testing cookieHandler", () => {
  it("Should correctly return an object and two functions", async () => {
    await renderWithCookies();
    expect(cookies).toMatchObject({
      authToken: "mockedAuthToken",
      rft: "mockedRft"
    });
    expect(setCookies).toEqual(expect.any(Function));
    expect(removeCookies).toEqual(expect.any(Function));
  });

  it("Should correctly set the cookies and rerender the component", async () => {
    await renderWithCookies();
    act(() => {
      setCookies({ authToken: "newAuthToken" });
    });

    expect(cookies).toStrictEqual({
      authToken: "newAuthToken",
      rft: "mockedRft"
    });
  });

  it("Should correctly remove cookies and rerender the component", async () => {
    await renderWithCookies();
    act(() => {
      removeCookies(["authToken"]);
    });

    expect(cookies).toStrictEqual({
      rft: "mockedRft"
    });
  });
});
