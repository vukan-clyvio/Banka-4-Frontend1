// cypress/e2e/kt2/scenario-9-successful-payment-real.cy.ts
describe('Scenario 9: Uspešno plaćanje drugom klijentu', () => {
    it('dodaje primaoca sa dashboarda i izvršava plaćanje', () => {
        cy.loginAsClient();

        // 1) Otvori dashboard
        cy.visit('/dashboard');

        // 2) Klik "+ Novi primalac"
        cy.contains('button, a', /\+\s*novi primalac/i).click();

        // 3) Na stranici/modalu gde je "Dodaj novog primaoca"
        // Unesi ime: Ana
        cy.contains('button, a', /\+\s*dodaj novog primaoca/i).click();

        cy.contains('label', /^naziv primaoca$/i)
            .parent()
            .find('input')
            .clear()
            .type('Ana');

        // Unesi broj računa primaoca: 444000116607821321
        cy.contains('label', /broj računa/i)
            .parent()
            .find('input')
            .clear()
            .type('444000116607821321');

        // Klik "Dodaj novog primaoca"
        // Klik na dugme "Potvrdi" (na formi)
        cy.contains('button', /^potvrdi$/i).click();

    });
});
