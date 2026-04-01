// cypress/e2e/cards/scenario-6-client-accounts-real.cy.ts
describe('Scenario 6: Pregled računa klijenta (real podaci)', () => {
    it('prikazuje aktivne račune i sortira ih po raspoloživom stanju', () => {
        cy.loginAsClient();
        cy.visit('/client/accounts');

        // Stranica učitana
        cy.contains(/moji računi|računi/i).should('be.visible');

        // Izaberi sortiranje: "Po raspoloživom stanju"
        cy.contains(/sortiraj račune/i)
            .parent()
            .find('select')
            .select('available');

        // Provera 1: prikazuju se samo aktivni (UI obično prikazuje status kao tekst/tag)
        // Ako imate tag "Aktivan"/"Neaktivan" ili status na kartici.
        cy.contains(/neaktivan|zatvoren|inactive|closed/i).should('not.exist');

        // Provera 2: sortiranje po raspoloživom stanju
        // Pošto ne znamo tačan DOM za iznose, najbezbolnije je:
        // - uzeti sve prikazane iznose (RSD/EUR/...) iz master liste
        // - parsirati brojeve i proveriti da je niz sortiran (desc ili asc).
        //
        // OVO TREBA prilagoditi selektoru na element koji prikazuje "raspoloživo stanje" na kartici.
        // Ako je kod vas na kartici prikazan samo "stanje", zameni selektor da gađa to polje.

    });
});