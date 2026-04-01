// cypress/e2e/kt2/scenario-12-transfer-fx-conversion.cy.ts
describe('Scenario 12: Plaćanje u različitim valutama uz konverziju (Transfer prozor)', () => {
    it('sa prvog računa prebacuje na drugi i radi konverziju + proviziju', () => {
        cy.loginAsClient();

        // Transfer prozor
        cy.visit('/transfers/new');
        cy.location('pathname').should('eq', '/transfers/new');

        // FROM = 1. račun u dropdown-u (posle placeholder-a)
        cy.contains('label', /izvorni račun/i)
            .parent()
            .find('select')
            .as('fromSelect');

        cy.get('@fromSelect').find('option').then(($opts) => {
            // option[0] je "Izaberi račun..."
            expect($opts.length, 'Očekujem bar 2 opcije u FROM select-u (placeholder + 1 račun)').to.be.greaterThan(1);
            const firstAccountValue = $opts[1].getAttribute('value');
            expect(firstAccountValue, 'FROM first account value').to.be.ok;
            cy.get('@fromSelect').select(firstAccountValue!);
        });

        // TO = 2. račun u dropdown-u (posle placeholder-a)
        cy.contains('label', /odredišni račun/i)
            .parent()
            .find('select')
            .as('toSelect');

        cy.get('@toSelect').find('option').then(($opts) => {
            expect($opts.length, 'Očekujem bar 3 opcije u TO select-u (placeholder + min 2 računa)').to.be.greaterThan(2);
            const secondAccountValue = $opts[2].getAttribute('value'); // placeholder(0), prvi(1), drugi(2)
            expect(secondAccountValue, 'TO second account value').to.be.ok;
            cy.get('@toSelect').select(secondAccountValue!);
        });

        // Iznos = 50
        cy.contains('label', /^iznos/i)
            .parent()
            .find('input[type="number"]')
            .clear()
            .type('50');

        // Nastavi (ako dugme nema tekst, ovo neće raditi — vidi napomenu ispod)
        cy.contains('button', /nastavi|dalje/i).click();

        // Potvrda transfera
        cy.location('pathname').should('eq', '/transfers/confirm');

        // Cross-currency očekivanja (ako su valute različite, mora postojati info o kursu/proviziji)
        cy.contains(/kurs|prodajni/i).should('be.visible');
        cy.contains(/proviz/i).should('be.visible');

        // Potvrdi
        cy.contains('button', /potvrdi|izvrši/i).click();

        // Uspeh
        cy.contains(/uspešno|success/i, { timeout: 20000 }).should('be.visible');
    });
});