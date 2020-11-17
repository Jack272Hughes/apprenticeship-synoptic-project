import React from "react";
import { Layer } from "grommet";
import { Switch, Route, BrowserRouter as Router } from "react-router-dom";

import { Navbar } from "../components";
import HomePage from "./Home";
import AllQuizzesPage from "./Quizzes";
import EditQuizPage from "./EditQuiz";
import { QuizRouter } from "./QuizPages";

export default function Routes(props) {
  const [modalContent, setModalContent] = React.useState(null);

  const { logout, decodedToken } = props;
  const roles = { USER: 0, MODERATOR: 1, ADMIN: 2 };

  const handleClose = () => {
    setModalContent(null);
  };

  return (
    <>
      <Router>
        {modalContent && (
          <Layer onEsc={handleClose} onClickOutside={handleClose}>
            {modalContent}
          </Layer>
        )}
        <Navbar
          token={decodedToken}
          roles={roles}
          logout={logout}
          setModalContent={setModalContent}
        />
        <Switch>
          <Route exact path="/">
            <HomePage />
          </Route>
          <Route exact path="/quizzes">
            <AllQuizzesPage />
          </Route>
          <Route
            exact
            path="/quizzes/:quizId"
            render={props => (
              <QuizRouter
                quizId={props.match.params.quizId}
                roles={roles}
                token={decodedToken}
              />
            )}
          />
          {roles[decodedToken.role] === roles.ADMIN && (
            <Route
              exact
              path="/quizzes/:quizId/edit"
              render={props => (
                <EditQuizPage quizId={props.match.params.quizId} />
              )}
            />
          )}
        </Switch>
      </Router>
    </>
  );
}
