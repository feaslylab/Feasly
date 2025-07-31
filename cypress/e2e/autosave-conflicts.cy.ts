describe('Autosave Conflict Resolution', () => {
  beforeEach(() => {
    cy.visit('/feasly-model');
    cy.wait(1000);
  });

  it('should detect and resolve conflicts with overwrite option', () => {
    // Mock successful initial save
    cy.intercept('PATCH', '/api/models/*/draft', {
      statusCode: 200,
      body: { etag: 'initial-etag' }
    });

    // Make initial changes
    cy.get('[data-testid="project-name-input"]').clear().type('Initial Version');
    cy.wait(2000); // Wait for autosave

    // Mock conflict on commit
    cy.intercept('POST', '/api/models/*', {
      statusCode: 409,
      body: {
        serverData: { 
          project_name: 'Server Version',
          description: 'Server made changes'
        },
        localData: {
          project_name: 'Initial Version',
          description: ''
        },
        etag: 'server-etag'
      }
    }).as('conflictDetected');

    // Try to commit/publish
    cy.get('[data-testid="publish-button"]').click();

    // Should show conflict modal
    cy.wait('@conflictDetected');
    cy.get('[data-testid="conflict-modal"]').should('be.visible');
    cy.get('[data-testid="conflict-modal"]')
      .should('contain', 'Sync Conflict Detected')
      .and('contain', 'project_name');

    // Should show both versions
    cy.get('[data-testid="server-version"]').should('contain', 'Server Version');
    cy.get('[data-testid="local-version"]').should('contain', 'Initial Version');

    // Select overwrite option
    cy.get('[data-testid="overwrite-button"]').click();

    // Mock successful overwrite
    cy.intercept('POST', '/api/models/*', {
      statusCode: 200,
      body: { etag: 'overwrite-success', version: 2 }
    }).as('overwriteSuccess');

    // Confirm overwrite
    cy.get('[data-testid="confirm-overwrite"]').click();

    // Should close modal and show success
    cy.wait('@overwriteSuccess');
    cy.get('[data-testid="conflict-modal"]').should('not.exist');
    cy.get('[data-testid="save-indicator"]').should('contain', 'Saved');
  });

  it('should merge conflicts intelligently', () => {
    // Setup conflict scenario
    cy.intercept('POST', '/api/models/*', {
      statusCode: 409,
      body: {
        serverData: { 
          project_name: 'Server Project',
          description: 'Server description',
          land_cost: 1000000
        },
        localData: {
          project_name: 'Local Project',
          description: 'Local description',
          site_area_sqm: 5000
        },
        etag: 'conflict-etag'
      }
    });

    cy.get('[data-testid="publish-button"]').click();
    cy.get('[data-testid="conflict-modal"]').should('be.visible');

    // Select merge option
    cy.get('[data-testid="merge-button"]').click();

    // Mock successful merge
    cy.intercept('POST', '/api/models/*', {
      statusCode: 200,
      body: { etag: 'merge-success', version: 2 }
    }).as('mergeSuccess');

    // Confirm merge
    cy.get('[data-testid="confirm-merge"]').click();

    cy.wait('@mergeSuccess');
    cy.get('[data-testid="conflict-modal"]').should('not.exist');

    // Form should be updated with merged data
    cy.get('[data-testid="project-name-input"]').should('have.value', 'Local Project');
    cy.get('[data-testid="description-input"]').should('have.value', 'Local description');
  });

  it('should cancel conflict resolution and revert to server data', () => {
    cy.intercept('POST', '/api/models/*', {
      statusCode: 409,
      body: {
        serverData: { 
          project_name: 'Server Wins',
          description: 'Server description'
        },
        localData: {
          project_name: 'Local Changes',
          description: 'Local description'
        },
        etag: 'cancel-etag'
      }
    });

    cy.get('[data-testid="publish-button"]').click();
    cy.get('[data-testid="conflict-modal"]').should('be.visible');

    // Cancel the conflict
    cy.get('[data-testid="cancel-conflict"]').click();

    // Should close modal and revert form to server data
    cy.get('[data-testid="conflict-modal"]').should('not.exist');
    cy.get('[data-testid="project-name-input"]').should('have.value', 'Server Wins');
    cy.get('[data-testid="description-input"]').should('have.value', 'Server description');
  });

  it('should handle multiple concurrent conflicts', () => {
    // Simulate rapid conflicts
    let conflictCount = 0;
    
    cy.intercept('POST', '/api/models/*', (req) => {
      conflictCount++;
      if (conflictCount <= 2) {
        req.reply({
          statusCode: 409,
          body: {
            serverData: { project_name: `Server Version ${conflictCount}` },
            localData: { project_name: 'Local Version' },
            etag: `conflict-${conflictCount}`
          }
        });
      } else {
        req.reply({
          statusCode: 200,
          body: { etag: 'final-success', version: conflictCount }
        });
      }
    });

    // First conflict
    cy.get('[data-testid="publish-button"]').click();
    cy.get('[data-testid="conflict-modal"]').should('be.visible');
    cy.get('[data-testid="overwrite-button"]').click();
    cy.get('[data-testid="confirm-overwrite"]').click();

    // Second conflict should appear
    cy.get('[data-testid="conflict-modal"]').should('be.visible');
    cy.get('[data-testid="overwrite-button"]').click();
    cy.get('[data-testid="confirm-overwrite"]').click();

    // Third attempt should succeed
    cy.get('[data-testid="conflict-modal"]').should('not.exist');
    cy.get('[data-testid="save-indicator"]').should('contain', 'Saved');
  });
});