import React from "react";
import { Nav, Anchor, Header, Box } from "grommet";

const items = [
  { label: "Home", href: "/" },
  { label: "Quizzes", href: "/quizzes" }
];

export default function Navbar(props) {
  return (
    <Header data-test-id="navbar" background="dark-1" pad="medium">
      <Nav direction="row" gap="large">
        {items.map(item => (
          <Anchor
            size="xxlarge"
            href={item.href}
            label={item.label}
            key={item.label}
          />
        ))}
      </Nav>
      <Box direction="row" align="center" gap="medium">
        <Anchor
          size="xxlarge"
          color="white"
          onClick={() => console.log("Goto profile")}
        >
          {props.username}
        </Anchor>
        <Anchor
          size="xxlarge"
          color="white"
          onClick={props.logout}
          style={{ paddingLeft: "2rem" }}
        >
          Logout
        </Anchor>
      </Box>
    </Header>
  );
}
