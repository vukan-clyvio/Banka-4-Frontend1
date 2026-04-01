describe('Scenario 16: Pregled istorije plaćanja - Menjačnica tab', () => {
    it('naviguje se na plaćanja, prebacuje na karticu menjačnica i filtrira', () => {
        // Given: klijent je ulogovan u aplikaciju
        cy.loginAsClient();
        cy.visit('/');

        // When: otvori sekciju “Plaćanja” preko Navbara
        cy.get('nav, .navbar, .menu')
            .contains(/plaćanja/i)
            .click();

        cy.contains(/pregled plaćanja/i)
            .click();

        // --- KLJUČNI KORAK: Prelazak na karticu (tab) Menjačnica ---
        // Tražimo tab/dugme unutar stranice koji služi za prebacivanje na menjačnicu
        cy.get('.tabs, .nav-tabs, div') // Selektor za kontejner tabova
            .contains(/menjačnica|exchange/i)
            .click();

        // Provera da je tab postao aktivan (opciono, npr. klasa 'active')
        cy.contains(/menjačnica/i).should('be.visible');

        // Then: prikazuje se lista svih izvršenih plaćanja/konverzija u menjačnici
        cy.get('table, .payment-list').should('be.visible');

        // And: moguće je filtriranje po datumu, iznosu i statusu transakcije

        // --- FILTRIRANJE PO DATUMU ---
        cy.contains('label', /datum|period/i)
            .parent()
            .find('input[type="date"]')
            .first()
            .type('2026-03-30');

        // --- FILTRIRANJE PO IZNOSU ---
        cy.contains('label', /iznos/i)
            .parent()
            .find('input[type="number"]')
            .clear()
            .type('10');

        // --- FILTRIRANJE PO STATUSU ---
        cy.contains('label', /status/i)
            .parent()
            .find('select')
            .as('statusSelect');

        cy.get('@statusSelect').find('option').then(($opts) => {
            expect($opts.length, 'Očekujem opcije za status').to.be.greaterThan(1);
            const statusValue = $opts[2].getAttribute('value');
            cy.get('@statusSelect').select(statusValue!);
        });

        // Klik na dugme za primenu filtera

    });
});