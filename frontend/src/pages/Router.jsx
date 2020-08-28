import React from "react";
import { Switch, Route, BrowserRouter as Router } from "react-router-dom";

import { Box } from "grommet";
import Navbar from "../components/Navbar";
import HomePage from "./Home";

export default function Routes(props) {
  return (
    <Router>
      <Navbar username={props.decodedToken.username} logout={props.logout} />
      <Box pad="medium" fill="vertical" align="center">
        <Switch>
          <Route exact path="/">
            <HomePage acquireTokenSilent={props.acquireTokenSilent} />
          </Route>
          <Route path="/quizzes">Welcome to the quizzes page</Route>
        </Switch>
      </Box>
    </Router>
  );
}
