import React from "react";
import { useCookies } from "react-cookie";
import jwt from "jsonwebtoken";

import { axiosInstance } from "./";
import Login from "../pages/Login";

export default function TokenHandler(props) {
  const [cookies, setCookie, removeCookie] = useCookies(["authToken", "rft"]);
  const [errorMsg, setErrorMsg] = React.useState("");
  const [signingUp, setSigningup] = React.useState(false);

  if (cookies.authToken) {
    axiosInstance.setAuth(cookies.authToken, setCookie, removeCookie);
  }

  const handleSubmit = event => {
    setErrorMsg("");
    event.preventDefault();
    const data = new FormData(event.target);
    axiosInstance
      .postAuth(signingUp ? "signup" : "login", data)
      .then(response => {
        setCookie("authToken", response.data.token);
        setCookie("rft", response.data.rft);
      })
      .catch(err => {
        if (!err.response) return setErrorMsg("Something went wrong");
        switch (err.response.status) {
          case 401:
            setErrorMsg("Incorrect username/password");
            break;
          case 404:
            setErrorMsg("User not found");
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
      decodedToken: jwt.decode(cookies.authToken),
      logout: () => {
        axiosInstance
          .postAuth("/logout")
          .catch(console.error)
          .finally(() => {
            removeCookie("rft");
            removeCookie("authToken");
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
