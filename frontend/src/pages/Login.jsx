import React from "react";
import { TextInput, Box, Button, Heading, Text } from "grommet";
import { UserManager, Lock } from "grommet-icons";

import "../stylesheets/home.css";

export default function Login(props) {
  const { handleSubmit, errorMsg, setSigningup } = props;

  return (
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
