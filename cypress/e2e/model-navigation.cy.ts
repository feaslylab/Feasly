describe('Model Navigation V2', () => {
  beforeEach(() => {
    // Set feature flag and visit model page
    cy.window().then((win) => {
      win.localStorage.setItem('VITE_MODEL_V2', 'true');
    });
    cy.visit('/feasly-model?projectId=test-project-id');
  });

  context('Desktop Navigation', () => {
    beforeEach(() => {
      cy.viewport(1200, 800); // Desktop viewport
    });

    it('should display sidebar with all sections', () => {
      cy.get('[data-testid="desktop-sidenav"]').should('be.visible');
      cy.get('[data-testid="section-nav-item"]').should('have.length', 12);
    });

    it('should navigate to section when clicked', () => {
      cy.get('[data-testid="section-nav-item"][data-section="timeline"]').click();
      cy.get('#timeline').should('be.visible');
      cy.url().should('include', '#timeline');
    });

    it('should show correct status badges', () => {
      cy.get('[data-testid="section-status-badge"]').should('exist');
      cy.get('[data-testid="section-status-badge"]').first().should('contain', 'Pending');
    });

    it('should scroll to section when navigation item clicked', () => {
      cy.get('[data-testid="section-nav-item"][data-section="financial-inputs"]').click();
      cy.get('#financial-inputs').should('be.in.viewport');
    });
  });

  context('Mobile Navigation', () => {
    beforeEach(() => {
      cy.viewport(375, 667); // Mobile viewport
    });

    it('should show mobile tab bar', () => {
      cy.get('[data-testid="mobile-tab-bar"]').should('be.visible');
      cy.get('[data-testid="desktop-sidenav"]').should('not.exist');
    });

    it('should show floating action button', () => {
      cy.get('[data-testid="mobile-nav-fab"]').should('be.visible');
    });

    it('should open navigation sheet when FAB clicked', () => {
      cy.get('[data-testid="mobile-nav-fab"]').click();
      cy.get('[data-testid="mobile-nav-sheet"]').should('be.visible');
    });
  });

  context('Wizard Mode', () => {
    it('should toggle wizard mode', () => {
      cy.get('[data-testid="wizard-toggle"]').click();
      cy.get('[data-testid="wizard-navigation"]').should('be.visible');
    });

    it('should navigate through wizard steps', () => {
      cy.get('[data-testid="wizard-toggle"]').click();
      
      // Should start at first step
      cy.get('[data-testid="wizard-step-info"]').should('contain', 'Step 1 of 12');
      
      // Previous should be disabled
      cy.get('[data-testid="wizard-previous"]').should('be.disabled');
      
      // Fill required field to enable next
      cy.get('#project-metadata input[name="project_name"]').type('Test Project');
      
      // Next should be enabled
      cy.get('[data-testid="wizard-next"]').should('not.be.disabled');
      cy.get('[data-testid="wizard-next"]').click();
      
      // Should advance to step 2
      cy.get('[data-testid="wizard-step-info"]').should('contain', 'Step 2 of 12');
    });

    it('should prevent advancement without required fields', () => {
      cy.get('[data-testid="wizard-toggle"]').click();
      cy.get('[data-testid="wizard-next"]').should('be.disabled');
    });
  });

  context('Section Panels', () => {
    it('should expand section when clicked', () => {
      cy.get('[data-testid="section-panel"][data-section="timeline"]').within(() => {
        cy.get('[data-testid="panel-header"]').click();
        cy.get('[data-testid="panel-content"]').should('be.visible');
      });
    });

    it('should show proper aria attributes', () => {
      cy.get('[data-testid="panel-header"]').first().should('have.attr', 'aria-expanded');
      cy.get('[data-testid="panel-header"]').first().should('have.attr', 'role', 'button');
    });

    it('should handle keyboard navigation', () => {
      cy.get('[data-testid="panel-header"]').first().focus().type('{enter}');
      cy.get('[data-testid="panel-content"]').first().should('be.visible');
    });
  });

  context('Autosave Functionality', () => {
    it('should show save status in header', () => {
      cy.get('#project-metadata input[name="project_name"]').type('Test Project Name');
      cy.get('[data-testid="save-status"]').should('contain', 'Saved •');
    });

    it('should show save toast on first save', () => {
      cy.get('#project-metadata input[name="project_name"]').type('Test Project');
      cy.get('[data-testid="toast"]').should('contain', 'Scenario saved');
    });
  });

  context('Progress Indicators', () => {
    it('should show progress dots in navigation', () => {
      cy.get('[data-testid="progress-dot"]').should('have.length.greaterThan', 0);
    });

    it('should update progress when fields are filled', () => {
      cy.get('[data-testid="progress-dot"][data-section="project-metadata"]')
        .should('have.class', 'bg-muted-foreground/30'); // empty state
      
      cy.get('#project-metadata input[name="project_name"]').type('Test Project');
      cy.get('#project-metadata input[name="country"]').type('UAE');
      cy.get('#project-metadata select[name="currency_code"]').select('AED');
      
      cy.get('[data-testid="progress-dot"][data-section="project-metadata"]')
        .should('have.class', 'bg-success'); // completed state
    });
  });

  context('Feature Flag Fallback', () => {
    it('should show legacy UI when flag is disabled', () => {
      cy.window().then((win) => {
        win.localStorage.setItem('VITE_MODEL_V2', 'false');
      });
      cy.reload();
      
      // Should not see v2 components
      cy.get('[data-testid="desktop-sidenav"]').should('not.exist');
      cy.get('[data-testid="wizard-toggle"]').should('not.exist');
      
      // Should see legacy layout
      cy.get('.feasly-title').should('be.visible');
    });
  });
});