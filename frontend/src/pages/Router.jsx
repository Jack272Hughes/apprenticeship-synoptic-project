import React from "react";
import { Switch, Route, BrowserRouter as Router } from "react-router-dom";
import { Button } from "grommet";

import Navbar from "../components/Navbar";
import HomePage from "./Home";
import AllQuizzesPage from "./Quizzes";
import { QuizHandler } from "./QuizPages";

export default function Routes(props) {
  const { logout, decodedToken } = props;
  const roles = { USER: 0, MODERATOR: 1, ADMIN: 2 };

  return (
    <>
      <Button onClick={props.getNewToken} />
      <Router>
        <Navbar username={decodedToken.username} logout={logout} />
        <Switch>
          <Route exact path="/">
            <HomePage />
          </Route>
          <Route exact path="/quizzes">
            <AllQuizzesPage />
          </Route>
          <Route
            path="/quizzes/:quizId"
            render={props => {
              const quizId = props.match.params.quizId;
              return (
                <QuizHandler
                  quizId={quizId}
                  roles={roles}
                  token={decodedToken}
                />
              );
            }}
          />
        </Switch>
      </Router>
    </>
  );
}
