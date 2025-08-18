describe('P3 Design System & RTL', () => {
  beforeEach(() => {
    cy.visit('/dashboard');
  });

  it('should toggle language and apply RTL without flicker', () => {
    // Check initial English state
    cy.get('[data-testid="language-toggle"]').should('contain', 'EN');
    cy.get('html').should('have.attr', 'dir', 'ltr');
    
    // Toggle to Arabic
    cy.get('[data-testid="language-toggle"]').click();
    cy.get('[data-testid="ar-option"]').click();
    
    // Verify RTL applied
    cy.get('html').should('have.attr', 'dir', 'rtl');
    cy.get('html').should('have.attr', 'lang', 'ar');
    
    // Check for layout shift (should be minimal)
    cy.get('[data-testid="page-header"]').should('be.visible');
    
    // Toggle back to English
    cy.get('[data-testid="language-toggle"]').click();
    cy.get('[data-testid="en-option"]').click();
    
    cy.get('html').should('have.attr', 'dir', 'ltr');
    cy.get('html').should('have.attr', 'lang', 'en');
  });

  it('should display KPI stats with correct number formatting', () => {
    cy.get('[data-testid="kpi-stat"]').first().should('be.visible');
    cy.get('[data-testid="kpi-value"]').should('contain', '$');
    
    // Switch to Arabic and verify Western numerals are used
    cy.get('[data-testid="language-toggle"]').click();
    cy.get('[data-testid="ar-option"]').click();
    
    // Should still show Western numerals for finance
    cy.get('[data-testid="kpi-value"]').should('match', /[\d,.$]/);
  });

  it('should navigate projects page with keyboard only', () => {
    cy.visit('/projects');
    
    // Tab through key elements
    cy.get('body').tab();
    cy.focused().should('contain', 'Skip to content');
    
    cy.tab();
    cy.focused().should('have.attr', 'href', '/projects/new');
    
    // Test search input
    cy.get('[data-testid="project-search"]').focus().type('Solar');
  });

  it('should show empty state on projects page', () => {
    // Mock empty projects response
    cy.intercept('GET', '/api/projects', { fixture: 'empty-projects.json' }).as('getProjects');
    
    cy.visit('/projects');
    cy.wait('@getProjects');
    
    cy.get('[data-testid="empty-state"]').should('be.visible');
    cy.get('[data-testid="empty-state-title"]').should('contain', 'No projects yet');
    cy.get('[data-testid="empty-state-action"]').should('contain', 'Create First Project');
  });

  it('should collapse and expand right rail on model page', () => {
    cy.visit('/model?project=1');
    
    // Check initial state
    cy.get('[data-testid="right-rail"]').should('be.visible');
    cy.get('[data-testid="validation-content"]').should('be.visible');
    
    // Collapse
    cy.get('[data-testid="right-rail-toggle"]').click();
    cy.get('[data-testid="validation-content"]').should('not.be.visible');
    
    // Expand
    cy.get('[data-testid="right-rail-toggle"]').click();
    cy.get('[data-testid="validation-content"]').should('be.visible');
  });

  it('should be responsive on mobile viewport', () => {
    cy.viewport('iphone-x');
    
    cy.visit('/model?project=1');
    
    // Right rail should be collapsed on mobile
    cy.get('[data-testid="right-rail"]').should('not.be.visible');
    
    // Main content should be full width
    cy.get('[data-testid="model-content"]').should('be.visible');
  });
});