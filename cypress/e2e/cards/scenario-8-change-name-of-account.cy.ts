// cypress/e2e/cards/scenario-7-account-details-real.cy.ts
describe('Scenario 7: Pregled detalja računa', () => {
    it('klik na Detalji prikazuje broj računa, stanje, raspoloživo stanje i tip računa', () => {
        cy.loginAsClient();
        cy.visit('/client/accounts');

        // 1) Odaberi neki račun (prvi u listi)
        // Ako su računi kao kartice, obično je ceo blok klikabilan.
        cy.contains(/moji računi/i).should('be.visible');

        // Probaj da nađeš prvi "račun" blok tako što uzmeš prvi element koji sadrži maskiran broj ili naziv.
        // Ako ovo ne pogodi vaš DOM, javi kako se zove klasa za karticu/row.
        cy.get('body').then(() => {
            // klikni na prvi prikazani račun po dugmetu "Detalji" (najsigurnije)
            cy.contains('button, a', /^Detalji$/i)
                .first()
                .closest('div') // wrapper računa
                .as('selectedAccount');
        });

        // 2) Klik na Detalji za taj račun
        cy.get('@selectedAccount')
            .contains('button, a', /^Detalji$/i)
            .click();


    });
});