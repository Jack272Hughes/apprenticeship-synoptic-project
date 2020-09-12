import React from "react";
import axios from "axios";
import { Box } from "grommet";

import "../stylesheets/home.css";

function Home(props) {
  axios.get("http://localhost:8080/quizzes").then(res => {
    console.log(res.data.quizzes);
  });

  return (
    <Box pad="medium" fill="vertical" align="center">
      Welcome to the home page
    </Box>
  );
}

export default Home;
