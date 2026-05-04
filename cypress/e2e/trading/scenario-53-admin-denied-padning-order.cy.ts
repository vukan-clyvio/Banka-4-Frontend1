describe('Scenario 53: Supervizor odbija pending order', () => {

    it('Zaposleni Nikola kreira veliki nalog, a Admin ga odbija', () => {

        // --- 1. DEO: NIKOLA (Zaposleni/Agent) kreira nalog ---
        cy.loginAsNikola();

        // Idemo na berzu/trgovinu
        cy.contains(/Berza|Trgovina|Hartije/i).should('be.visible').click({ force: true });

        // Kupujemo prvu hartiju na listi
        cy.get('table tbody tr').first().within(() => {
            cy.contains('button', /Kupi|Buy/i).click({ force: true });
        });

        // Popunjavamo formu sa cifrom 1.111.111 da bi nalog bio PENDING
        cy.get('[class*="modalOverlay"]').should('be.visible').within(() => {
            // Unosimo veliku vrednost u polje za količinu ili ukupnu cenu
            cy.get('input').last().clear().type('1111111');
            cy.contains('button', /Potvrdi|Confirm/i).click({ force: true });
        });

        // Klik na X (iks) da zatvorimo potvrdu/notifikaciju
        cy.get('button').contains('✕').click({ force: true });

        // Čistimo sesiju pre logovanja admina da se ne pomešaju tokeni
        cy.clearCookies();
        cy.clearLocalStorage();


        // --- 2. DEO: ADMIN (Supervizor) odbija nalog ---
        cy.loginAsAdmin();

        // Putanja koju si tražila: Admin -> Navbar -> Orderi
        cy.url().should('include', '/admin');
        cy.get('nav').contains(/Orderi|Orders/i).should('be.visible').click({ force: true });

        // Provera da smo na stranici sa tabelom ordera
        cy.url().should('include', '/orders');

        // Tražimo red koji je PENDING i klikćemo na Decline
        // (To bi trebalo da bude onaj koji je Nikola upravo napravio)
        cy.get('table tbody tr').contains(/PENDING/i).first().closest('tr').within(() => {
            cy.contains(/Decline|Odbij/i).should('be.visible').click({ force: true });
        });

        // --- 3. VERIFIKACIJA ---
        // Potvrđujemo da je status u tabeli sada promenjen u DECLINED
        cy.get('table tbody tr').contains(/DECLINED/i).should('be.visible');
    });
});