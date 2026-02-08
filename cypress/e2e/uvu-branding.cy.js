/**
 * Cypress Tests for UVU Branding
 * Tests UVU colors, fonts, favicon, and graphics
 */

describe('UVU Branding', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  describe('UVU Colors', () => {
    it('should use UVU Green (#185c33) as primary color', () => {
      // Check CSS variables
      cy.get('html').then(($html) => {
        const styles = window.getComputedStyle($html[0]);
        const uvuGreen = styles.getPropertyValue('--uvu-green').trim();
        expect(uvuGreen).to.equal('#185c33');
      });
    });

    it('should have UVU color variables defined in CSS', () => {
      cy.get('html').then(($html) => {
        const styles = window.getComputedStyle($html[0]);
        
        // Check all UVU official colors are defined
        expect(styles.getPropertyValue('--uvu-green').trim()).to.not.be.empty;
        expect(styles.getPropertyValue('--uvu-silver').trim()).to.equal('#8e8c89');
        expect(styles.getPropertyValue('--uvu-white').trim()).to.equal('#ffffff');
        expect(styles.getPropertyValue('--uvu-black').trim()).to.equal('#000000');
      });
    });

    it('should apply UVU Green to header text', () => {
      cy.get('header h1').should('have.css', 'color')
        .and('match', /rgb\(24, 92, 51\)|#185c33/);
    });
  });

  describe('UVU Fonts', () => {
    it('should load Rajdhani font from Google Fonts CDN', () => {
      cy.get('head link[href*="fonts.googleapis.com"]')
        .should('exist')
        .and('have.attr', 'href')
        .and('include', 'Rajdhani');
    });

    it('should load Lato font from Google Fonts CDN', () => {
      cy.get('head link[href*="fonts.googleapis.com"]')
        .should('exist')
        .and('have.attr', 'href')
        .and('include', 'Lato');
    });

    it('should use Rajdhani for headers', () => {
      cy.get('header h1').should('have.css', 'font-family')
        .and('include', 'Rajdhani');
    });

    it('should use Lato or Arial for body text', () => {
      cy.get('body').should('have.css', 'font-family')
        .and('match', /Lato|Arial/);
    });
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
      cy.get('img.uvu-logo')
        .should('exist')
        .and('be.visible')
        .and('have.attr', 'src')
        .and('include', 'uvu');
    });

    it('should have alt text for UVU logo', () => {
      cy.get('img.uvu-logo')
        .should('have.attr', 'alt')
        .and('include', 'UVU');
    });

    it('should load UVU logo from official source', () => {
      cy.get('img.uvu-logo')
        .should('have.attr', 'src')
        .and('include', 'uvu.edu/_common/images/uvu-mono.svg');
    });
  });

  describe('UVU Design Guidelines', () => {
    it('should have generous spacing (padding) in main container', () => {
      cy.get('main').should('have.css', 'padding')
        .and('not.equal', '0px');
    });

    it('should use border radius for clean, modern design', () => {
      cy.get('main').should('have.css', 'border-radius')
        .and('not.equal', '0px');
    });

    it('should have consistent transitions for smooth UX', () => {
      cy.get('button[type="submit"]').should('have.css', 'transition')
        .and('not.equal', 'all 0s ease 0s');
    });
  });

  describe('Page Title', () => {
    it('should reference UVU in the title', () => {
      cy.title().should('include', 'UVU');
    });
  });
});
