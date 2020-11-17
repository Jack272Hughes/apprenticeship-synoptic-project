import React from "react";
import { Grommet, Button, Box } from "grommet";

export default function Pagination(props) {
  const { currentIndex, setCurrentIndex, maxLength } = props;

  const theme = {
    button: {
      default: {},
      primary: {
        color: "white",
        background: {
          color: "dark-2"
        }
      }
    }
  };

  const handlePagination = type => {
    if (type === "increase" && currentIndex < maxLength) {
      setCurrentIndex(currentIndex + 1);
    } else if (type === "decrease" && currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const createPageNumbers = () => {
    const pageNumbers = [];

    for (let pageIndex = 0; pageIndex <= maxLength; pageIndex++) {
      pageNumbers.push(
        <Button
          key={pageIndex}
          primary={pageIndex === currentIndex}
          onClick={() => setCurrentIndex(pageIndex)}
        >
          {pageIndex + 1}
        </Button>
      );
    }

    return pageNumbers;
  };

  return (
    <Grommet theme={theme}>
      <Box gap="medium" direction="row" pad="large">
        <Button onClick={() => handlePagination("decrease")}>&lt;</Button>
        {createPageNumbers()}
        <Button onClick={() => handlePagination("increase")}>&gt;</Button>
      </Box>
    </Grommet>
  );
}
