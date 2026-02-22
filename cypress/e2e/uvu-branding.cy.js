/**
 * Cypress Tests for UVU Branding (Bootstrap-styled)
 * Tests UVU favicon, logo, and title - no custom CSS per project requirements
 */

describe('UVU Branding', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  describe('UVU Favicon', () => {
    it('should use UVU favicon from uvu.edu domain', () => {
      cy.get('head link[rel="icon"]')
        .should('have.attr', 'href')
        .and('include', 'uvu.edu')
        .and('include', 'favicon');
    });
  });

  describe('UVU Graphics', () => {
    it('should display UVU logo on the page', () => {
      cy.get('header img[src*="uvu"]')
        .should('exist')
        .and('be.visible')
        .and('have.attr', 'src')
        .and('include', 'uvu');
    });

    it('should have UVU logo with correct alt text', () => {
      cy.get('header img[src*="uvu"]')
        .should('have.attr', 'alt')
        .and('match', /UVU|Utah Valley University/);
    });
  });

  describe('Page Title', () => {
    it('should include UVU in page title', () => {
      cy.title().should('include', 'UVU');
    });

    it('should include Student Logs in title', () => {
      cy.title().should('include', 'Student Logs');
    });
  });

  describe('Bootstrap Styling', () => {
    it('should load Bootstrap CSS', () => {
      cy.get('head link[href*="bootstrap"]').should('exist');
    });

    it('should have Bootstrap container class', () => {
      cy.get('.container').should('exist');
    });

    it('should not have custom style.css', () => {
      cy.get('head link[href="style.css"]').should('not.exist');
    });
  });
});
