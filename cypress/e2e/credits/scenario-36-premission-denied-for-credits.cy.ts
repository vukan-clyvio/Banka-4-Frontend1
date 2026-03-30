import { visitEmployeeLogin, fillLoginForm, submitLogin } from '../../support/authHelpers';

describe('Scenario 35: Odobravanje kredita od strane zaposlenog', () => {
    it('Zaposleni pronalazi zahtev za kredit i odobrava ga', () => {
        cy.loginAsAdmin();
        cy.visit('/dashboard');


        // 2. NAVIGACIJA DO UPRAVLJANJA KREDITIMA
        // Klik na "Admin portali" pa na "Krediti" (ili direktno "Krediti" u sidebar-u)
        cy.get('nav, .navbar, .sidebar')
            .contains(/admin portali|krediti/i)
            .click();

        // Ako postoji podmeni za zahteve
        cy.contains(/kreditni zahtevi/i).click();

        // 3. PRONALAŽENJE ZAHTEVA KLIJENTA (npr. Ana Anić)
        // Tražimo red koji ima status "U obradi" ili "Na čekanju"
        cy.contains('tr', 'Marko')
            .should('contain', 'Na čekanju') // Provera početnog statusa
            .within(() => {
                // Klik na dugme "Pregledaj" ili direktno "Odobri" ako postoji u tabeli
                cy.get('button').contains(/odbij/i).click({ force: true });
            });

    });
});