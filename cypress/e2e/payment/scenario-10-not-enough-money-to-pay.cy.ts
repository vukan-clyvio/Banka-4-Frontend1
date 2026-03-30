// cypress/e2e/kt2/scenario-quick-payment-from-dashboard.cy.js
describe('Brzo plaćanje sa dashboarda (Ana)', () => {
    it('klik na Ana -> Brzo plaćanje -> iznos 1 -> Nastavi', () => {
        cy.loginAsClient();

        // Dashboard
        cy.visit('/dashboard');

        // Klik na primaoca "Ana" (kartica/row u dashboard sekciji za primaoce)
        cy.contains(/^Ana$/).click();

        // Otvara se opcija / modal "Brzo plaćanje"
        cy.get('input[type="number"]').first().clear().type('1000000000000');

        // Klik "Nastavi"

        cy.get('button[type="submit"]').should('be.enabled').click();
        // (opciono) proveri da je otvoren sledeći korak (2FA ili potvrda)
    });
});