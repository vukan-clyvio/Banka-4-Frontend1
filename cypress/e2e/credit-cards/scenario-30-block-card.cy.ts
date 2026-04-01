describe('Scenario 30: Blokiranje kartice od strane klijenta', () => {
    it('uloguje se kao Ana, pronalazi aktivnu karticu i blokira je', () => {
        // 1) Login kao Ana
        cy.loginAsClientAna();
        cy.visit('/dashboard');

        // 2) Odlazak na sekciju "Kartice"
        cy.get('nav, .navbar')
            .contains(/kartice|cards/i)
            .should('be.visible')
            .click();

        // Provera da li smo na stranici sa karticama
        cy.location('pathname').should('include', '/cards');

        // 3) Klik na dugme
        // Umesto samo as('resultContainer'), dodajemo .click()
        cy.contains(/Blokiraj karticu/i)
            .should('be.visible')
            .click({ force: true }); // force: true je ovde ključan zbog tvog overlay-a

        // 4) Potvrda u malom meniju (ako se pojavi "Are you sure?")
        // Pošto ti uvek izađe onaj mali meni, moramo kliknuti i u njemu
        cy.get('body').then(($body) => {
            // Ako se pojavi dugme "Blokiraj" u tom novom malom meniju
            if ($body.find('button:contains("Blokiraj")').length > 0) {
                cy.get('button')
                    .contains(/blokiraj/i)
                    .last() // Uzimamo ono iz menija, ne iz tabele
                    .click({ force: true });
            }
        });

        // 5) Provera da je status promenjen
        cy.contains(/blokirana/i, { timeout: 10000 }).should('be.visible');
    });
});