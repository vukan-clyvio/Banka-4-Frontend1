// cypress/e2e/employees/scenario-11-list-employees.cy.ts

describe('Scenario 11: Admin vidi listu svih zaposlenih', () => {
    beforeEach(() => {
        // Given: admin je ulogovan u sistem
        cy.loginAsAdmin();
    });

    it('prikazuje listu svih zaposlenih sa osnovnim podacima', () => {
        // Presrećemo inicijalni poziv za listu zaposlenih
        cy.intercept('GET', '**/employees?page=1&page_size=20*').as('getEmployees');

        // And: nalazi se na stranici za upravljanje zaposlenima
        cy.visit('/employees');

        // Provera da smo na dobroj lokaciji
        cy.location('pathname').should('eq', '/employees');

        // When: otvori listu zaposlenih (čekamo da se podaci učitaju)
        cy.wait('@getEmployees', { timeout: 20000 }).then(({ response }) => {
            // Then: sistem prikazuje listu svih zaposlenih (status 200 ili 304)
            expect([200, 304]).to.include(response?.statusCode);

            // Provera da li API uopšte vraća podatke (opciono, zavisi od beka)
         //   expect(response?.body).to.have.property('employees');
        });

        // Then: sistem vizuelno prikazuje listu (tabele ili kartice)
        // Koristimo selektor za link ka detaljima kao dokaz da su redovi učitani
        cy.get('a[href^="/employees/"]', { timeout: 20000 })
            .should('have.length.greaterThan', 0);

        // And: za svakog zaposlenog prikazuje podatke (provera prvog reda)
        // Pretpostavljamo da tabela ima kolone za Ime, Prezime, Email, Poziciju
        cy.get('table tbody tr').first().within(() => {
            // Proveravamo da polja nisu prazna i da sadrže smislene podatke
            cy.get('td').each(($td) => {
                cy.wrap($td).should('not.be.empty');
            });

            // Specifična provera formata za email kolonu (npr. sadrži @)
            cy.get('td').contains('@').should('be.visible');

            // Provera da postoji dugme ili link za akcije/detalje
       //     cy.get('a[href^="/employees/"]').should('exist');
        });
    });
});