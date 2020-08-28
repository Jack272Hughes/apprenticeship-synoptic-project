import React from "react";
import { Nav, Anchor, Header, Box } from "grommet";

const items = [
  { label: "Home", href: "/" },
  { label: "Quizzes", href: "/quizzes" }
];

export default function Navbar(props) {
  return (
    <Header data-test-id="navbar" background="dark-1" pad="medium">
      <Nav direction="row">
        {items.map(item => (
          <Anchor
            size="large"
            style={{ paddingRight: "1rem" }}
            href={item.href}
            label={item.label}
            key={item.label}
          />
        ))}
      </Nav>
      <Box direction="row" align="center" gap="small">
        <Anchor
          size="large"
          color="white"
          onClick={() => console.log("Goto profile")}
        >
          {props.username}
        </Anchor>
        <Anchor
          size="large"
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
