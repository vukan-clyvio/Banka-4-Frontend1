import './commands';


// cypress/support/index.d.ts
declare global {
    namespace Cypress {
        interface Chainable {
            loginAsClient(): Chainable<void>;
            loginAsAdmin(): Chainable<void>;
            loginAsClientAna(): Chainable<void>;
        }
    }
}
export {};

Cypress.Commands.add('loginAsAdmin', () => {
    const apiUrl = Cypress.env('API_URL');
    if (!apiUrl) throw new Error('Missing Cypress env API_URL');

    cy.session('admin', () => {
        cy.request('POST', `${apiUrl}/auth/login`, {
            email: 'admin@raf.rs',
            password: 'admin123',
        }).then((res) => {
            expect(res.status).to.eq(200);

            const { user, token, refresh_token } = res.body;

            window.localStorage.setItem('token', token);
            if (refresh_token) window.localStorage.setItem('refreshToken', refresh_token);
            else window.localStorage.removeItem('refreshToken');

            window.localStorage.setItem('user', JSON.stringify(user));
        });
    });
});

// cypress/support/commands.ts (ili commands.js)

Cypress.Commands.add('loginAsClient', () => {
    const apiUrl = Cypress.env('API_URL');
    if (!apiUrl) throw new Error('Missing Cypress env API_URL');

    cy.session('client', () => {
        cy.request('POST', `${apiUrl}/auth/login`, {
            email: 'marko.markovic@example.com',
            password: 'password123',
        }).then((res) => {
            expect(res.status).to.eq(200);

            const { user, token, refresh_token } = res.body;

            window.localStorage.setItem('token', token);

            if (refresh_token) window.localStorage.setItem('refreshToken', refresh_token);
            else window.localStorage.removeItem('refreshToken');

            window.localStorage.setItem('user', JSON.stringify(user));
        });
    });
});

Cypress.Commands.add('loginAsClientAna', () => {
    const apiUrl = Cypress.env('API_URL');
    if (!apiUrl) throw new Error('Missing Cypress env API_URL');

    cy.session('client', () => {
        cy.request('POST', `${apiUrl}/auth/login`, {
            email: 'ana.anic@example.com',
            password: 'password123',
        }).then((res) => {
            expect(res.status).to.eq(200);

            const { user, token, refresh_token } = res.body;

            window.localStorage.setItem('token', token);

            if (refresh_token) window.localStorage.setItem('refreshToken', refresh_token);
            else window.localStorage.removeItem('refreshToken');

            window.localStorage.setItem('user', JSON.stringify(user));
        });
    });
});