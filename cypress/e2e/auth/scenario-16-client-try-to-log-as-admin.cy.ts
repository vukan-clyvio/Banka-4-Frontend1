// cypress/e2e/auth/scenario-16-non-admin-access-admin-portal.cy.ts
import { visitEmployeeLogin, fillLoginForm, submitLogin } from "../../support/authHelpers";

describe("Scenario 16: Korisnik bez admin permisija pokušava pristup admin portalu", () => {
    it("Ana (bez admin permisija) ne može da pristupi /admin", () => {
        cy.intercept("POST", "**/auth/login").as("login");

        // 1) Login kao Ana
        visitEmployeeLogin();
        fillLoginForm("ana.anic@example.com", "password123");
        submitLogin();

        cy.wait("@login").its("response.statusCode").should("eq", 200);

        // 2) Pokušaj pristupa admin portalu
        cy.visit("/admin");

        // 3) Sistem odbija pristup: najrealnije je redirect (npr. /dashboard ili /login)
        cy.location("pathname", { timeout: 20000 }).should("not.eq", "/admin");

    });
});