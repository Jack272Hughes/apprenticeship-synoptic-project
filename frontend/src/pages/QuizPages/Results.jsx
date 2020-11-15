import React from "react";
import { Box, Heading, Drop } from "grommet";

export default function Results(props) {
  const { quiz } = props;

  return (
    <Box justify="center" align="center" pad="medium" fill="vertical">
      <Heading>Results</Heading>
      <Heading size="small">{quiz.name}</Heading>
    </Box>
  );
}
