import React from "react";
import jwt from "jsonwebtoken";

import { axiosInstance, useCookies } from "./";
import Login from "../pages/Login";

export default function TokenHandler(props) {
  const [cookies, setCookies, removeCookies] = useCookies(["authToken", "rft"]);
  const [errorMsg, setErrorMsg] = React.useState("");
  const [signingUp, setSigningup] = React.useState(false);

  const decodedToken = jwt.decode(cookies.authToken);

  if (cookies.authToken && cookies.rft) {
    axiosInstance.setAuth(cookies.authToken, setCookies, removeCookies);
  } else {
    removeCookies(["authToken", "rft"]);
  }

  const handleSubmit = event => {
    setErrorMsg("");
    event.preventDefault();
    const data = new FormData(event.target);
    axiosInstance
      .postAuth(signingUp ? "signup" : "login", data)
      .then(response => {
        setCookies({ authToken: response.data.token, rft: response.data.rft });
      })
      .catch(err => {
        if (!err.response) return setErrorMsg("Something went wrong");
        switch (err.response.status) {
          case 401:
            setErrorMsg("Incorrect username/password");
            break;
          case 404:
            setErrorMsg("Username does not exist");
            break;
          case 409:
            setErrorMsg("Username is already in use");
            break;
          default:
            setErrorMsg("Something went wrong");
        }
      });
  };

  // If authToken is truthy return wrapped JSX and
  // Inject the authToken and logout function
  return cookies.authToken ? (
    React.cloneElement(props.children, {
      getNewToken: axiosInstance.getNewToken,
      decodedToken: decodedToken,
      logout: () => {
        axiosInstance
          .postAuth("/logout")
          .catch(console.error)
          .finally(() => {
            removeCookies(["authToken", "rft"]);
          });
      }
    })
  ) : (
    // If authToken is falsy return the login page
    <Login
      handleSubmit={handleSubmit}
      errorMsg={errorMsg}
      setSigningup={setSigningup}
    />
  );
}
