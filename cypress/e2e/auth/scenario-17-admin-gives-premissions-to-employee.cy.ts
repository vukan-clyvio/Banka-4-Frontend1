// cypress/e2e/employees/scenario-17-assign-multiple-permissions.cy.ts

describe('Scenario 17: Admin dodeljuje permisije zaposlenom (Create & Delete)', () => {
    beforeEach(() => {
        cy.loginAsAdmin();
    });

    it('otvara 4. zaposlenog i dodeljuje permisije "Kreiranje zaposlenih" i "Brisanje zaposlenih"', () => {
        cy.intercept('GET', '**/employees?page=1&page_size=20*').as('getEmployees');

        cy.visit('/employees');
        cy.wait('@getEmployees', { timeout: 20000 }).then(({ response }) => {
            expect([200, 304]).to.include(response?.statusCode);
        });

        cy.get('table', { timeout: 20000 }).should('be.visible');

        // 4. mesto u tabeli (index 3)
        cy.get('table tbody tr', { timeout: 20000 })
            .should('have.length.greaterThan', 3)
            .eq(3)
            .click({ force: true });

        // Provera da smo na stranici detalja
        cy.location('pathname', { timeout: 20000 }).should('match', /^\/employees\/\d+$/);

        // Ulazak u mod za izmenu
        cy.contains('button', 'Izmeni', { timeout: 20000 }).click();

        // Definišemo labele koje tražimo
        const permCreate = 'Kreiranje zaposlenih'; // employee.create
        const permDelete = 'Brisanje zaposlenih';  // employee.delete

        // Helper funkcija za sigurno čekiranje (ako nije već čekirano)
        const ensureChecked = (label: string) => {
            cy.contains('label', label, { timeout: 20000 })
                .find('input[type="checkbox"]')
                .then($cb => {
                    if (!$cb.is(':checked')) {
                        cy.wrap($cb).check({ force: true });
                    }
                });
        };

        // 1. Čekiraj Kreiranje
        ensureChecked(permCreate);

        // 2. Čekiraj Brisanje
        ensureChecked(permDelete);

        // Presrećemo snimanje
        cy.intercept({ method: /PUT|PATCH/, url: '**/employees/*' }).as('updateEmployee');

        cy.contains('button[type="submit"]', 'Sačuvaj izmene').click();

    });
});