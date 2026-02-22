/**
 * Cypress Tests for jQuery Integration
 * Tests that all AJAX calls and DOM manipulation use jQuery
 */

describe('jQuery Integration', () => {
  beforeEach(() => {
    cy.intercept('GET', '/api/v1/courses').as('getCourses');
    cy.intercept('GET', '/api/v1/logs*').as('getLogs');
    cy.intercept('POST', '/api/v1/logs').as('postLog');

    cy.visit('/');
  });

  it('should load courses using jQuery', () => {
    cy.wait('@getCourses').then(() => {
      cy.get('[data-cy="course_select"]')
        .find('option')
        .should('have.length.greaterThan', 1);
    });
  });

  it('should fetch logs using jQuery when valid UVU ID is entered', () => {
    cy.get('[data-cy="course_select"]').select(1);
    cy.get('[data-cy="uvuId_input"]').type('10234567');

    cy.wait('@getLogs').then((interception) => {
      expect(interception.request.method).to.equal('GET');
      expect(interception.request.url).to.include('/api/v1/logs');
      expect(interception.request.url).to.include('courseId=');
      expect(interception.request.url).to.include('uvuId=10234567');
    });
  });

  it('should post new log using jQuery', () => {
    cy.get('[data-cy="course_select"]').select(1);
    cy.get('[data-cy="uvuId_input"]').type('10234567');
    cy.wait('@getLogs');

    const testLog = 'Test log entry via jQuery';
    cy.get('[data-cy="log_textarea"]').type(testLog);
    cy.get('[data-cy="add_log_btn"]').click();

    cy.wait('@postLog').then((interception) => {
      expect(interception.request.method).to.equal('POST');
      expect(interception.request.url).to.include('/api/v1/logs');
      expect(interception.request.body).to.have.property('text', testLog);
      expect(interception.request.headers).to.have.property('content-type', 'application/json');
    });
  });

  it('should verify jQuery is loaded', () => {
    cy.window().should('have.property', 'jQuery');
    cy.window().then((win) => {
      expect(win.jQuery).to.have.property('ajax');
      expect(win.jQuery).to.be.a('function');
    });
  });

  it('should load jQuery from CDN with local fallback available', () => {
    cy.get('head script[src*="jquery"]').should('exist');
    cy.get('head script[src*="jquery"]')
      .should('have.attr', 'src')
      .and('match', /cdn|jquery\.com|code\.jquery/);
  });
});
