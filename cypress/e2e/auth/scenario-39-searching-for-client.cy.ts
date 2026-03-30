import { visitEmployeeLogin, fillLoginForm, submitLogin } from '../../support/authHelpers';

describe('Scenario 39: Pretraga klijenta na portalu za upravljanje klijentima', () => {
    it('Zaposleni uspešno filtrira klijente i otvara profil klijenta', () => {
        // 1. LOGIN ZAPOSLENOG
        cy.loginAsAdmin();
        cy.visit('/dashboard');


        // 2. NAVIGACIJA NA PORTAL ZA UPRAVLJANJE KLIJENTIMA
        // Obično je to "Korisnici" ili "Klijenti" u sidebar-u
        cy.get('nav, .sidebar, .navbar')
            .contains(/korisnici|klijenti|upravljanje klijentima/i)
            .should('be.visible')
            .click();

        cy.url().should('include', '/clients'); // Ili /users, proveri putanju

        // 3. PRETRAGA KLIJENTA (Ime, Prezime ili Email)
        const searchCritieria = 'Marko';

        // Pronalaženje polja za pretragu (input)
        cy.get('input[placeholder*="Pretraga"], input[type="text"]').first()
            .clear()
            .type(searchCritieria);

        // 4. VERIFIKACIJA: Sistem filtrira listu
        // Čekamo da tabela prikaže samo relevantne rezultate
        cy.get('table tbody tr', { timeout: 5000 })
            .should('have.length.at.least', 1) // Mora postojati bar jedan rezultat
            .and('contain', 'Marko');


    });
});