import { visitEmployeeLogin, fillLoginForm, submitLogin } from '../../support/authHelpers';

describe('Scenario 34: Pregled kredita klijenta', () => {
    it('Klijent vidi listu svojih kredita sortiranu po ukupnom iznosu', () => {
        // 1. LOGIN KAO KLIJENT
        cy.loginAsClientAna();
        cy.visit('/dashboard');

        // 2. OTVARANJE SEKCIJE "KREDITI"
        // Koristimo tvoj provjereni metod navigacije
        cy.get('nav, .navbar, .sidebar, aside')
            .contains(/krediti/i)
            .should('be.visible')
            .click();

        // 3. POTVRDA DA SE PRIKAZUJE LISTA (TABELA)
        // Provjeravamo da li tabela postoji i da li ima redova (tr)
        cy.get('table tbody tr').should('have.length.at.least', 1);

        // 4. PROVERA SORTIRANJA PO UKUPNOM IZNOSU
        // Pretpostavljamo da je iznos u jednoj od kolona (npr. treća kolona)
        // Uzimamo sve vrijednosti iz kolone za iznos
        let amounts: number[] = [];

        cy.get('table tbody tr td:nth-child(3)') // Promijeni broj 3 u indeks kolone gdje je iznos
            .each(($el) => {
                // Izvlačimo tekst, uklanjamo valutu (npr. "EUR" ili "RSD") i pretvaramo u broj
                const text = $el.text().replace(/[^0-9.-]+/g, "");
                amounts.push(parseFloat(text));
            })
            .then(() => {
                // Pravimo kopiju niza i sortiramo je (npr. opadajuće ili rastuće)
                // Ovdje provjeravamo da li je originalni niz identičan sortiranom nizu
                const sorted = [...amounts].sort((a, b) => b - a); // b - a za opadajuće (najveći prvi)
                expect(amounts).to.deep.equal(sorted);
            });

    });
});