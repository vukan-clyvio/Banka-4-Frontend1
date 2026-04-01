// cypress/e2e/employees/scenario-13-edit-2nd-employee-firstname.cy.ts
describe('Scenario 13: Admin menja podatke zaposlenog', () => {
    beforeEach(() => {
        cy.loginAsAdmin();
    });

    it('otvara zaposlenog Petar iz tabele, menja ime u "Milenko" i vraća se na listu', () => {
        cy.intercept('GET', '**/employees?page=1&page_size=20*').as('getEmployees');

        cy.visit('/employees');
        cy.wait('@getEmployees', { timeout: 20000 }).then(({ response }) => {
            expect([200, 304]).to.include(response?.statusCode);
        });

        cy.get('table', { timeout: 20000 }).should('be.visible');
        cy.get('table').contains('td', 'Petar')
            .should('be.visible')
            .parent('tr')
            .click({ force: true });

        cy.location('pathname', { timeout: 20000 }).should('match', /^\/employees\/\d+$/);

        cy.contains('button', 'Izmeni', { timeout: 20000 }).click();

        cy.intercept({ method: /PUT|PATCH/, url: '**/employees/*' }).as('updateEmployee');

        const newFirstName = 'Milenko';
        const newPhone = '0641234567';
        const newDepartment = 'HR';

        cy.contains('label', 'Ime').parent().find('input').clear().type(newFirstName);
        cy.contains('label', 'Telefon').parent().find('input').clear().type(newPhone);
        cy.contains('label', 'Departman').parent().find('input').clear().type(newDepartment);

        cy.contains('button[type="submit"]', 'Sačuvaj izmene').click();
        cy.wait('@updateEmployee', { timeout: 20000 });

        // Back to list via breadcrumb link "Zaposleni" (/employees)
        cy.intercept('GET', '**/employees?page=1&page_size=20*').as('getEmployeesAfterEdit');
        cy.contains('a', 'Zaposleni', { timeout: 20000 }).click();

        cy.location('pathname', { timeout: 20000 }).should('eq', '/employees');
        cy.wait('@getEmployeesAfterEdit', { timeout: 20000 });

        // Provera da se novo ime vidi u tabeli
        cy.get('table', { timeout: 20000 }).should('be.visible');
        cy.get('table').contains('td', newFirstName).should('be.visible');
    });
});