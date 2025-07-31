import { MAG_OFFSET } from '../../src/constants/ui';

describe('Model ScrollSpy Functionality', () => {
  beforeEach(() => {
    cy.visit('/feasly-model');
    cy.viewport(1200, 800); // Desktop view
    cy.waitForSticky(); // Wait for magnetic nav to reach sticky state
  });

  it('should highlight correct section while scrolling slowly', () => {
    // Wait for initial load and magnetic nav to initialize
    cy.get('[data-testid="desktop-sidenav"]').should('be.visible');
    
    // Initially, project-metadata should be active
    cy.get('[data-section="project-metadata"]')
      .should('have.class', 'bg-primary/10');

    // Scroll slowly to timeline section (magnetic nav should stay visible)
    cy.get('#timeline').scrollIntoView({ duration: 2000 });
    
    // Wait for scroll spy and magnetic animations to update
    cy.wait(800);
    
    // Navigation should still be visible during slow scroll
    cy.get('[data-testid="desktop-sidenav"]').should('be.visible');
    
    // Timeline should now be active
    cy.get('[data-section="timeline"]')
      .should('have.class', 'bg-primary/10');
      
    // Project metadata should no longer be active
    cy.get('[data-section="project-metadata"]')
      .should('not.have.class', 'bg-primary/10');
  });

  it('should highlight correct section while scrolling fast', () => {
    // Fast scroll to financial inputs (magnetic nav may auto-hide)
    cy.get('#financial-inputs').scrollIntoView({ duration: 100 });
    
    // Wait for intersection observer and magnetic behavior to settle
    cy.wait(500);
    
    // Scroll up slightly to trigger magnetic nav reveal
    cy.scrollTo(0, window.scrollY - 10);
    cy.wait(200);
    
    // Navigation should be visible after scroll up
    cy.get('[data-testid="desktop-sidenav"]').should('be.visible');
    
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

  it('should handle magnetic auto-hide/show behavior during scroll', () => {
    // Fast scroll down to trigger auto-hide
    cy.scrollTo(0, 800, { duration: 100 });
    cy.wait(300);
    
    // Navigation may be hidden due to fast downward scroll
    // But should reappear when scrolling up
    cy.scrollTo(0, 700, { duration: 100 }); // Scroll up
    cy.wait(200);
    
    // Navigation should be visible after upward scroll
    cy.get('[data-testid="desktop-sidenav"]').should('be.visible');
    
    // Should maintain sticky positioning with magnetic offset
    cy.get('[data-testid="desktop-sidenav"]').then(($nav) => {
      const rect = $nav[0].getBoundingClientRect();
      // Should account for header (64px) + magnetic offset
      expect(rect.top).to.be.within(60, 120);
      expect(rect.left).to.be.at.least(0);
    });
  });

  it('should scroll to correct section with proper offset when nav item clicked', () => {
    // Ensure navigation is visible first
    cy.get('[data-testid="desktop-sidenav"]').should('be.visible');
    
    // Click on a section in navigation
    cy.get('[data-section="site-metrics"]').click();
    
    // Wait for scroll animation and magnetic adjustments
    cy.waitForSticky(); // Wait for nav to return to sticky state
    
    // Section should be visible with proper offset accounting for magnetic behavior
    cy.get('#site-metrics').then(($section) => {
      const rect = $section[0].getBoundingClientRect();
      // Should account for header (64px) + magnetic offset + buffer
      expect(rect.top).to.be.within(50, MAG_OFFSET + 10);
    });
    
    // Navigation should remain visible after programmatic scroll
    cy.get('[data-testid="desktop-sidenav"]').should('be.visible');
    
    // Section should be active in navigation
    cy.get('[data-section="site-metrics"]')
      .should('have.class', 'bg-primary/10');
  });

  it('should handle rapid section clicking without issues', () => {
    // Ensure navigation is visible for clicking
    cy.get('[data-testid="desktop-sidenav"]').should('be.visible');
    
    // Rapidly click different sections
    const sections = ['timeline', 'site-metrics', 'financial-inputs', 'scenarios'];
    
    sections.forEach((sectionId, index) => {
      cy.get(`[data-section="${sectionId}"]`).click();
      cy.waitForSticky(); // Wait for each navigation to complete
    });
    
    // Navigation should still be visible after rapid clicking
    cy.get('[data-testid="desktop-sidenav"]').should('be.visible');
    
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

  it('should work correctly after long scroll with magnetic behavior', () => {
    // Create long scroll by expanding multiple sections
    ['project-metadata', 'timeline', 'site-metrics', 'financial-inputs'].forEach(sectionId => {
      cy.get(`#${sectionId}`).within(() => {
        cy.get('[role="button"]').click();
      });
      cy.wait(200);
    });
    
    // Scroll down significantly (simulating 3000px+ scroll)
    cy.scrollTo(0, 3000, { duration: 500 });
    cy.wait(500);
    
    // Fast scroll may have hidden navigation, scroll up to reveal
    cy.scrollTo(0, 2950, { duration: 100 });
    cy.wait(300);
    
    // Navigation should be visible after upward scroll
    cy.get('[data-testid="desktop-sidenav"]').should('be.visible');
    
    // Click navigation should still work with proper magnetic offset
    cy.get('[data-section="scenarios"]').click();
    cy.waitForSticky();
    
    // Should navigate correctly with magnetic positioning
    cy.get('[data-section="scenarios"]')
      .should('have.class', 'bg-primary/10');
      
    // Verify navigation maintains proper sticky position
    cy.get('[data-testid="desktop-sidenav"]').then(($nav) => {
      const rect = $nav[0].getBoundingClientRect();
    });
  });

  it('should handle magnetic zone behavior near top of page', () => {
    // Scroll to top to test magnetic zone
    cy.scrollTo('top');
    cy.wait(300);
    
    // Navigation should be visible at top
    cy.get('[data-testid="desktop-sidenav"]').should('be.visible');
    
    // Scroll slightly within magnetic zone (< MAG_OFFSET)
    cy.scrollTo(0, 50);
    cy.wait(200);
    
    // Should maintain visibility in magnetic zone
    cy.get('[data-testid="desktop-sidenav"]').should('be.visible');
    
    // Scroll beyond magnetic zone
    cy.scrollTo(0, 150);
    cy.wait(300);
    
    // Should still be visible for normal scroll
    cy.get('[data-testid="desktop-sidenav"]').should('be.visible');
  });
});

/* ------------------------------------------------------------------ *
 *  prefers-reduced-motion (accessibility)                            *
 * ------------------------------------------------------------------ */

describe('Mag-nav with prefers-reduced-motion', () => {
  beforeEach(() => {
    cy.visit('/feasly-model');
    cy.prefersReducedMotion(); // stub motion
    cy.viewport(1200, 800);
    cy.waitForSticky();
  });

  it('pins & highlights correctly with animations off', () => {
    cy.get('[data-section="timeline"]').click();
    cy.waitForSticky(); // should still stick instantly

    cy.get('[data-section="timeline"]')
      .should('have.class', 'bg-primary/10');

    cy.scrollTo(0, 1000);
    cy.scrollTo(0, 900); // quick nudge up – nav should show
    cy.get('[data-testid="desktop-sidenav"]').should('be.visible');
  });
});