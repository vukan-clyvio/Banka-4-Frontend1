describe('Scenario 16: Pregled istorije plaćanja', () => {
    it('naviguje se kroz navbar i proverava filtere na pregledu plaćanja', () => {
        // Given: klijent je ulogovan u aplikaciju
        cy.loginAsClient();
        cy.visit('/'); // Počinjemo sa home page-a

        // When: otvori sekciju “Pregled plaćanja” preko Navbara
        // Prvo kliknemo na glavni meni "Plaćanja" (dropdown ili link u navbaru)
        cy.get('nav, .navbar, .menu') // Selektujemo navbar kontejner
            .contains(/plaćanja/i)
            .click();

        // Zatim kliknemo na pod-opciju "Pregled plaćanja"
        cy.contains(/pregled plaćanja/i)
            .click();

        // Provera da smo na dobroj stranici
        cy.location('pathname').should('include', 'payments');

        // Then: prikazuje se lista svih izvršenih plaćanja
        // Tražimo tabelu ili listu transakcija
        cy.get('table, .transaction-list, .payment-history').should('be.visible');

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
            // Provera da li postoje opcije (npr. Sve, Realizovano, Odbijeno, U obradi)
            expect($opts.length, 'Očekujem opcije za status transakcije').to.be.greaterThan(1);

            // Biramo opciju (npr. drugu po redu nakon placeholdera)
            const statusToSelect = $opts[2].getAttribute('value');
            cy.get('@statusSelect').select(statusToSelect!);
        });

        // Klik na dugme za filtriranje/pretragu
        cy.contains('button', /pretraži|filtriraj|primeni/i).click();

        // Finalna potvrda da tabela i dalje postoji i da nema grešaka na ekranu
        cy.get('table').should('exist');
        cy.contains(/greška|error/i).should('not.exist');
    });
});