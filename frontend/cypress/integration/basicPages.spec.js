function login(role = "user") {
  const username =
    role === "user" ? "User" : role === "moderator" ? "Moderator" : "Admin";
  cy.get("input[name='username']").type(username, { force: true });
  cy.get("input[name='password']").type("Hello123", { force: true });
  cy.contains("Log In").click();
}

describe("When testing the home page it", () => {
  it("Should have a button called Home on the navbar", () => {
    cy.visit("http://localhost:3000/");
    login();
    cy.contains("Home");
  });

  it("Should navigate to the home page when clicking Home on the navbar", () => {
    cy.visit("http://localhost:3000/quizzes");
    login();
    cy.contains("Home").click();
    cy.location().should(location => {
      expect(location.href).to.equal("http://localhost:3000/");
    });
  });

  it("Should contain a welcoming message", () => {
    cy.visit("http://localhost:3000/");
    login();
    cy.contains("Welcome to the home page");
  });
});

describe("When testing the quizzes page it", () => {
  it("Should have a button called Quizzes on the navbar", () => {
    cy.visit("http://localhost:3000/");
    login();
    cy.contains("Quizzes");
  });

  it("Should navigate to the quizzes page when clicking Quizzes on the navbar", () => {
    cy.visit("http://localhost:3000/");
    login();
    cy.contains("Quizzes").click();
    cy.location().should(location => {
      expect(location.href).to.equal("http://localhost:3000/quizzes");
    });
  });

  it("Should contain four predefined quizzes", () => {
    cy.visit("http://localhost:3000/quizzes");
    login();
    cy.contains("Basic Quiz");
    cy.contains("Short Quiz");
    cy.contains("Empty Quiz");
    cy.contains("Incorrect Quiz");
  });
});

describe("When testing the create quiz modal it", () => {
  it("Should not have a button called Create Quiz on the navbar when logged in as a user", () => {
    cy.visit("http://localhost:3000/");
    login();
    cy.contains("Create Quiz").should("not.exist");
  });

  it("Should have a button called Create Quiz on the navbar when logged in as an admin", () => {
    cy.visit("http://localhost:3000/");
    login("admin");
    cy.contains("Create Quiz");
  });

  it("Should bring up a modal when clicking on Create Quiz", () => {
    cy.visit("http://localhost:3000/");
    login("admin");
    cy.contains("Create Quiz").click();
    cy.get("input[name='description']").should("exist");
  });

  it("Should allow you to add a quiz when clicking on Create Quiz", () => {
    cy.visit("http://localhost:3000/");
    login("admin");
    cy.contains("Create Quiz").click();
    cy.get("input[name='name']").type("New Quiz 1", { force: true });
    cy.get("input[name='description']").type("description", { force: true });
    cy.contains("button", "Create").click();
    cy.visit("http://localhost:3000/quizzes");
    cy.contains("New Quiz 1");
  });

  it("Should redirect you to the editing page when clicking Create Quiz", () => {
    cy.visit("http://localhost:3000/");
    login("admin");
    cy.contains("Create Quiz").click();
    cy.get("input[name='name']").type("New Quiz 2", { force: true });
    cy.get("input[name='description']").type("description", { force: true });
    cy.contains("button", "Create").click();
    cy.location().then(location =>
      expect(location.href).to.match(
        /http:\/\/localhost:3000\/quizzes\/.*?\/edit/
      )
    );
  });
});
