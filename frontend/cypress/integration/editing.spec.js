function login(role = "user") {
  const username =
    role === "user" ? "User" : role === "moderator" ? "Moderator" : "Admin";
  cy.get("input[name='username']").type(username, { force: true });
  cy.get("input[name='password']").type("Hello123", { force: true });
  cy.contains("Log In").click();
}

function inputContains(inputName, contains) {
  cy.get(`input[name='${inputName}']`).should("have.value", contains);
}

function changeInput(inputName, change) {
  cy.get(`input[name='${inputName}']`).type(`{selectall}${change}`);
}

describe("When editing a quiz", () => {
  beforeEach(() => {
    cy.server();
    cy.route("/quizzes/*/questions/answers").as("quizRequest");
    cy.visit("http://localhost:3000/quizzes/5fb589da1e1cfcd1fef45635/edit");
    login("admin");
    cy.wait("@quizRequest");
  });

  it("Should fill out the inputs for existing questions", () => {
    inputContains("quiz-name", "Incorrect Quiz");
    inputContains(
      "quiz-description",
      "Contains some incorrect values, if only an admin would fix them..."
    );
    inputContains("question-name", "Whathas exactly 4 lines of symmetry?");
    cy.get("span").contains("Circle");
    cy.get("input[name='question-multiple-answers']").should("be.checked");
  });

  it("Should allow you to change the quiz name and description", () => {
    changeInput("quiz-name", "Correct Quiz");
    changeInput("quiz-description", "Contains only correct values");

    inputContains("quiz-name", "Correct Quiz");
    inputContains("quiz-description", "Contains only correct values");
  });

  it("Should allow you to change the question name and question answers", () => {
    changeInput("question-name", "What two shapes are squares?");
    cy.get("span").contains("Circle").click();
    cy.get("button").contains("－").click();
    changeInput("new-answer", "Diamond");
    cy.get("button").contains("＋").click();
    cy.get("span").contains("Diamond").click();

    const answers = {
      1: "not.be.checked",
      2: "not.be.checked",
      3: "be.checked",
      4: "be.checked"
    };

    inputContains("question-name", "What two shapes are squares?");
    cy.get("input[type='checkbox']").each((checkbox, index) => {
      if (index === 0) return;
      cy.wrap(checkbox).should(answers[index]);
    });
  });

  it("Should allow you to change answers between checkboxes and radio buttons", () => {
    cy.get("span").contains("Circle");
    cy.get("span").contains("Select Multiple").click();
    cy.get("input[id='Circle']");
  });

  it("Should allow you to create and remove questions", () => {
    cy.contains("Add Question").click();
    inputContains("question-name", "");
    cy.contains("Remove Question").click();
    inputContains("question-name", "Whathas exactly 4 lines of symmetry?");
  });

  it("Should save my changes when I click save", () => {
    changeInput("quiz-name", "Correct Quiz");
    changeInput("question-name", "What has 5 sides?");
    changeInput("new-answer", "Pentagon");
    cy.get("button").contains("＋").click();
    cy.get("span").contains("Select Multiple").click();
    cy.get("label[for='Pentagon']").click();
    cy.contains("Save Quiz").click();
    cy.contains("Correct Quiz").click();
    cy.contains("Take Quiz").click();
    cy.contains("What has 5 sides?");
    cy.get("label[for='Pentagon']").click();
    cy.contains("Check Answers").click();
    cy.contains("100%");
  });
});
