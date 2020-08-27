import React from "react";
import ReactDOM from "react-dom";
import "./stylesheets/index.css";
import Home from "./pages/Home";
import Login from "./pages/Login";
import * as serviceWorker from "./serviceWorker";
import { Grommet, grommet } from "grommet";
import { deepMerge } from "grommet/utils";

const customTheme = deepMerge(grommet, {
  global: {
    colors: {
      quiz: "red"
    }
  }
});

ReactDOM.render(
  <Grommet theme={customTheme}>
    <Login>
      <Home />
    </Login>
  </Grommet>,
  document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
