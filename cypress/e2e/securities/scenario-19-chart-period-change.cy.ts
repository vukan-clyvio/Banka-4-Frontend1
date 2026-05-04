import { buildStocks, loginAs, agentUser } from './helpers';

describe('Scenario 19: Promena perioda na grafiku menja prikazane podatke', () => {
  beforeEach(() => {
    const stocks = buildStocks();

    cy.intercept('GET', '**/api/listings/stocks*', {
      statusCode: 200,
      body: stocks,
    }).as('getStocks');

    cy.intercept('GET', `**/api/listings/stocks/${stocks[0].listing_id}`, {
      statusCode: 200,
      body: {
        ...stocks[0],
        priceHistory: {
          '1D': [{ t: 1, v: 410 }, { t: 2, v: 415 }],
          '1W': [{ t: 1, v: 400 }, { t: 2, v: 420 }],
          '1M': [{ t: 1, v: 380 }, { t: 2, v: 415 }],
          '1Y': [{ t: 1, v: 300 }, { t: 2, v: 415 }],
          '5Y': [{ t: 1, v: 100 }, { t: 2, v: 415 }],
        },
      },
    }).as('getStockDetail');

    loginAs(agentUser, '/securities');
    cy.wait('@getStocks');

    cy.contains('tbody tr', 'MSFT').click();
    cy.wait('@getStockDetail');
  });

  it('periodi su vidljivi', () => {
    cy.contains('button', '1D').should('be.visible');
    cy.contains('button', '1W').should('be.visible');
    cy.contains('button', '1M').should('be.visible');
    cy.contains('button', '1Y').should('be.visible');
    cy.contains('button', '5Y').should('be.visible');
  });

  it('korisnik može da menja periode', () => {
    cy.contains('button', '1W').click();
    cy.contains('button', '1M').click();
    cy.contains('button', '1Y').click();
    cy.contains('button', '5Y').click();
    cy.contains('button', '1D').click();
  });
});