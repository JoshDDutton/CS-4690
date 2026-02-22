/**
 * Cypress Tests for Dark/Light Mode
 * Tests theme toggle, persistence, and preference detection
 */

describe('Dark/Light Mode', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.intercept('GET', '/api/v1/courses').as('getCourses');
  });

  describe('Theme Toggle UI', () => {
    it('should display theme toggle button', () => {
      cy.visit('/');
      cy.wait('@getCourses');
      cy.get('#themeToggle')
        .should('exist')
        .and('be.visible');
    });

    it('should have accessible label for theme toggle', () => {
      cy.visit('/');
      cy.wait('@getCourses');
      cy.get('#themeToggle')
        .should('have.attr', 'aria-label')
        .and('include', 'dark')
        .and('include', 'light');
    });

    it('should display theme icon (moon or sun)', () => {
      cy.visit('/');
      cy.wait('@getCourses');
      cy.get('#themeToggle .theme-icon')
        .should('exist')
        .and('be.visible')
        .invoke('text')
        .should('match', /🌙|☀️/);
    });
  });

  describe('Theme Switching', () => {
    it('should toggle from light to dark mode when clicked', () => {
      cy.visit('/', {
        onBeforeLoad(win) {
          cy.stub(win, 'matchMedia').returns({ matches: false });
        },
      });
      cy.wait('@getCourses');
      
      // Start in light mode (default)
      cy.get('html').invoke('attr', 'data-theme').should('equal', 'light');
      
      // Click toggle
      cy.get('#themeToggle').click();
      
      // Should be in dark mode
      cy.get('html').invoke('attr', 'data-theme').should('equal', 'dark');
      
      // Icon should change to sun
      cy.get('#themeToggle .theme-icon').invoke('text').should('equal', '☀️');
    });

    it('should toggle from dark to light mode when clicked twice', () => {
      cy.visit('/', {
        onBeforeLoad(win) {
          cy.stub(win, 'matchMedia').returns({ matches: false });
        },
      });
      cy.wait('@getCourses');
      
      // Toggle to dark
      cy.get('#themeToggle').click();
      cy.get('html').invoke('attr', 'data-theme').should('equal', 'dark');
      
      // Toggle back to light
      cy.get('#themeToggle').click();
      cy.get('html').invoke('attr', 'data-theme').should('equal', 'light');
      
      // Icon should change to moon
      cy.get('#themeToggle .theme-icon').invoke('text').should('equal', '🌙');
    });

    it('should apply different styles in dark mode', () => {
      cy.visit('/', {
        onBeforeLoad(win) {
          cy.stub(win, 'matchMedia').returns({ matches: false });
        },
      });
      cy.wait('@getCourses');
      
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
      cy.visit('/', {
        onBeforeLoad(win) {
          cy.stub(win, 'matchMedia').returns({ matches: false });
        },
      });
      cy.wait('@getCourses');
      
      // Toggle to dark mode
      cy.get('#themeToggle').click();
      
      // Check localStorage
      cy.getLocalStorage('theme').should('equal', 'dark');
    });

    it('should persist theme preference across page reloads', () => {
      cy.visit('/', {
        onBeforeLoad(win) {
          cy.stub(win, 'matchMedia').returns({ matches: false });
        },
      });
      cy.wait('@getCourses');
      
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
      cy.visit('/', {
        onBeforeLoad(win) {
          cy.stub(win, 'matchMedia').returns({ matches: false });
        },
      });
      cy.wait('@getCourses');
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
      cy.wait('@getCourses');
      
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
      cy.visit('/', {
        onBeforeLoad(win) {
          win.localStorage.setItem('theme', 'dark');
        },
      });
      cy.wait('@getCourses');
      
      cy.get('html').invoke('attr', 'data-theme').should('equal', 'dark');
    });

    it('should default to light mode when no preferences exist', () => {
      cy.visit('/', {
        onBeforeLoad(win) {
          win.matchMedia = cy.stub().returns({ matches: false });
        },
      });
      cy.wait('@getCourses');
      
      // Should default to light
      cy.get('html').invoke('attr', 'data-theme').should('equal', 'light');
    });
  });

  describe('Browser prefers-color-scheme Detection', () => {
    it('should detect and use browser dark mode preference', () => {
      cy.visit('/', {
        onBeforeLoad(win) {
          cy.stub(win, 'matchMedia')
            .withArgs('(prefers-color-scheme: dark)')
            .returns({ matches: true })
            .withArgs('(prefers-color-scheme: light)')
            .returns({ matches: false });
        },
      });
      cy.wait('@getCourses');
      
      cy.get('html').invoke('attr', 'data-theme').should('equal', 'dark');
    });

    it('should detect and use browser light mode preference', () => {
      cy.visit('/', {
        onBeforeLoad(win) {
          cy.stub(win, 'matchMedia')
            .withArgs('(prefers-color-scheme: dark)')
            .returns({ matches: false })
            .withArgs('(prefers-color-scheme: light)')
            .returns({ matches: true });
        },
      });
      cy.wait('@getCourses');
      
      cy.get('html').invoke('attr', 'data-theme').should('equal', 'light');
    });
  });

  describe('Theme Preference Priority', () => {
    it('should prioritize user preference over browser preference', () => {
      cy.visit('/', {
        onBeforeLoad(win) {
          win.localStorage.setItem('theme', 'light');
          cy.stub(win, 'matchMedia')
            .withArgs('(prefers-color-scheme: dark)')
            .returns({ matches: true });
        },
      });
      cy.wait('@getCourses');
      
      cy.get('html').invoke('attr', 'data-theme').should('equal', 'light');
    });
  });

  describe('Theme Visual Changes', () => {
    it('should change card background color in dark mode', () => {
      cy.visit('/', {
        onBeforeLoad(win) {
          cy.stub(win, 'matchMedia').returns({ matches: false });
        },
      });
      cy.wait('@getCourses');
      
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
      cy.visit('/', {
        onBeforeLoad(win) {
          cy.stub(win, 'matchMedia').returns({ matches: false });
        },
      });
      cy.wait('@getCourses');
      
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
