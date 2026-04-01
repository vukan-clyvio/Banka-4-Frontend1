describe('Scenario 29: Pregled detalja kartice za Anu', () => {
    it('uloguje se, otvara kartice i klikće na detalje', () => {
        // 1) Login
cy.loginAsClientAna();
cy.visit('/dashboard');

        // 2) Navigacija na Kartice
        cy.get('nav, .navbar')
            .contains(/kartice|cards/i)
            .should('be.visible')
            .click();

        // 3) Klik na "Detalji kartice"
        // Umesto .within(), tražimo prvo dugme koje sadrži taj tekst na celoj stranici
        // Dodajemo force: true da "probijemo" bilo koji overlay
        cy.contains('button, a, span', /detalji kartice/i)
            .should('exist') // Prvo proverimo da li uopšte postoji u DOM-u
            .first()         // Uzimamo prvo ako ih ima više
            .click({ force: true });

        // 4) Verifikacija da su se detalji otvorili
        // Čekamo da se pojavi broj kartice u maskiranom formatu (npr. 1234 **** **** 1234)
        cy.contains(/\d{4}.*[\*xX].*\d{4}/, { timeout: 10000 })
            .should('be.visible');

        // Provera da li se pojavio CVV ili datum isteka (karakteristično za detalje)
        cy.contains(/cvv|kontrolni broj|važi do/i)
            .should('be.visible');
    });
});