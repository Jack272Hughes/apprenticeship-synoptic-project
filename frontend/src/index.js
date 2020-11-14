import React from "react";
import ReactDOM from "react-dom";
import "./stylesheets/index.css";
import Routes from "./pages/Router";
import { TokenHandler } from "./components";
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
    <TokenHandler>
      <Routes />
    </TokenHandler>
  </Grommet>,
  document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
