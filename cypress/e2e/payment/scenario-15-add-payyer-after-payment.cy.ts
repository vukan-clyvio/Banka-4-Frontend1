// cypress/e2e/kt2/scenario-15-add-payee-after-payment.cy.ts
describe('Scenario 15: Dodavanje primaoca nakon uspešnog plaćanja (Stefan)', () => {
    it('dashboard -> Plaćanja -> Novo plaćanje -> Stefan -> 10 -> potvrdi -> Dodaj primaoca', () => {
        cy.loginAsClient();

        // 1) Dashboard
        cy.visit('/dashboard');
        cy.contains(/rafbank/i).should('be.visible');

        // 2) Navbar: Plaćanja -> Novo plaćanje
        cy.contains('button, a', /^Plaćanja$/i).click();
        cy.contains('button, a', /novo plaćanje/i).click();

        cy.location('pathname').should('eq', '/client/payments/new');

        // 3) Unesi primaoca Stefan
        cy.contains('label', /^primalac$/i)
            .parent()
            .find('input')
            .clear()
            .type('Stefan');

        // 4) Unesi broj računa primaoca
        cy.contains('label', /broj računa primaoca/i)
            .parent()
            .find('input')
            .clear()
            .type('444000129731255721');

        // 5) Iznos = 10
        cy.get('input[type="number"]').first().clear().type('10');

        // 6) Potvrdi (strelica / submit dugme)
        cy.get('form').first().within(() => {
            cy.get('button[type="submit"]').click();
        });



        cy.contains('button', /potvrdi plaćanje/i).click();

        cy.wait('@confirmPayment');

        // 8) Uspeh
        cy.contains(/uspešno|realizovano/i, { timeout: 20000 }).should('be.visible');

        // 9) Klik "Dodaj primaoca"
        cy.contains('button, a', /dodaj primaoca/i).should('be.visible').click();

        // 10) Provera da se pojavio u listi "Primaoci plaćanja"
        cy.visit('/client/recipients');
        cy.contains(/primaoci/i).should('be.visible');

        cy.contains(/^Stefan$/).should('be.visible');
        cy.contains('444000129731255721').should('be.visible');

        // 11) Provera da može da se koristi za buduća plaćanja
        cy.visit('/client/payments/new');

        cy.contains('label', /^primalac$/i)
            .parent()
            .find('input')
            .clear()
            .type('Stefan');

        // klik suggestion ako postoji
        cy.get('body').then(($b) => {
            if ($b.text().match(/Stefan/)) {
                cy.contains('button, a, li', /^Stefan$/).first().click({ force: true });
            }
        });

        // očekuj auto-popunu broja računa (ako UI tako radi)
        cy.contains('label', /broj računa primaoca/i)
            .parent()
            .find('input')
            .should('have.value', '444000129731255721');
    });

});