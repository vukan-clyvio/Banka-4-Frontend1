import { visitEmployeeLogin, fillLoginForm, submitLogin } from '../../support/authHelpers';

describe('Scenario 31: Admin deblokira karticu klijentu Ana Anić', () => {
    it('Admin navigira kroz padajući meni i deblokira karticu Ani Anić', () => {
        // 1. LOGIN KAO ADMIN
        cy.intercept('POST', '**/auth/login').as('login');
        visitEmployeeLogin();
        fillLoginForm('admin@raf.rs', 'admin123');
        submitLogin();
        cy.wait('@login').its('response.statusCode').should('eq', 200);

        // 2. NAVIGACIJA KROZ PADUJUĆI MENI
        cy.get('nav, .navbar, .sidebar')
            .contains(/admin portali/i)
            .should('be.visible')
            .click();

        cy.contains(/računi i kartice/i)
            .should('be.visible')
            .click();

        // 3. PRONAĐI ANU I KLIKNI PRVI PUT (U TABELI)
        cy.contains('tr', 'ana.anic@example.com')
            .should('contain', 'Blokirana')
            .within(() => {
                cy.contains('button', /deblokiraj/i)
                    .should('be.visible')
                    .click({ force: true });
            });

        // 4. KLIKNI OPET DUGME DEBLOKIRAJ (U MINI MENIJU)
        // Koristimo cy.get('body') da izađemo iz prethodnog 'within' konteksta
        cy.get('body').within(() => {
            cy.get('button')
                .contains(/deblokiraj/i)
                .last()
                .should('be.visible')
                .click({ force: true });
        });


// 1. Prvi klik u tabeli (otvara prozorčić)
        cy.contains('tr', 'ana.anic@example.com').find('button').contains(/deblokiraj/i).click({ force: true });

// 2. TA JEDNA LINIJA koja pogađa dugme u prozorčiću
        cy.contains(/da li ste sigurni/i).closest('div').find('button').contains(/deblokiraj/i).click({ force: true });

// 3. Provera statusa
        cy.contains('tr', 'ana.anic@example.com', { timeout: 10000 }).should('contain', 'Aktivna');


    });
});