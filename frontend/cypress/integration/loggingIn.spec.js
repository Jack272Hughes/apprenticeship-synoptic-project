function attemptLogIn(
  username = "Username",
  password = "Hello123",
  buttonName = "Log In"
) {
  cy.get("input[name='username']").type(username, { force: true });
  cy.get("input[name='password']").type(password, { force: true });
  cy.contains(buttonName).click();
}

beforeEach(() => cy.visit("http://localhost:3000"));

describe("When signing up to the app it", () => {
  it("Should make a POST request to /signup", () => {
    cy.server();
    cy.route("POST", "/signup").as("signupRequest");
    attemptLogIn("username1", "password1", "Sign Up");
    cy.get("@signupRequest")
      .its("request.body")
      .should(formData => {
        expect(formData.get("username")).to.equal("username1");
        expect(formData.get("password")).to.equal("password1");
      });
  });

  it("Should allow you to sign up and log you in", () => {
    attemptLogIn("username2", "password2", "Sign Up");
    cy.contains("username2").should("exist");
  });

  it("Shouldn't allow you to sign up with a username that is in use", () => {
    attemptLogIn("username2", "password2", "Sign Up");
    cy.contains("Username is already in use").should("exist");
  });
});

describe("When logging into the app it", () => {
  it("Should make a POST request to /login", () => {
    cy.server();
    cy.route("POST", "/login").as("loginRequest");
    attemptLogIn();
    cy.get("@loginRequest")
      .its("request.body")
      .should(formData => {
        expect(formData.get("username")).to.equal("Username");
        expect(formData.get("password")).to.equal("Hello123");
      });
  });

  it("Should allow you to log in and display username", () => {
    attemptLogIn();
    cy.contains("Username").should("exist");
  });

  it("Should come up with an error when log in credentials are incorrect", () => {
    attemptLogIn("unknown", "password");
    cy.contains("Incorrect username/password").should("exist");
  });
});

describe("When logged into the app it", () => {
  it("Should allow you to log out", () => {
    attemptLogIn();
    cy.contains("Logout").click();
    cy.contains("Login").should("exist");
  });

  it("Should add a cookie with a jwt", () => {
    attemptLogIn();
    cy.getCookie("authToken")
      .should("have.property", "value")
      .then(value => expect(value).to.match(/eyJ.*?\.eyJ.*?\..*/));
  });

  it("Should display the navbar", () => {
    cy.get("[data-test-id='navbar']").should("not.exist");
    attemptLogIn();
    cy.get("[data-test-id='navbar']").should("exist");
  });
});
