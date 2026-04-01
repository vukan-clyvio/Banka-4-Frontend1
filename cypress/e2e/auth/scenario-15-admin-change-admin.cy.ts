// cypress/e2e/employees/scenario-15-admin-edit-admin.cy.ts
import { fillInputByLabel, fillDateByLabel, selectByLabel,} from '../../support/formByLable';
import { visitEmployeeLogin, fillLoginForm, submitLogin } from '../../support/authHelpers';

describe('Scenario 15: Admin pokušava da izmeni drugog admina', () => {

    beforeEach(() => {
        // 1. Prijava kao glavni admin
        cy.intercept('POST', '**/auth/login').as('login');
        visitEmployeeLogin();
        fillLoginForm('admin@raf.rs', 'admin123');
        submitLogin();
        cy.wait('@login');
    });

    it('Sistem treba da blokira izmenu podataka drugog admina', () => {
        cy.visit('/employees');

        // 2. Pronalazimo admina koji se zove "Admin Novi" u tabeli
        // Koristimo email da nađemo red u tabeli
        cy.get('table').contains('td', 'adminnovi@raf.rs')
            .should('be.visible')
            .parent('tr')
            .find('td')
            .first()
            .click({ force: true });

        // 3. Proveravamo da li smo na profilu tog admina
        cy.url().should('match', /\/employees\/\d+$/);

        // 4. Klik na dugme "Izmeni"
        cy.contains('button', 'Izmeni').click();

        // 5. Pokušavamo da promenimo ime u "ADMIN PROMENJEN"
        // Pretpostavljamo da je name polje "firstName"
        fillInputByLabel('Ime', 'ADMIN PROMENJEN');

        // 6. Klik na dugme za čuvanje (Submit)
        cy.get('button[type="submit"]').click();

    });
});