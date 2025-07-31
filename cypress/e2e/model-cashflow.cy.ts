describe('Cash Flow Model', () => {
  beforeEach(() => {
    cy.login();
    cy.intercept('POST', '**/functions/v1/calculate', { 
      fixture: 'calc-result.json' 
    }).as('calculateScenario');
  });

  it('displays cash flow tab and calculations', () => {
    cy.visit('/feasly-model/test-project/test-scenario/cash-flow');
    
    // Check page loads
    cy.contains('Cash Flow Analysis').should('be.visible');
    
    // Wait for calculation
    cy.wait('@calculateScenario');
    
    // Verify chart renders
    cy.get('[data-testid="cashflow-chart"]').should('be.visible');
    
    // Verify table renders
    cy.get('[data-testid="cashflow-table"]').should('be.visible');
    
    // Test export functionality
    cy.get('[data-testid="export-csv-btn"]').click();
    cy.contains('Export CSV').click();
    
    // Verify KPIs display
    cy.contains('Net Present Value').should('be.visible');
    cy.contains('Internal Rate of Return').should('be.visible');
  });

  it('responsive on mobile', () => {
    cy.viewport(375, 667);
    cy.visit('/feasly-model/test-project/test-scenario/cash-flow');
    
    cy.wait('@calculateScenario');
    cy.get('[data-testid="cashflow-chart"]').should('be.visible');
  });

  it('responsive on desktop', () => {
    cy.viewport(1440, 900);
    cy.visit('/feasly-model/test-project/test-scenario/cash-flow');
    
    cy.wait('@calculateScenario');
    cy.get('[data-testid="cashflow-chart"]').should('be.visible');
  });
});