import { visitEmployeeLogin, fillLoginForm, submitLogin } from '../../support/authHelpers';

describe('Feature 1 - Autentifikacija korisnika', () => {
    it('Scenario 5: Zaključavanje naloga nakon više neuspešnih pokušaja', () => {
        cy.intercept('POST', '**/api/auth/login').as('login');

        visitEmployeeLogin();

        // Prvih 4 neuspešnih pokušaja
        for (let i = 0; i < 4; i++) {
            fillLoginForm('dimitrije@raf.rs', 'pogresna123');
            submitLogin();
            cy.wait('@login');
        }

        // 5. pokušaj - sistem zaključava nalog (polja mogu biti disabled)
        cy.get('#email').clear({ force: true }).type('dimitrije@raf.rs', { force: true });
        cy.get('#password').clear({ force: true }).type('pogresna123', { force: true, log: false });
        cy.contains('button', 'Prijavi se').click({ force: true });

        cy.wait('@login').then(({ response }) => {
            expect([401, 403]).to.include(response?.statusCode);
        });

        // Prikazuje poruku o zaključavanju
        cy.contains('privremeno blokiran').should('be.visible');

        // Korisnik ostaje na login stranici
        cy.url().should('include', '/login');

        // Token nije sačuvan
        cy.window().then((win) => {
            expect(win.localStorage.getItem('token')).to.be.null;
        });
    });
});
