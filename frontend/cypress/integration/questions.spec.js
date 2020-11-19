function login(role = "user") {
  const username =
    role === "user" ? "User" : role === "moderator" ? "Moderator" : "Admin";
  cy.get("input[name='username']").type(username, { force: true });
  cy.get("input[name='password']").type("Hello123", { force: true });
  cy.contains("Log In").click();
}

function nextQuestion(questionNum) {
  if (questionNum) {
    cy.get(`button[aria-label='pagination-button-${questionNum}']`).click();
  } else {
    cy.get("button[aria-label='pagination-next-button']").click();
  }
}

function takeQuiz(quizId) {
  cy.visit(`http://localhost:3000/quizzes/${quizId}`);
  login();
  cy.contains("Take Quiz").click();
}

describe("When taking a quiz it", () => {
  it("Should display paginated questions", () => {
    takeQuiz("5fb4644afa09ec57a97fd13f");
    cy.get("button[aria-label^='pagination-button-']").each((button, index) => {
      expect(button).to.contain(index + 1);
    });
  });

  it("Should allow you to select an answer for each question", () => {
    takeQuiz("5fb4644afa09ec57a97fd13f");
    cy.get("label[for='4']").click();
    nextQuestion();
    cy.get("label[for='24']").click();
    nextQuestion();
    cy.get("span").contains("4 x 4").click();
    cy.get("span").contains("8 x 2").click();
    nextQuestion();
    for (let answer = 1; answer < 9; answer *= 2) {
      cy.get("span").contains(answer).click();
    }
  });

  it("Should show a Check Answers button only on the last question", () => {
    takeQuiz("5fb4644afa09ec57a97fd13f");
    cy.contains("Check Answers").should("not.exist");
    cy.get("button[aria-label='pagination-button-4']").click();
    cy.contains("Check Answers");
  });

  it("Should show you total correct answers when clicking Check Answers", () => {
    takeQuiz("5fb589da1e1cfcd1fef45633");
    cy.get("span").contains("Load Of Laughs").click();
    cy.contains("Check Answers").click();
    cy.contains("Results");
    cy.contains("50%");
    cy.get("circle").should("exist");
    cy.contains("Save Answers");
    cy.contains("Retake Quiz");
  });

  it("Should show you your correct amount of answers as a fraction when hovering over the graph", () => {
    takeQuiz("5fb589da1e1cfcd1fef45633");
    cy.get("span").contains("Load Of Laughs").click();
    cy.contains("Check Answers").click();
    cy.get("path").trigger("mouseover", { force: true });
    cy.contains("1 / 2");
  });

  it("Should save results and return to overview when clicking save results", () => {
    takeQuiz("5fb589da1e1cfcd1fef45633");
    cy.contains("Check Answers").click();
    cy.server();
    cy.route("POST", "/users/*/scores").as("saveRequest");
    cy.contains("Save Answers").click();
    cy.wait("@saveRequest");
    cy.get("@saveRequest").should("have.property", "status", 200);
    cy.location().should(location =>
      expect(location.href).to.match(/\/quizzes\/5fb589da1e1cfcd1fef45633/)
    );
  });

  it("Should take you to the start of the quiz and reset answers when clicking retake quiz", () => {
    takeQuiz("5fb589da1e1cfcd1fef45633");
    cy.get("span").contains("Load Of Laughs").click();
    cy.contains("Check Answers").click();
    cy.contains("Retake Quiz").click();
    cy.contains("What does LOL not stand for?");
    cy.get("input").first().should("not.be.checked");
  });
});
