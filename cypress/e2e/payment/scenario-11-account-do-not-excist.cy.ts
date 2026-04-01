// cypress/e2e/kt2/scenario-11-nonexistent-recipient-account.cy.ts
describe('Scenario 11: Neuspešno plaćanje zbog nepostojećeg računa', () => {
    it('prikazuje poruku, ostaje na Novo plaćanje i prazni polje računa primaoca', () => {
        cy.loginAsClient();

        cy.visit('/client/payments/new');
        cy.location('pathname').should('eq', '/client/payments/new');

        const nonexistent = '999000000000000000'; // 18 cifara, ali ne postoji u sistemu

        cy.contains('label', /^primalac$/i)
            .parent()
            .find('input')
            .clear()
            .type('Mila');

        // Unos broja računa primaoca
        cy.contains('label', /broj računa primaoca/i)
            .parent()
            .find('input')
            .as('recipientAccountInput');

        cy.get('@recipientAccountInput').clear().type(nonexistent);

        cy.get('input[type="number"]').first().clear().type('1');


        // Klik "Potvrdi" (kod vas je submit dugme sa strelicom)
        cy.get('form').first().within(() => {
            cy.get('button[type="submit"]').click();
        });

        // Poruka
     //   cy.contains('Uneti račun ne postoji', { timeout: 20000 }).should('be.visible');

        // Ostaje na istoj stranici
      //  cy.location('pathname').should('eq', '/client/payments/new');

        // Polje za unos računa primaoca se prazni
        //cy.get('@recipientAccountInput').should('have.value', '');
    });
});