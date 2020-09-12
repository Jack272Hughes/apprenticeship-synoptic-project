import React from "react";
import { Switch, Route, BrowserRouter as Router } from "react-router-dom";

import Navbar from "../components/Navbar";
import HomePage from "./Home";
import QuizPage from "./Quizzes";
import Question from "./Question";

export default function Routes(props) {
  return (
    <Router>
      <Navbar username={props.decodedToken.username} logout={props.logout} />
      <Switch>
        <Route exact path="/">
          <HomePage acquireTokenSilent={props.acquireTokenSilent} />
        </Route>
        <Route exact path="/quizzes">
          <QuizPage />
        </Route>
        <Route
          path="/quizzes/:quizId"
          render={props => {
            const quizId = props.match.params.quizId;
            return <Question quizId={quizId} />;
          }}
        ></Route>
      </Switch>
    </Router>
  );
}
