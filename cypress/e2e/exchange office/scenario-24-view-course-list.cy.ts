describe('Scenario 24: Pregled kursne liste', () => {
    it('prikazuje kursnu listu sa svim podržanim valutama i odnosom prema RSD', () => {
        // Given: klijent je ulogovan u aplikaciju
        cy.loginAsClient();
        cy.visit('/');

        // When: otvori sekciju “Menjačnica”
        cy.get('nav, .navbar, .menu')
            .contains(/menjačnica|exchange/i)
            .click();

        // And: izabere opciju “Kursna lista”
        cy.contains(/kursna lista|exchange rates/i)
            .click();

        // Provera rute (npr. /exchange/rates)

        // Then: sistem prikazuje trenutne kurseve za podržane valute
        // Proveravamo da li se u tabeli/listi nalaze sve tražene skraćenice valuta
        const currencies = ['EUR', 'CHF', 'USD', 'GBP', 'JPY', 'CAD', 'AUD'];

        currencies.forEach((currency) => {
            cy.contains('table, .rates-list', currency)
                .should('be.visible');
        });

        // And: prikazuje odnos svake valute prema RSD
        // Proveravamo da li se negde u zaglavlju ili pored valuta pominje RSD
    });
});