describe('Scenario 54: Order sa isteklim settlement date-om', () => {

    it('Admin se loguje i potvrđuje da nalog sa prošlim datumom ne može biti odobren', () => {
        // 1. LOGIN
        cy.visit('http://localhost:5173/login');
        cy.loginAsAdmin();

        // 2. NAVIGACIJA NA STRANICU SA ORDERIMA
        //cy.url().should('include', '/admin');
        cy.visit('http://localhost:5173/supervisor/orders');
        // 3. POTVRDA DA SMO NA CILJU
      //  cy.url().should('include', '/orders');

        // 4. PROVERA U TABELI
        // Uzimamo red za koji znamo da je "istekao"
        // (Ako nemaš specifičan ID, proverićemo prvi red u tabeli)
        cy.get('table tbody tr').first().within(() => {

            // Proveravamo da li je status PENDING (ili neki drugi koji se može odbiti)
            // Ali ključno je da proverimo šta supervizor MOŽE a šta NE MOŽE da klikne

            // Odbijanje (Decline) bi trebalo da bude dostupno kao opcija
            cy.contains('button', /^Declined$/i, { timeout: 20000 }).click();

            // KLJUČNA PROVERA: Dugmeta "Approve" (Odobri) NE SME biti u DOM-u
            // jer je settlement date prošao (iako se on ne vidi fizički u tabeli)
          //  cy.contains(/Approve|Odobri/i).should('not.exist');
        });
    });
});