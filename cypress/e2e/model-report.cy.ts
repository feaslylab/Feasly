describe('PDF Report Generation', () => {
  beforeEach(() => {
    cy.visit('/feasly-model/test-project-id/test-scenario-id/results');
  });

  it('should have PDF generation button', () => {
    cy.get('button').contains('Generate PDF').should('be.visible');
  });

  it('should show generating state when clicked', () => {
    cy.get('button').contains('Generate PDF').click();
    cy.contains('Generating...').should('be.visible');
  });
});