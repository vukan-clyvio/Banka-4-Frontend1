import { fillInputByLabel } from '../../support/formByLable';

describe('Scenario 8: Direktna aktivacija sa poznatim tokenom', () => {

    it('Aktivira nalog koristeći ručno uneti token', () => {
        // 1. Token koji si izvukla iz MailHog-a
        const mojToken = '5de7be00c014311760953e4713f9366e';

        // 2. Formiramo pun URL i posećujemo ga
        // Cypress će automatski dodati tvoj localhost:5173 ispred
        cy.visit(`/activate?token=${mojToken}`);

        // 3. Provera da li se stranica učitala
        cy.url().should('include', '/activate');

        // Dajemo sekundu-dve da se forma iscrta
        cy.wait(2000);

        fillInputByLabel('Lozinka', 'SigurnaLozinka123!');
        fillInputByLabel('Potvrdi lozinku', 'SigurnaLozinka123!');

        // 5. Klik na dugme za potvrdu
        // Koristimo Regex da nađemo dugme bez obzira na tačan tekst
        cy.contains('button', /Aktiviraj|Potvrdi|Postavi/i)
            .should('not.be.disabled')
            .click({ force: true });


    });
});