import React from "react";
import { render, cleanup, waitFor, fireEvent } from "@testing-library/react";

import Pagination from "../../components/Pagination";

afterAll(cleanup);

let pagination;
let currentIndex = 0;
const setCurrentIndex = jest.fn(index => {
  currentIndex = index;
  pagination.rerender(
    <Pagination
      currentIndex={currentIndex}
      setCurrentIndex={setCurrentIndex}
      maxLength={2}
    />
  );
});

async function renderPagination() {
  currentIndex = 0;
  pagination = render(
    <Pagination
      currentIndex={currentIndex}
      setCurrentIndex={setCurrentIndex}
      maxLength={2}
    />
  );

  await waitFor(() => {
    expect(pagination.getByText("<")).toBeInTheDocument();
  });
}

describe("When testing pagination", () => {
  it("Should correctly render the pagination bar", async () => {
    await renderPagination();
    const buttonValues = ["&lt;", "1", "2", "3", "&gt;"];
    expect(pagination.getByText("<")).toBeInTheDocument();
    expect(pagination.getByText(">")).toBeInTheDocument();
    pagination.getAllByRole("button").forEach((button, index) => {
      expect(button.innerHTML).toBe(buttonValues[index]);
    });
  });

  it("Should call the setCurrentIndex function when using the arrows", async () => {
    await renderPagination();
    fireEvent.click(pagination.getByText(">"));
    await waitFor(() => {
      expect(setCurrentIndex).toBeCalledWith(1);
    });
  });

  it("Should call the setCurrentIndex function when clicking on a number", async () => {
    await renderPagination();
    fireEvent.click(pagination.getByText("3"));
    await waitFor(() => {
      expect(setCurrentIndex).toBeCalledWith(2);
    });
  });

  it("Should highlight the currently active index", async () => {
    await renderPagination();
    expect(pagination.getByText("1")).toHaveStyle(
      `background-color: rgb(85, 85, 85);`
    );
    fireEvent.click(pagination.getByText("3"));
    await waitFor(() => {
      expect(pagination.getByText("3")).toHaveStyle(
        `background-color: rgb(85, 85, 85);`
      );
    });
  });
});
