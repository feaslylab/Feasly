describe('Autosave Offline Functionality', () => {
  beforeEach(() => {
    cy.visit('/feasly-model');
    cy.wait(1000); // Allow component to mount
  });

  it('should queue saves when offline and process when back online', () => {
    // Simulate going offline
    cy.window().then((win) => {
      // Mock offline status
      cy.stub(win.navigator, 'onLine').value(false);
      
      // Trigger offline event
      win.dispatchEvent(new Event('offline'));
    });

    // Intercept API calls to simulate network failure
    cy.intercept('PATCH', '/api/models/*/draft', { forceNetworkError: true }).as('draftFailure');

    // Make changes to trigger autosave
    cy.get('[data-testid="project-name-input"]').clear().type('Offline Test Project');
    
    // Should show offline status
    cy.get('[data-testid="save-indicator"]')
      .should('contain', 'Offline')
      .and('contain', '1 queued');

    // Make another change
    cy.get('[data-testid="description-input"]').clear().type('This should be queued offline');
    
    // Should show increased queue count
    cy.get('[data-testid="save-indicator"]')
      .should('contain', 'queued');

    // Simulate coming back online
    cy.window().then((win) => {
      // Mock online status
      cy.stub(win.navigator, 'onLine').value(true);
      
      // Remove network error intercept
      cy.intercept('PATCH', '/api/models/*/draft', { 
        statusCode: 200, 
        body: { etag: 'success-etag' } 
      }).as('draftSuccess');
      
      // Trigger online event
      win.dispatchEvent(new Event('online'));
    });

    // Should process queue and show success
    cy.wait('@draftSuccess');
    cy.get('[data-testid="save-indicator"]')
      .should('contain', 'Saved')
      .and('not.contain', 'queued');
  });

  it('should persist data locally during offline mode', () => {
    // Go offline
    cy.window().then((win) => {
      cy.stub(win.navigator, 'onLine').value(false);
      win.dispatchEvent(new Event('offline'));
    });

    // Mock API failure
    cy.intercept('PATCH', '/api/models/*/draft', { forceNetworkError: true });

    // Make changes
    const testData = 'Persistent Offline Data';
    cy.get('[data-testid="project-name-input"]').clear().type(testData);

    // Reload page to simulate browser restart
    cy.reload();

    // Should restore data from IndexedDB
    cy.get('[data-testid="project-name-input"]').should('have.value', testData);
    cy.get('[data-testid="save-indicator"]').should('contain', 'queued');
  });

  it('should handle queue overflow gracefully', () => {
    // Go offline
    cy.window().then((win) => {
      cy.stub(win.navigator, 'onLine').value(false);
      win.dispatchEvent(new Event('offline'));
    });

    cy.intercept('PATCH', '/api/models/*/draft', { forceNetworkError: true });

    // Create many changes to overflow queue (assuming max queue size is 20)
    for (let i = 0; i < 25; i++) {
      cy.get('[data-testid="project-name-input"]')
        .clear()
        .type(`Overflow Test ${i}`);
      cy.wait(100); // Small delay to ensure each change is processed
    }

    // Should show queue overflow warning
    cy.get('.sonner-toast')
      .should('contain', 'Queue overflow')
      .and('contain', 'Dropped');

    // Queue should be capped at max size
    cy.get('[data-testid="save-indicator"]')
      .should('contain', 'queued');
  });
});