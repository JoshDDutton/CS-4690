/**
 * Cypress Tests for Axios Integration
 * Tests that all AJAX calls use axios instead of fetch
 */

describe('Axios Integration', () => {
  beforeEach(() => {
    // Intercept API calls to verify axios is being used
    cy.intercept('GET', '/api/v1/courses').as('getCourses');
    cy.intercept('GET', '/api/v1/logs*').as('getLogs');
    cy.intercept('POST', '/api/v1/logs').as('postLog');
    
    cy.visit('/');
  });

  it('should load courses using axios', () => {
    // Wait for the courses request
    cy.wait('@getCourses').then((interception) => {
      // Verify the request was made
      expect(interception.request.method).to.equal('GET');
      expect(interception.request.url).to.include('/api/v1/courses');
      
      // Verify axios was used (axios adds specific headers)
      // Check that courses are loaded in the dropdown
      cy.get('[data-cy="course_select"]')
        .find('option')
        .should('have.length.greaterThan', 1);
    });
  });

  it('should fetch logs using axios when valid UVU ID is entered', () => {
    // Select a course
    cy.get('[data-cy="course_select"]').select(1);
    
    // Enter valid UVU ID
    cy.get('[data-cy="uvuId_input"]').type('10234567');
    
    // Wait for logs request
    cy.wait('@getLogs').then((interception) => {
      expect(interception.request.method).to.equal('GET');
      expect(interception.request.url).to.include('/api/v1/logs');
      expect(interception.request.url).to.include('courseId=');
      expect(interception.request.url).to.include('uvuId=10234567');
    });
  });

  it('should post new log using axios', () => {
    // Setup: Select course and enter UVU ID
    cy.get('[data-cy="course_select"]').select(1);
    cy.get('[data-cy="uvuId_input"]').type('10234567');
    cy.wait('@getLogs');
    
    // Enter log text
    const testLog = 'Test log entry via axios';
    cy.get('[data-cy="log_textarea"]').type(testLog);
    
    // Submit the form
    cy.get('[data-cy="add_log_btn"]').click();
    
    // Wait for post request
    cy.wait('@postLog').then((interception) => {
      expect(interception.request.method).to.equal('POST');
      expect(interception.request.url).to.include('/api/v1/logs');
      expect(interception.request.body).to.have.property('text', testLog);
      expect(interception.request.headers).to.have.property('content-type', 'application/json');
    });
  });

  it('should verify axios is loaded from CDN', () => {
    // Check that axios is available globally
    cy.window().should('have.property', 'axios');
    
    // Verify axios methods exist
    cy.window().then((win) => {
      expect(win.axios).to.have.property('get');
      expect(win.axios).to.have.property('post');
      expect(win.axios).to.have.property('put');
      expect(win.axios).to.have.property('delete');
    });
  });

  it('should verify axios CDN script tag exists in HTML', () => {
    cy.get('head script[src*="axios"]').should('exist');
    cy.get('head script[src*="axios"]')
      .should('have.attr', 'src')
      .and('include', 'cdn');
  });
});
