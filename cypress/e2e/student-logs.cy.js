/**
 * Cypress Tests for Student Logs Core Functionality
 * Tests the original features still work with new Axios and UVU branding
 */

describe('Student Logs - Core Functionality', () => {
  beforeEach(() => {
    cy.intercept('GET', '/api/v1/courses').as('getCourses');
    cy.intercept('GET', '/api/v1/logs*').as('getLogs');
    cy.intercept('POST', '/api/v1/logs').as('postLog');
    
    cy.visit('/');
    cy.wait('@getCourses');
  });

  describe('Page Load and Initial State', () => {
    it('should load the page successfully', () => {
      cy.title().should('include', 'Student Logs');
    });

    it('should display the header', () => {
      cy.get('header h1').should('contain', 'Student Logs');
    });

    it('should load courses in dropdown', () => {
      cy.get('[data-cy="course_select"]')
        .find('option')
        .should('have.length.greaterThan', 1);
    });

    it('should have "Choose Courses" as default option', () => {
      cy.get('[data-cy="course_select"]')
        .find('option:selected')
        .should('have.text', 'Choose Courses');
    });

    it('should not show UVU ID section initially', () => {
      cy.get('#uvuIdSection').should('not.be.visible');
    });

    it('should not show logs section initially', () => {
      cy.get('#logsSection').should('not.be.visible');
    });
  });

  describe('Course Selection', () => {
    it('should show UVU ID input when course is selected', () => {
      cy.get('[data-cy="course_select"]').select(1);
      cy.get('#uvuIdSection').should('be.visible');
      cy.get('[data-cy="uvuId_input"]').should('be.visible');
    });

    it('should hide UVU ID input when course is deselected', () => {
      cy.get('[data-cy="course_select"]').select(1);
      cy.get('#uvuIdSection').should('be.visible');
      
      cy.get('[data-cy="course_select"]').select('Choose Courses');
      cy.get('#uvuIdSection').should('not.be.visible');
    });

    it('should focus on UVU ID input after selecting course', () => {
      cy.get('[data-cy="course_select"]').select(1);
      cy.get('[data-cy="uvuId_input"]').should('have.focus');
    });
  });

  describe('UVU ID Input Validation', () => {
    beforeEach(() => {
      cy.get('[data-cy="course_select"]').select(1);
    });

    it('should have placeholder text "10234567"', () => {
      cy.get('[data-cy="uvuId_input"]')
        .should('have.attr', 'placeholder', '10234567');
    });

    it('should have maxlength of 8', () => {
      cy.get('[data-cy="uvuId_input"]')
        .should('have.attr', 'maxlength', '8');
    });

    it('should accept numeric input', () => {
      cy.get('[data-cy="uvuId_input"]').type('12345678');
      cy.get('[data-cy="uvuId_input"]').should('have.value', '12345678');
    });

    it('should strip non-numeric characters', () => {
      cy.get('[data-cy="uvuId_input"]').type('123abc456def78');
      cy.get('[data-cy="uvuId_input"]').should('have.value', '12345678');
    });

    it('should not exceed 8 characters', () => {
      cy.get('[data-cy="uvuId_input"]').type('123456789012345');
      cy.get('[data-cy="uvuId_input"]')
        .invoke('val')
        .should('have.length', 8);
    });

    it('should fetch logs when exactly 8 digits are entered', () => {
      cy.get('[data-cy="uvuId_input"]').type('10234567');
      cy.wait('@getLogs');
      cy.get('#logsSection').should('be.visible');
    });

    it('should not fetch logs with less than 8 digits', () => {
      cy.get('[data-cy="uvuId_input"]').type('1234567');
      cy.get('#logsSection').should('not.be.visible');
    });
  });

  describe('Logs Display', () => {
    beforeEach(() => {
      cy.get('[data-cy="course_select"]').select(1);
      cy.get('[data-cy="uvuId_input"]').type('10234567');
      cy.wait('@getLogs');
    });

    it('should display logs section after valid UVU ID', () => {
      cy.get('#logsSection').should('be.visible');
    });

    it('should display student ID in header', () => {
      cy.get('[data-cy="uvuIdDisplay"]')
        .should('contain', 'Student Logs for')
        .and('contain', '10234567');
    });

    it('should display logs list', () => {
      cy.get('[data-cy="logs"]').should('exist');
    });

    it('should display "No logs" message when student has no logs', () => {
      // This test depends on your test data
      cy.get('[data-cy="logs"]').then(($logs) => {
        if ($logs.find('li').length === 0 || $logs.find('.no-logs').length > 0) {
          cy.get('.no-logs').should('exist');
        }
      });
    });

    it('should toggle log text visibility on click', () => {
      cy.get('[data-cy="logs"] li').first().then(($li) => {
        if ($li.length > 0 && !$li.hasClass('no-logs')) {
          // Click to hide
          cy.wrap($li).click();
          cy.wrap($li).find('pre').should('have.class', 'hidden');
          
          // Click to show
          cy.wrap($li).click();
          cy.wrap($li).find('pre').should('not.have.class', 'hidden');
        }
      });
    });
  });

  describe('Add New Log', () => {
    beforeEach(() => {
      cy.get('[data-cy="course_select"]').select(1);
      cy.get('[data-cy="uvuId_input"]').type('10234567');
      cy.wait('@getLogs');
    });

    it('should display textarea for new log', () => {
      cy.get('[data-cy="log_textarea"]').should('be.visible');
    });

    it('should display Add Log button', () => {
      cy.get('[data-cy="add_log_btn"]').should('be.visible');
    });

    it('should have Add Log button disabled initially', () => {
      cy.get('[data-cy="add_log_btn"]').should('be.disabled');
    });

    it('should enable Add Log button when text is entered', () => {
      cy.get('[data-cy="log_textarea"]').type('Test log entry');
      cy.get('[data-cy="add_log_btn"]').should('not.be.disabled');
    });

    it('should disable Add Log button when textarea is cleared', () => {
      cy.get('[data-cy="log_textarea"]').type('Test log entry');
      cy.get('[data-cy="add_log_btn"]').should('not.be.disabled');
      
      cy.get('[data-cy="log_textarea"]').clear();
      cy.get('[data-cy="add_log_btn"]').should('be.disabled');
    });

    it('should submit new log and add it to the list', () => {
      const testLog = `Test log - ${Date.now()}`;
      
      cy.get('[data-cy="log_textarea"]').type(testLog);
      cy.get('[data-cy="add_log_btn"]').click();
      
      cy.wait('@postLog');
      
      // Check that textarea is cleared
      cy.get('[data-cy="log_textarea"]').should('have.value', '');
      
      // Check that button is disabled again
      cy.get('[data-cy="add_log_btn"]').should('be.disabled');
      
      // Check that new log appears in the list
      cy.get('[data-cy="logs"] li').first()
        .should('contain', testLog);
    });

    it('should add new log to the top of the list', () => {
      const testLog = `New log at top - ${Date.now()}`;
      
      cy.get('[data-cy="log_textarea"]').type(testLog);
      cy.get('[data-cy="add_log_btn"]').click();
      
      cy.wait('@postLog');
      
      cy.get('[data-cy="logs"] li').first()
        .should('contain', testLog);
    });

    it('should remove "no logs" message when adding first log', () => {
      // Check if "no logs" message exists
      cy.get('[data-cy="logs"]').then(($logs) => {
        const hasNoLogs = $logs.find('.no-logs').length > 0;
        
        if (hasNoLogs) {
          const testLog = 'First log entry';
          
          cy.get('[data-cy="log_textarea"]').type(testLog);
          cy.get('[data-cy="add_log_btn"]').click();
          
          cy.wait('@postLog');
          
          cy.get('.no-logs').should('not.exist');
        }
      });
    });
  });

  describe('Form Behavior', () => {
    it('should reset logs when changing course', () => {
      cy.get('[data-cy="course_select"]').select(1);
      cy.get('[data-cy="uvuId_input"]').type('10234567');
      cy.wait('@getLogs');
      
      cy.get('#logsSection').should('be.visible');
      
      cy.get('[data-cy="course_select"]').select(2);
      cy.get('#logsSection').should('not.be.visible');
    });

    it('should clear UVU ID when changing course', () => {
      cy.get('[data-cy="course_select"]').select(1);
      cy.get('[data-cy="uvuId_input"]').type('10234567');
      
      cy.get('[data-cy="course_select"]').select(2);
      cy.get('[data-cy="uvuId_input"]').should('have.value', '');
    });
  });

  describe('Accessibility', () => {
    it('should have proper labels for all inputs', () => {
      cy.get('label[for="course"]').should('exist');
      cy.get('label[for="uvuId"]').should('exist');
      cy.get('label[for="logTextarea"]').should('exist');
    });

    it('should have aria-labels where appropriate', () => {
      cy.get('[aria-label="Select Course"]').should('exist');
      cy.get('[aria-label="add log textarea"]').should('exist');
    });

    it('should have data-cy attributes for testing', () => {
      cy.get('[data-cy="course_select"]').should('exist');
      cy.get('[data-cy="uvuId_input"]').should('exist');
      cy.get('[data-cy="uvuIdDisplay"]').should('exist');
      cy.get('[data-cy="logs"]').should('exist');
      cy.get('[data-cy="log_textarea"]').should('exist');
      cy.get('[data-cy="add_log_btn"]').should('exist');
    });
  });

  describe('Responsive Design', () => {
    it('should be responsive on mobile viewport', () => {
      cy.viewport('iphone-x');
      
      cy.get('header h1').should('be.visible');
      cy.get('[data-cy="course_select"]').should('be.visible');
    });

    it('should be responsive on tablet viewport', () => {
      cy.viewport('ipad-2');
      
      cy.get('header h1').should('be.visible');
      cy.get('[data-cy="course_select"]').should('be.visible');
    });

    it('should be responsive on desktop viewport', () => {
      cy.viewport(1920, 1080);
      
      cy.get('header h1').should('be.visible');
      cy.get('[data-cy="course_select"]').should('be.visible');
    });
  });
});
