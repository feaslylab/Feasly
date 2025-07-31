/// <reference types="cypress" />

declare global {
  namespace Cypress {
    interface Chainable {
      waitForSticky(): Chainable<void>;
      prefersReducedMotion(): Chainable<void>;
    }
  }
}

/* Wait until the nav has reached sticky state */
Cypress.Commands.add('waitForSticky', () =>
  cy
    .get('[data-testid="desktop-sidenav"]')
    .should('have.attr', 'data-is-sticky', 'true')
);

/* Simulate prefers-reduced-motion */
Cypress.Commands.add('prefersReducedMotion', () => {
  cy.window().then((win) => {
    // force matchMedia to return 'reduce'
    cy.stub(win, 'matchMedia').callsFake((query: string) => ({
      matches: query.includes('prefers-reduced-motion'),
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }));
  });
});