function login(role = "user") {
  const username =
    role === "user" ? "User" : role === "moderator" ? "Moderator" : "Admin";
  cy.get("input[name='username']").type(username, { force: true });
  cy.get("input[name='password']").type("Hello123", { force: true });
  cy.contains("Log In").click();
}

describe("When testing the quiz overview it", () => {
  it("Should take you to the overview when you click on a quiz", () => {
    cy.visit("http://localhost:3000/quizzes");
    login();
    cy.contains("Basic Quiz").click();
    cy.location().should(location =>
      expect(location.href).to.match(/\/quizzes\/5fb4644afa09ec57a97fd13f/)
    );
  });

  it("Should contain the correct information for a quiz", () => {
    cy.visit("http://localhost:3000/quizzes/5fb4644afa09ec57a97fd13f");
    login();
    cy.contains("Basic Quiz");
    cy.contains("A basic quiz to show off radio buttons and check boxes");
    cy.contains("Total Questions: 4");
    cy.contains("Maximum Score: 8");
  });

  it("Should have a 'Take Quiz' button as a normal user", () => {
    cy.visit("http://localhost:3000/quizzes/5fb4644afa09ec57a97fd13f");
    login();
    cy.contains("Take Quiz");
  });

  it("Should take you to the questions page when clicking Take Quiz", () => {
    cy.visit("http://localhost:3000/quizzes/5fb4644afa09ec57a97fd13f");
    login();
    cy.contains("Take Quiz").click();
    cy.contains("What is 2 + 2?");
  });

  it("Should display a 404 when clicking Take Quiz when there are no questions", () => {
    cy.visit("http://localhost:3000/quizzes/5fb589da1e1cfcd1fef45634");
    login();
    cy.contains("Take Quiz").click();
    cy.contains("Error 404");
  });

  it("Should have two buttons as a moderator", () => {
    cy.visit("http://localhost:3000/quizzes/5fb4644afa09ec57a97fd13f");
    login("moderator");
    cy.contains("Take Quiz");
    cy.contains("Show Answers");
  });

  it("Should take you to the answers page when clicking Show Answers", () => {
    cy.visit("http://localhost:3000/quizzes/5fb4644afa09ec57a97fd13f");
    login("moderator");
    cy.contains("Show Answers").click();
    cy.contains("❌");
    cy.contains("✔️");
  });

  it("Should have a four buttons as an admin", () => {
    cy.visit("http://localhost:3000/quizzes/5fb4644afa09ec57a97fd13f");
    login("admin");
    cy.contains("Take Quiz");
    cy.contains("Show Answers");
    cy.contains("Edit Quiz");
    cy.contains("Delete Quiz");
  });

  it("Should send delete request and return to quizzes page when deleting a quiz", () => {
    cy.visit("http://localhost:3000/quizzes/5fb589da1e1cfcd1fef45634");
    login("admin");
    cy.server();
    cy.route("DELETE", "/quizzes/*").as("deleteRequest");
    cy.contains("Delete Quiz").click();
    cy.wait("@deleteRequest");
    cy.get("@deleteRequest").should("have.property", "status", 200);
    cy.location().should(location =>
      expect(location.href).to.match(/\/quizzes/)
    );
    cy.contains("Empty Quiz").should("not.exist");
  });

  it("Should take you to the editing page when clicking Edit Quiz", () => {
    cy.visit("http://localhost:3000/quizzes/5fb4644afa09ec57a97fd13f");
    login("admin");
    cy.contains("Edit Quiz").click();
    cy.location().should(location =>
      expect(location.href).to.match(
        /\/quizzes\/5fb4644afa09ec57a97fd13f\/edit/
      )
    );
  });
});
