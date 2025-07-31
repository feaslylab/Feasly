describe('Scenario Comparison', () => {
  beforeEach(() => {
    cy.visit('/feasly-model/test-project-id/test-scenario-id/compare');
  });

  it('should load comparison page', () => {
    cy.contains('Scenario Comparison').should('be.visible');
  });

  it('should toggle between percentage and absolute deltas', () => {
    cy.get('[data-testid="delta-toggle"]').click();
    cy.contains('Absolute Change').should('be.visible');
  });

  it('should allow XLSX export', () => {
    cy.get('button').contains('Export XLSX').should('be.visible');
  });
});