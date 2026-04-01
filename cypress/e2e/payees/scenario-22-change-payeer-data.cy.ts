describe('Scenario 9: Izmena postojećeg primaoca u listi', () => {
    it('pronalazi Anu u listi, klikne na dugme izmeni pored nje i menja podatke u Mila', () => {
        cy.loginAsClient();

        // 1) Otvori stranicu gde se nalazi lista primalaca
        // Ako je to dashboard ili posebna stranica "Primaoci"
        cy.visit('/dashboard');

        // Pretpostavljamo da je potrebno kliknuti na "Novi primalac" da bi se videla lista/modal sa primaocima
        cy.contains('button, a', /\+\s*novi primalac/i).click();

        cy.contains('button, a', /izmeni/i).click();

        // 2) Pronađi red u kojem je "Ana" i klikni na dugme "Izmeni" koje je u tom istom redu

        // 3) Izmeni naziv primaoca u "Mila"
        cy.contains('label', /^naziv primaoca$/i)
            .parent()
            .find('input')
            .clear()
            .type('Mila');

        // 4) Izmeni broj računa
        cy.contains('label', /broj računa/i)
            .parent()
            .find('input')
            .clear()
            .type('444000127330072323');

        // 5) Klik na dugme "Potvrdi" da sačuvaš izmene
        cy.contains('button', /^potvrdi$/i).click();

        // 6) Provera: Da li je u listi sada Mila, a Ana više ne postoji
        cy.contains('Mila').should('be.visible');
        cy.contains('Ana').should('not.exist');
    });
});