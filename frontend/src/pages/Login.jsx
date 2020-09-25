import React from "react";
import axios from "axios";
import { useCookies } from "react-cookie";
import jwt from "jsonwebtoken";
import { TextInput, Box, Button, Heading, Text } from "grommet";
import { UserManager, Lock } from "grommet-icons";

import "../stylesheets/home.css";
axios.defaults.withCredentials = true;

export default function Login(props) {
  const [cookies, setCookie, removeCookie] = useCookies(["authToken", "rft"]);
  const [errorMsg, setErrorMsg] = React.useState("");
  const [signingUp, setSigningup] = React.useState(false);

  axios.defaults.headers.Authorization = `Bearer ${cookies.authToken}`;

  if (
    cookies.authToken &&
    cookies.rft &&
    Math.ceil(Date.now() / 1000) >= jwt.decode(cookies.authToken).exp - 300
  ) {
    axios
      .post("http://localhost:5000/token")
      .then(response => {
        setCookie("authToken", response.data.token);
        setCookie("rft", response.data.rft);
      })
      .catch(err => {
        console.error(err);
        removeCookie("authToken");
        removeCookie("rft");
      });
  }

  const handleSubmit = event => {
    setErrorMsg("");
    event.preventDefault();
    const data = new FormData(event.target);
    axios
      .post(`http://localhost:5000/${signingUp ? "signup" : "login"}`, data)
      .then(response => {
        setCookie("authToken", response.data.token);
        setCookie("rft", response.data.rft);
      })
      .catch(err => {
        console.log(err);
        switch (err.response.status) {
          case 401:
            setErrorMsg("Incorrect username/password");
            break;
          case 404:
            setErrorMsg("Username/password field empty");
            break;
          case 409:
            setErrorMsg("Username is already in use");
            break;
          default:
            setErrorMsg("Something went wrong");
        }
      });
  };

  // If authToken is set return wrapped JSX and
  // Inject the authToken and logout function
  return cookies.authToken ? (
    React.cloneElement(props.children, {
      decodedToken: jwt.decode(cookies.authToken),
      logout: () => {
        axios
          .post("http://localhost:5000/logout")
          .catch(console.error)
          .finally(() => {
            removeCookie("rft");
            removeCookie("authToken");
          });
      }
    })
  ) : (
    // If authToken isn't set return the login page
    <>
      <form onSubmit={handleSubmit}>
        <Box justify="center" align="center" pad="large">
          <Heading size="large" level={1}>
            Quizzical
          </Heading>
          <Box
            background="dark-1"
            width="medium"
            pad="large"
            align="center"
            gap="small"
            round
          >
            <Heading size="large" level={2}>
              Login
            </Heading>
            <Text color="status-error">{errorMsg}</Text>
            <TextInput
              icon={<UserManager />}
              placeholder="Username"
              name="username"
              required
            />
            <TextInput
              icon={<Lock />}
              placeholder="Password"
              name="password"
              type="password"
              required
            />
            <br />
            <Box align="center" direction="row" gap="small">
              <Button
                primary
                label="Log In"
                onClick={() => setSigningup(false)}
                type="submit"
              />
              <Button
                primary
                label="Sign Up"
                onClick={() => setSigningup(true)}
                type="submit"
              />
            </Box>
          </Box>
        </Box>
      </form>
    </>
  );
}
