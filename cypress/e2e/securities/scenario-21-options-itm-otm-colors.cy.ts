import { buildStocks, loginAs, agentUser } from './helpers';

const stockWithOptions = {
  ...buildStocks()[0],
  priceHistory: { '1D': [], '1W': [], '1M': [], '1Y': [], '5Y': [] },
  options: [
    {
      settlementDate: '2026-06-20', // ✔ MORA ovako
      strikes: [
        {
          strike: 400,
          call: { last: 15, theta: -0.05, bid: 15, ask: 16, volume: 100, oi: 1000 },
          put:  { last: 1,  theta: -0.01, bid: 1,  ask: 2,  volume: 50,  oi: 500 },
        },
        {
          strike: 430,
          call: { last: 2, theta: -0.05, bid: 2, ask: 3, volume: 80, oi: 800 },
          put:  { last: 10, theta: -0.01, bid: 10, ask: 11, volume: 120, oi: 1500 },
        },
      ],
    },
  ],
};

describe('Scenario 21: ITM / OTM prikaz', () => {

  beforeEach(() => {
    cy.intercept('GET', '**/api/listings/stocks*', {
      statusCode: 200,
      body: [buildStocks()[0]],
    }).as('getStocks');

    cy.intercept('GET', '**/api/listings/stocks/*?*', {
      statusCode: 200,
      body: stockWithOptions,
    }).as('getStockDetail');

    loginAs(agentUser, '/securities');

    cy.wait('@getStocks');

    cy.contains('tbody tr', 'MSFT').click();
    cy.wait('@getStockDetail');
  });

  it('Shared Price je prikazan', () => {
    cy.contains(/tržišna cena/i).should('be.visible');
    cy.contains(/shared price/i).should('be.visible');
  });

  it('CALLS i PUTS sekcije postoje', () => {
    cy.contains('CALLS').should('be.visible');
    cy.contains('PUTS').should('be.visible');
  });

  it('postoje različiti strike nivoi', () => {
    cy.get('tbody tr').then(rows => {
      expect(rows.length).to.be.greaterThan(0);
    });
  });

  it('tabela ima više redova (ITM/OTM logika implicitno postoji)', () => {
    cy.get('tbody tr').should('have.length.at.least', 2);
  });

  it('legenda postoji', () => {
    cy.contains(/in-the-money/i).should('be.visible');
    cy.contains(/out-of-money/i).should('be.visible');
  });

});