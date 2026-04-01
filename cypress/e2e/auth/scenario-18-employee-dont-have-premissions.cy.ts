// cypress/e2e/employees/scenario-18-verify-empty-permissions.cy.ts

import { visitEmployeeLogin, fillLoginForm, submitLogin } from '../../support/authHelpers';
import { fillInputByLabel, fillDateByLabel, selectByLabel } from '../../support/formByLable';

describe('Scenario 18: Verifikacija praznih permisija za novog korisnika', () => {

    it('Kreira korisnika i ulazi u njegove detalje iz tabele', () => {
        // 1. Prijava na sistem
        cy.intercept('POST', '**/auth/login').as('login');
        visitEmployeeLogin();
        fillLoginForm('admin@raf.rs', 'admin123');
        submitLogin();
        cy.wait('@login');

        // 2. Odlazak direktno na formu za kreiranje
        cy.intercept('POST', '**/employees/register').as('registerEmployee');
        cy.visit('/employees/new');

        // Podaci za novog korisnika
        const ts = Date.now();
        const email = `nema_permisija_${ts}@raf.rs`;
        const ime = 'Novi';
        const prezime = 'Zaposleni';

        // 3. Popunjavanje forme (BEZ čekiranja permisija)
        fillInputByLabel('Ime', ime);
        fillInputByLabel('Prezime', prezime);
        fillInputByLabel('Email adresa', email);
        fillInputByLabel('Broj telefona', '+381601234567');
        fillInputByLabel('Adresa', 'Bulevar Kralja Aleksandra 1');
        fillDateByLabel('Datum rođenja', '1990-01-01');
        selectByLabel('Pol', 'M');
        fillInputByLabel('ID Pozicije', '1');
        fillInputByLabel('Departman', 'IT');
        fillInputByLabel('Username', `user${ts}`);

        // Klik na dugme za kreiranje
        cy.contains('button[type="submit"]', 'Kreiraj zaposlenog').click();

        // Čekamo da se registracija završi i da nas vrati na listu
        cy.wait('@registerEmployee');
        cy.url().should('include', '/employees');

        // 4. PRONALAŽENJE I ULAZAK U PROFIL
        // Čekamo da se tabela učita
        cy.get('table', { timeout: 10000 }).should('be.visible');

        // Tražimo red koji sadrži email našeg novog korisnika i klikćemo na njega
        cy.get('table tbody tr')
            .contains('td', email)
            .should('be.visible')
            .click({ force: true });

        // 5. PROVERA DETALJA (U VIEW MODU)
        // Proveravamo da li smo na stranici sa detaljima (/employees/ID)
        cy.location('pathname').should('match', /\/employees\/\d+$/);

        // Potvrđujemo da nema vizuelnih elemenata (tagova/čipova) koji predstavljaju permisije
        // Obično su to elementi sa klasom .p-chip, .badge ili .tag
        cy.get('body').within(() => {
            // Proveravamo sekciju gde bi trebalo da budu permisije
            // Ako nema nijednog taga, test prolazi
            cy.get('.p-chip, .badge, .tag, .permission-item').should('not.exist');
        });

    });
});