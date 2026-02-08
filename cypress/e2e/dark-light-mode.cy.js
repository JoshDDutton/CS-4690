/**
 * Cypress Tests for Dark/Light Mode
 * Tests theme toggle, persistence, and preference detection
 */

describe('Dark/Light Mode', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    cy.clearLocalStorage();
  });

  describe('Theme Toggle UI', () => {
    it('should display theme toggle button', () => {
      cy.visit('/');
      cy.get('#themeToggle')
        .should('exist')
        .and('be.visible');
    });

    it('should have accessible label for theme toggle', () => {
      cy.visit('/');
      cy.get('#themeToggle')
        .should('have.attr', 'aria-label')
        .and('include', 'dark')
        .and('include', 'light');
    });

    it('should display theme icon (moon or sun)', () => {
      cy.visit('/');
      cy.get('#themeToggle .theme-icon')
        .should('exist')
        .and('be.visible')
        .invoke('text')
        .should('match', /🌙|☀️/);
    });
  });

  describe('Theme Switching', () => {
    it('should toggle from light to dark mode when clicked', () => {
      cy.visit('/');
      
      // Start in light mode (default)
      cy.get('html').should('have.attr', 'data-theme', 'light');
      
      // Click toggle
      cy.get('#themeToggle').click();
      
      // Should be in dark mode
      cy.get('html').should('have.attr', 'data-theme', 'dark');
      
      // Icon should change to sun
      cy.get('#themeToggle .theme-icon').invoke('text').should('equal', '☀️');
    });

    it('should toggle from dark to light mode when clicked twice', () => {
      cy.visit('/');
      
      // Toggle to dark
      cy.get('#themeToggle').click();
      cy.get('html').should('have.attr', 'data-theme', 'dark');
      
      // Toggle back to light
      cy.get('#themeToggle').click();
      cy.get('html').should('have.attr', 'data-theme', 'light');
      
      // Icon should change to moon
      cy.get('#themeToggle .theme-icon').invoke('text').should('equal', '🌙');
    });

    it('should apply different styles in dark mode', () => {
      cy.visit('/');
      
      // Get background color in light mode
      let lightBgColor;
      cy.get('body').then(($body) => {
        lightBgColor = $body.css('background-color');
      });
      
      // Toggle to dark mode
      cy.get('#themeToggle').click();
      
      // Background should be different in dark mode
      cy.get('body').should(($body) => {
        const darkBgColor = $body.css('background-color');
        expect(darkBgColor).to.not.equal(lightBgColor);
      });
    });
  });

  describe('Theme Persistence', () => {
    it('should save theme preference to localStorage', () => {
      cy.visit('/');
      
      // Toggle to dark mode
      cy.get('#themeToggle').click();
      
      // Check localStorage
      cy.getLocalStorage('theme').should('equal', 'dark');
    });

    it('should persist theme preference across page reloads', () => {
      cy.visit('/');
      
      // Toggle to dark mode
      cy.get('#themeToggle').click();
      cy.get('html').should('have.attr', 'data-theme', 'dark');
      
      // Reload page
      cy.reload();
      
      // Should still be in dark mode
      cy.get('html').should('have.attr', 'data-theme', 'dark');
      cy.get('#themeToggle .theme-icon').invoke('text').should('equal', '☀️');
    });

    it('should persist light theme preference', () => {
      // Set dark mode first
      cy.visit('/');
      cy.get('#themeToggle').click();
      cy.getLocalStorage('theme').should('equal', 'dark');
      
      // Toggle back to light
      cy.get('#themeToggle').click();
      cy.getLocalStorage('theme').should('equal', 'light');
      
      // Reload
      cy.reload();
      
      // Should still be light
      cy.get('html').should('have.attr', 'data-theme', 'light');
    });
  });

  describe('Theme Preference Detection', () => {
    it('should log user preference to console', () => {
      cy.visit('/', {
        onBeforeLoad(win) {
          cy.spy(win.console, 'log').as('consoleLog');
        },
      });
      
      cy.get('@consoleLog').should('be.calledWithMatch', /User Pref:/);
    });

    it('should log browser preference to console', () => {
      cy.visit('/', {
        onBeforeLoad(win) {
          cy.spy(win.console, 'log').as('consoleLog');
        },
      });
      
      cy.get('@consoleLog').should('be.calledWithMatch', /Browser Pref:/);
    });

    it('should log OS preference to console', () => {
      cy.visit('/', {
        onBeforeLoad(win) {
          cy.spy(win.console, 'log').as('consoleLog');
        },
      });
      
      cy.get('@consoleLog').should('be.calledWithMatch', /OS Pref:/);
    });

    it('should log all three preferences', () => {
      cy.visit('/', {
        onBeforeLoad(win) {
          cy.spy(win.console, 'log').as('consoleLog');
        },
      });
      
      // Verify all three preferences are logged
      cy.get('@consoleLog').then((log) => {
        const calls = log.getCalls().map(call => call.args[0]);
        const allLogs = calls.join(' ');
        
        expect(allLogs).to.match(/User Pref: (light|dark|unknown)/);
        expect(allLogs).to.match(/Browser Pref: (light|dark|unknown)/);
        expect(allLogs).to.match(/OS Pref: (light|dark|unknown)/);
      });
    });

    it('should use stored user preference when available', () => {
      // Set preference before visiting
      cy.window().then((win) => {
        win.localStorage.setItem('theme', 'dark');
      });
      
      cy.visit('/');
      
      // Should start in dark mode
      cy.get('html').should('have.attr', 'data-theme', 'dark');
    });

    it('should default to light mode when no preferences exist', () => {
      cy.visit('/', {
        onBeforeLoad(win) {
          // Mock matchMedia to return no preference
          win.matchMedia = cy.stub().returns({
            matches: false,
          });
        },
      });
      
      // Should default to light
      cy.get('html').should('have.attr', 'data-theme', 'light');
    });
  });

  describe('Browser prefers-color-scheme Detection', () => {
    it('should detect and use browser dark mode preference', () => {
      cy.visit('/', {
        onBeforeLoad(win) {
          // Mock prefers-color-scheme: dark
          cy.stub(win, 'matchMedia')
            .withArgs('(prefers-color-scheme: dark)')
            .returns({
              matches: true,
            })
            .withArgs('(prefers-color-scheme: light)')
            .returns({
              matches: false,
            });
        },
      });
      
      // Should start in dark mode (following browser preference)
      cy.get('html').should('have.attr', 'data-theme', 'dark');
    });

    it('should detect and use browser light mode preference', () => {
      cy.visit('/', {
        onBeforeLoad(win) {
          // Mock prefers-color-scheme: light
          cy.stub(win, 'matchMedia')
            .withArgs('(prefers-color-scheme: dark)')
            .returns({
              matches: false,
            })
            .withArgs('(prefers-color-scheme: light)')
            .returns({
              matches: true,
            });
        },
      });
      
      // Should start in light mode
      cy.get('html').should('have.attr', 'data-theme', 'light');
    });
  });

  describe('Theme Preference Priority', () => {
    it('should prioritize user preference over browser preference', () => {
      // Set user preference to light
      cy.window().then((win) => {
        win.localStorage.setItem('theme', 'light');
      });
      
      cy.visit('/', {
        onBeforeLoad(win) {
          // Mock browser preference as dark
          cy.stub(win, 'matchMedia')
            .withArgs('(prefers-color-scheme: dark)')
            .returns({
              matches: true,
            });
        },
      });
      
      // Should use user preference (light) not browser preference (dark)
      cy.get('html').should('have.attr', 'data-theme', 'light');
    });
  });

  describe('Theme Visual Changes', () => {
    it('should change card background color in dark mode', () => {
      cy.visit('/');
      
      let lightCardBg;
      cy.get('main').then(($main) => {
        lightCardBg = $main.css('background-color');
      });
      
      cy.get('#themeToggle').click();
      
      cy.get('main').should(($main) => {
        const darkCardBg = $main.css('background-color');
        expect(darkCardBg).to.not.equal(lightCardBg);
      });
    });

    it('should change text color in dark mode', () => {
      cy.visit('/');
      
      let lightTextColor;
      cy.get('body').then(($body) => {
        lightTextColor = $body.css('color');
      });
      
      cy.get('#themeToggle').click();
      
      cy.get('body').should(($body) => {
        const darkTextColor = $body.css('color');
        expect(darkTextColor).to.not.equal(lightTextColor);
      });
    });
  });
});
