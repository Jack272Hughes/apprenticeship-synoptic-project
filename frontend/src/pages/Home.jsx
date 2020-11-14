import React from "react";
import { axiosInstance } from "../components";
import { Box } from "grommet";

import "../stylesheets/home.css";

function Home(props) {
  axiosInstance.get("/quizzes").then(res => {
    console.log(res.data.quizzes);
  });

  return (
    <Box pad="medium" fill="vertical" align="center">
      Welcome to the home page
    </Box>
  );
}

export default Home;
