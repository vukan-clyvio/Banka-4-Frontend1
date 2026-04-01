import { fillInputByLabel, fillDateByLabel, selectByLabel } from '../../support/formByLable';
import { fillLoginForm, submitLogin, visitEmployeeLogin } from '../../support/authHelpers';

describe('Feature 1 - Autentifikacija korisnika', () => {
    it('Scenario 8: Zaposleni aktivira nalog putem email linka', () => {
        // 1. Login kao admin i kreiraj novog zaposlenog
        cy.intercept('POST', '**/auth/login').as('login');
        visitEmployeeLogin();
        fillLoginForm('admin@raf.rs', 'admin123');
        submitLogin();
        cy.wait('@login').its('response.statusCode').should('eq', 200);

        cy.intercept('POST', '**/employees/register').as('registerEmployee');

        cy.visit('/employees/new');

        const ts = Date.now();
        const email = `e2e_act_${ts}@raf.rs`;

        fillInputByLabel('Ime', 'E2E');
        fillInputByLabel('Prezime', 'Activation');
        fillInputByLabel('Email adresa', email);
        fillInputByLabel('Broj telefona', '+381601234567');
        fillInputByLabel('Adresa', 'Bulevar Kralja Aleksandra 1');
        fillDateByLabel('Datum rođenja', '1999-01-01');
        selectByLabel('Pol', 'F');
        fillInputByLabel('ID Pozicije', '1');
        fillInputByLabel('Departman', 'IT');

        cy.contains('label', 'employee.view')
            .find('input[type="checkbox"]')
            .check({ force: true });

        fillInputByLabel('Username', `e2e${ts}`);

        cy.contains('button[type="submit"]', 'Kreiraj zaposlenog').click();

        cy.wait('@registerEmployee').then(({ response }) => {
            expect([200, 201]).to.include(response?.statusCode);
        });

        cy.url().should('include', '/employees');

        // 2. Dohvati aktivacioni link iz MailDev API-ja
        cy.request({
            method: 'GET',
            url: 'http://rafsi.davidovic.io:1080/email',
        }).then((res) => {
            const emails = res.body as any[];
            const mail = emails.find((m: any) =>
                m.to?.some((t: any) => t.address === email)
            );
            expect(mail, 'Email found for ' + email).to.not.be.undefined;

            const html = mail.html ?? mail.text ?? '';
            const match = html.match(/https?:\/\/[^\s"<]+activate[^\s"<]*/);
            expect(match, 'Activation link found in email').to.not.be.null;

            // Izvuci samo path+query iz linka (da ostanemo na localhost:5173)
            const url = new URL(match![0]);
            cy.visit(url.pathname + url.search);
        });

        // 4. Unesi lozinku u dva polja
        const newPassword = 'TestPass12';

        cy.intercept('POST', '**/auth/activate').as('activate');

        cy.get('#password').clear().type(newPassword);
        cy.get('#confirm').clear().type(newPassword);

        // 5. Aktiviraj nalog
        cy.contains('button', 'Aktiviraj nalog').click();

        cy.wait('@activate').then(({ response }) => {
            expect(response?.statusCode).to.eq(200);
        });

        // 6. Prikazuje poruku o uspešnoj aktivaciji
        cy.contains('Nalog je aktiviran').should('be.visible');

        // 7. Klik na "Idi na prijavu" i login sa novom lozinkom
        cy.contains('Idi na prijavu').click();
        cy.url().should('include', '/login');

        cy.intercept('POST', '**/auth/login').as('newLogin');
        visitEmployeeLogin();
        fillLoginForm(email, newPassword);
        submitLogin();

        cy.wait('@newLogin').its('response.statusCode').should('eq', 200);
    });
});
