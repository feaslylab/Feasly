/**
 * Scenario CRUD End-to-End Tests
 * 
 * Tests the complete create → rename → delete flow for scenarios
 * on both mobile (375×667) and desktop (1440×900) viewports.
 * 
 * This is our core user flow that must never break.
 */

describe('Scenario CRUD Flow', () => {
  beforeEach(() => {
    // Mock authentication
    cy.window().its('localStorage').invoke('setItem', 'supabase.auth.token', JSON.stringify({
      access_token: 'mock-token',
      user: { 
        id: 'test-user',
        email: 'test@example.com',
        user_metadata: { full_name: 'Test User' }
      }
    }));

    // Mock API responses
    cy.intercept('GET', '**/rest/v1/projects**', { fixture: 'projects.json' }).as('getProjects');
    cy.intercept('GET', '**/rest/v1/scenarios**', { fixture: 'scenarios.json' }).as('getScenarios');
    cy.intercept('POST', '**/rest/v1/scenarios', { fixture: 'scenario-created.json' }).as('createScenario');
    cy.intercept('PATCH', '**/rest/v1/scenarios/**', { fixture: 'scenario-updated.json' }).as('updateScenario');
    cy.intercept('DELETE', '**/rest/v1/scenarios/**', {}).as('deleteScenario');
  });

  context('Mobile Viewport (375×667)', () => {
    beforeEach(() => {
      cy.viewport(375, 667);
      cy.visit('/feasly-model');
      cy.wait('@getProjects');
      cy.wait('@getScenarios');
    });

    it('should complete full CRUD flow on mobile', () => {
      // CREATE: Add new scenario
      cy.get('[data-testid="new-scenario-button"]').should('be.visible').click();
      cy.get('[data-testid="scenario-name-input"]').type('Mobile Test Scenario');
      cy.get('[data-testid="scenario-description-input"]').type('Test scenario created on mobile');
      cy.get('[data-testid="create-scenario-submit"]').click();
      
      cy.wait('@createScenario');
      cy.get('[data-testid="scenario-success-toast"]').should('be.visible');

      // RENAME: Edit scenario name
      cy.get('[data-testid="scenario-dropdown"]').click();
      cy.get('[data-testid="rename-scenario-option"]').click();
      cy.get('[data-testid="rename-input"]').clear().type('Mobile Test Scenario - Updated');
      cy.get('[data-testid="rename-submit"]').click();
      
      cy.wait('@updateScenario');
      cy.get('[data-testid="scenario-updated-toast"]').should('be.visible');

      // DELETE: Remove scenario
      cy.get('[data-testid="scenario-dropdown"]').click();
      cy.get('[data-testid="delete-scenario-option"]').click();
      cy.get('[data-testid="delete-confirm-button"]').click();
      
      cy.wait('@deleteScenario');
      cy.get('[data-testid="scenario-deleted-toast"]').should('be.visible');
    });

    it('should handle mobile-specific interactions', () => {
      // Test touch interactions and mobile menu behavior
      cy.get('[data-testid="mobile-menu-trigger"]').should('be.visible');
      cy.get('[data-testid="scenario-card"]').should('have.css', 'min-height').and('match', /44px|2.75rem/);
      
      // Test responsive layout
      cy.get('[data-testid="scenario-grid"]').should('have.class', 'grid-cols-1');
    });
  });

  context('Desktop Viewport (1440×900)', () => {
    beforeEach(() => {
      cy.viewport(1440, 900);
      cy.visit('/feasly-model');
      cy.wait('@getProjects');
      cy.wait('@getScenarios');
    });

    it('should complete full CRUD flow on desktop', () => {
      // CREATE: Add new scenario
      cy.get('[data-testid="new-scenario-button"]').click();
      cy.get('[data-testid="scenario-name-input"]').type('Desktop Test Scenario');
      cy.get('[data-testid="scenario-description-input"]').type('Test scenario created on desktop');
      cy.get('[data-testid="create-scenario-submit"]').click();
      
      cy.wait('@createScenario');
      cy.get('[data-testid="scenario-success-toast"]').should('be.visible');

      // RENAME: Edit scenario name  
      cy.get('[data-testid="scenario-card"]').trigger('mouseover');
      cy.get('[data-testid="quick-rename-button"]').should('be.visible').click();
      cy.get('[data-testid="inline-rename-input"]').clear().type('Desktop Test Scenario - Updated');
      cy.get('[data-testid="inline-rename-save"]').click();
      
      cy.wait('@updateScenario');

      // DELETE: Remove scenario
      cy.get('[data-testid="scenario-card"]').trigger('mouseover');
      cy.get('[data-testid="quick-delete-button"]').should('be.visible').click();
      cy.get('[data-testid="delete-confirm-dialog"]').should('be.visible');
      cy.get('[data-testid="delete-confirm-button"]').click();
      
      cy.wait('@deleteScenario');
    });

    it('should handle desktop-specific interactions', () => {
      // Test hover states and desktop-only features
      cy.get('[data-testid="scenario-card"]').trigger('mouseover');
      cy.get('[data-testid="quick-actions"]').should('be.visible');
      
      // Test keyboard navigation
      cy.get('[data-testid="scenario-card"]').focus();
      cy.get('body').type('{enter}');
      cy.url().should('include', '/scenario/');
      
      // Test responsive layout
      cy.get('[data-testid="scenario-grid"]').should('have.class', 'lg:grid-cols-3');
    });
  });

  context('Cross-browser compatibility', () => {
    it('should work consistently across viewport sizes', () => {
      const viewports = [
        { width: 375, height: 667, name: 'Mobile' },
        { width: 768, height: 1024, name: 'Tablet' },
        { width: 1440, height: 900, name: 'Desktop' }
      ];

      viewports.forEach(viewport => {
        cy.viewport(viewport.width, viewport.height);
        cy.visit('/feasly-model');
        
        // Core functionality should work on all sizes
        cy.get('[data-testid="new-scenario-button"]').should('be.visible');
        cy.get('[data-testid="scenario-grid"]').should('exist');
        
        // Test responsive behavior
        if (viewport.width < 768) {
          cy.get('[data-testid="mobile-layout"]').should('exist');
        } else {
          cy.get('[data-testid="desktop-layout"]').should('exist');
        }
      });
    });
  });

  context('Performance & Accessibility', () => {
    beforeEach(() => {
      cy.viewport(1440, 900);
      cy.visit('/feasly-model');
    });

    it('should meet performance standards', () => {
      // Test that interactions complete within reasonable time
      cy.get('[data-testid="new-scenario-button"]').click();
      cy.get('[data-testid="scenario-dialog"]', { timeout: 500 }).should('be.visible');
      
      // Test that there are no layout shifts during interactions
      cy.get('[data-testid="scenario-grid"]').should('have.css', 'min-height');
    });

    it('should be accessible via keyboard', () => {
      // Test tab navigation
      cy.get('body').tab();
      cy.focused().should('have.attr', 'data-testid', 'new-scenario-button');
      
      cy.tab();
      cy.focused().should('have.attr', 'data-testid').and('include', 'scenario');
      
      // Test ARIA labels
      cy.get('[data-testid="new-scenario-button"]').should('have.attr', 'aria-label');
      cy.get('[data-testid="scenario-card"]').should('have.attr', 'aria-label');
    });
  });
});