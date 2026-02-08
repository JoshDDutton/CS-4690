// ***********************************************
// Custom Cypress commands for Student Logs app
// ***********************************************

/**
 * Custom command to check if element has specific theme
 */
Cypress.Commands.add('checkTheme', (theme) => {
  cy.get('html').should('have.attr', 'data-theme', theme);
});

/**
 * Custom command to clear localStorage
 */
Cypress.Commands.add('clearThemePreference', () => {
  cy.clearLocalStorage('theme');
});

/**
 * Custom command to set theme preference
 */
Cypress.Commands.add('setThemePreference', (theme) => {
  cy.window().then((win) => {
    win.localStorage.setItem('theme', theme);
  });
});

/**
 * Custom command to get localStorage item
 */
Cypress.Commands.add('getLocalStorage', (key) => {
  return cy.window().then((win) => {
    return win.localStorage.getItem(key);
  });
});

/**
 * Custom command to verify console logs
 */
Cypress.Commands.add('verifyConsoleLog', (message) => {
  cy.window().then((win) => {
    cy.spy(win.console, 'log');
  });
});
