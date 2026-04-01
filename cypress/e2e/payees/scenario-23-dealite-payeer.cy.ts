describe('Scenario 23: Brisanje primaoca plaćanja sa potvrdom', () => {
    it('pronalazi Anu u listi i potvrđuje brisanje u malom meniju', () => {
        cy.loginAsClient();
        cy.visit('/dashboard');

        // Otvaramo listu/modal sa primaocima
        cy.contains('button, a', /\+\s*novi primalac/i).click();

        // 1) Prvi klik na "Obriši" pored Ane u tabeli
        cy.contains('Ana')
            .closest('tr, div, .list-item')
            .find('button, a')
            .contains(/obriši/i)
            .click();

        // --- REŠENJE ZA MALI MENI ---

        // Čekamo da se overlay/meni pojavi
        // Koristimo klasu iz tvog errora (_modalOverlay_) da lociramo kontejner
        cy.get('div[class*="modalOverlay"], .modal, [role="dialog"]')
            .should('be.visible') // Čekamo da se skroz učita
            .within(() => {
                // .within komanda kaže Cypressu: "Sve što sledi traži SAMO unutar ovog menija"
                cy.contains('button', /obriši/i)
                    .should('be.visible')
                    .click({ force: true }); // Force klik za svaki slučaj
            });

        // Provera da je Ana nestala
        cy.contains('Ana', { timeout: 10000 }).should('not.exist');
    });
});