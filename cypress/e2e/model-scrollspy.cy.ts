describe('Model ScrollSpy Functionality', () => {
  beforeEach(() => {
    cy.visit('/feasly-model');
    cy.viewport(1200, 800); // Desktop view
  });

  it('should highlight correct section while scrolling slowly', () => {
    // Wait for initial load
    cy.get('[data-testid="desktop-sidenav"]').should('be.visible');
    
    // Initially, project-metadata should be active
    cy.get('[data-section="project-metadata"]')
      .should('have.class', 'bg-primary/10');

    // Scroll to timeline section
    cy.get('#timeline').scrollIntoView({ duration: 2000 });
    
    // Wait for scroll spy to update
    cy.wait(500);
    
    // Timeline should now be active
    cy.get('[data-section="timeline"]')
      .should('have.class', 'bg-primary/10');
      
    // Project metadata should no longer be active
    cy.get('[data-section="project-metadata"]')
      .should('not.have.class', 'bg-primary/10');
  });

  it('should highlight correct section while scrolling fast', () => {
    // Fast scroll to financial inputs
    cy.get('#financial-inputs').scrollIntoView({ duration: 100 });
    
    // Wait for intersection observer
    cy.wait(300);
    
    // Financial inputs should be active
    cy.get('[data-section="financial-inputs"]')
      .should('have.class', 'bg-primary/10');
  });

  it('should clear highlight when section is collapsed', () => {
    // Navigate to a section first
    cy.get('[data-section="timeline"]').click();
    
    // Section should be highlighted
    cy.get('[data-section="timeline"]')
      .should('have.class', 'bg-primary/10');
    
    // Collapse the section by clicking its header
    cy.get('#timeline').within(() => {
      cy.get('[role="button"]').click();
    });
    
    // Wait for collapse animation
    cy.wait(300);
    
    // The collapsed section should have data-collapsed attribute
    cy.get('#timeline').should('have.attr', 'data-collapsed', 'true');
    
    // Highlight should be cleared or moved to visible section
    cy.get('[data-section="timeline"]')
      .should('not.have.class', 'bg-primary/10');
  });

  it('should keep side navigation visible during long scroll', () => {
    // Scroll to the very bottom of the page
    cy.scrollTo('bottom', { duration: 1000 });
    
    // Wait for scroll to complete
    cy.wait(500);
    
    // Side navigation should still be visible
    cy.get('[data-testid="desktop-sidenav"]')
      .should('be.visible')
      .and('be.positioned'); // Should be on screen
    
    // Should be in the viewport
    cy.get('[data-testid="desktop-sidenav"]').then(($nav) => {
      const rect = $nav[0].getBoundingClientRect();
      expect(rect.top).to.be.at.least(0);
      expect(rect.left).to.be.at.least(0);
    });
  });

  it('should scroll to correct section with proper offset when nav item clicked', () => {
    // Click on a section in navigation
    cy.get('[data-section="site-metrics"]').click();
    
    // Wait for scroll animation
    cy.wait(1000);
    
    // Section should be visible with proper offset
    cy.get('#site-metrics').then(($section) => {
      const rect = $section[0].getBoundingClientRect();
      // Should be near top with some offset for header
      expect(rect.top).to.be.within(10, 100);
    });
    
    // Section should be active in navigation
    cy.get('[data-section="site-metrics"]')
      .should('have.class', 'bg-primary/10');
  });

  it('should handle rapid section clicking without issues', () => {
    // Rapidly click different sections
    const sections = ['timeline', 'site-metrics', 'financial-inputs', 'scenarios'];
    
    sections.forEach((sectionId, index) => {
      cy.get(`[data-section="${sectionId}"]`).click();
      cy.wait(200); // Small delay between clicks
    });
    
    // Wait for final scroll to complete
    cy.wait(1000);
    
    // Last clicked section should be active
    cy.get('[data-section="scenarios"]')
      .should('have.class', 'bg-primary/10');
  });

  it('should maintain performance during scroll with no observable jank', () => {
    // Performance test - scroll through all sections
    const startTime = Date.now();
    
    // Scroll through multiple sections quickly
    ['timeline', 'site-metrics', 'financial-inputs', 'scenarios'].forEach(sectionId => {
      cy.get(`#${sectionId}`).scrollIntoView({ duration: 300 });
      cy.wait(100);
    });
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    // Should complete in reasonable time (less than 5 seconds)
    expect(duration).to.be.lessThan(5000);
    
    // Navigation should still be responsive
    cy.get('[data-testid="desktop-sidenav"]').should('be.visible');
  });

  it('should handle edge case with no visible sections', () => {
    // Scroll to very top
    cy.scrollTo('top');
    
    // Wait for scroll spy to update
    cy.wait(500);
    
    // Some section should still be active (first one typically)
    cy.get('[data-section="project-metadata"]')
      .should('have.class', 'bg-primary/10');
  });

  it('should work correctly after 3000px scroll test', () => {
    // Create long scroll by expanding multiple sections
    ['project-metadata', 'timeline', 'site-metrics', 'financial-inputs'].forEach(sectionId => {
      cy.get(`#${sectionId}`).within(() => {
        cy.get('[role="button"]').click();
      });
      cy.wait(200);
    });
    
    // Scroll down significantly (simulating 3000px+ scroll)
    cy.scrollTo(0, 3000);
    cy.wait(500);
    
    // Navigation should still be visible and functional
    cy.get('[data-testid="desktop-sidenav"]').should('be.visible');
    
    // Click navigation should still work
    cy.get('[data-section="scenarios"]').click();
    cy.wait(1000);
    
    // Should navigate correctly
    cy.get('[data-section="scenarios"]')
      .should('have.class', 'bg-primary/10');
  });
});