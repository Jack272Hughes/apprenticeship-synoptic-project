import React from "react";
import { Nav, Anchor, Header, Box } from "grommet";
import { Link } from "react-router-dom";

import { CreateQuizModal } from "./";

export default function Navbar(props) {
  const { token, roles, logout, setModalContent } = props;

  const itemList = () => {
    const items = [
      { label: "Home", href: "/" },
      { label: "Quizzes", href: "/quizzes" }
    ];

    if (roles[token.role] >= roles.ADMIN) {
      items.push({
        label: "Create Quiz",
        onClick: () =>
          setModalContent(
            <CreateQuizModal
              userOid={token.oid}
              setModalContent={setModalContent}
            />
          )
      });
    }

    return items;
  };

  return (
    <Header data-test-id="navbar" background="dark-1" pad="medium">
      <Nav direction="row" gap="large">
        {itemList().map(item => (
          <Anchor
            as={({ colorProp, hasIcon, hasLabel, focus, ...props }) => {
              if (item.href) {
                return (
                  <Link {...props} to={item.href}>
                    {item.label}
                  </Link>
                );
              } else if (item.onClick) {
                return (
                  <Anchor
                    {...props}
                    onClick={item.onClick}
                    label={item.label}
                  />
                );
              }
            }}
            size="xxlarge"
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
          {token.username}
        </Anchor>
        <Anchor
          size="xxlarge"
          color="white"
          onClick={logout}
          style={{ paddingLeft: "2rem" }}
        >
          Logout
        </Anchor>
      </Box>
    </Header>
  );
}
