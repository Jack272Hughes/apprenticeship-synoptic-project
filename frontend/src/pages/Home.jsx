import React from "react";
import axios from "axios";
import { Button, Box } from "grommet";

import { Navbar } from "../components";
import "../stylesheets/home.css";

axios.defaults.withCredentials = true;

function App(props) {
  return (
    <>
      <Navbar username={props.decodedToken.username} logout={props.logout} />
      <Box pad="medium" width="small">
        <Button
          primary
          label="Acquire Token"
          onClick={props.acquireTokenSilent}
        />
      </Box>
    </>
  );
}

export default App;
