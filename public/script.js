/**
 * Student Logs Application
 * Handles course selection, UVU ID input validation, log fetching, and log creation
 */

// API Base URL - uses relative path since served from same origin
const API_BASE = '/api/v1';

// DOM Elements
const courseSelect = document.getElementById('course');
const uvuIdSection = document.getElementById('uvuIdSection');
const uvuIdInput = document.getElementById('uvuId');
const logsSection = document.getElementById('logsSection');
const uvuIdDisplay = document.getElementById('uvuIdDisplay');
const logsList = document.getElementById('logsList');
const logTextarea = document.getElementById('logTextarea');
const addLogBtn = document.getElementById('addLogBtn');
const logForm = document.getElementById('logForm');
const themeToggle = document.getElementById('themeToggle');

// State to track if logs have been successfully loaded
let logsLoaded = false;

// Theme management
let currentTheme = 'light';

/**
 * Initialize the application
 */
async function init() {
  initializeTheme();
  await loadCourses();
  setupEventListeners();
}

/**
 * Fetch and populate courses dropdown from API using Axios
 */
async function loadCourses() {
  try {
    const response = await axios.get(`${API_BASE}/courses`);
    const courses = response.data;
    
    // Clear existing options except the default
    courseSelect.innerHTML = '<option selected value="">Choose Courses</option>';
    
    // Add course options dynamically
    courses.forEach(course => {
      const option = document.createElement('option');
      option.value = course.id;
      option.textContent = course.display;
      courseSelect.appendChild(option);
    });
  } catch (error) {
    console.error('Error loading courses:', error);
  }
}

/**
 * Set up all event listeners
 */
function setupEventListeners() {
  // Course selection change
  courseSelect.addEventListener('change', handleCourseChange);
  
  // UVU ID input - restrict to numbers only and check length
  uvuIdInput.addEventListener('input', handleUvuIdInput);
  
  // Textarea input to enable/disable button
  logTextarea.addEventListener('input', updateAddLogButton);
  
  // Form submission for adding new log
  logForm.addEventListener('submit', handleFormSubmit);
  
  // Theme toggle
  themeToggle.addEventListener('click', toggleTheme);
}

/**
 * Handle course selection change
 * Shows/hides UVU ID input based on selection
 */
function handleCourseChange() {
  const selectedCourse = courseSelect.value;
  
  if (selectedCourse) {
    // Show UVU ID section when course is selected
    uvuIdSection.style.display = 'block';
    uvuIdInput.value = '';
    uvuIdInput.focus();
  } else {
    // Hide UVU ID section when no course selected
    uvuIdSection.style.display = 'none';
    logsSection.style.display = 'none';
    logsLoaded = false;
  }
  
  // Reset logs section when course changes
  logsSection.style.display = 'none';
  logsList.innerHTML = '';
  logsLoaded = false;
  updateAddLogButton();
}

/**
 * Handle UVU ID input
 * Filters non-numeric characters and triggers fetch when valid
 */
function handleUvuIdInput(event) {
  // Remove any non-digit characters
  let value = event.target.value.replace(/\D/g, '');
  
  // Ensure max length of 8
  if (value.length > 8) {
    value = value.substring(0, 8);
  }
  
  // Update input value (cleaned)
  event.target.value = value;
  
  // When exactly 8 digits, fetch logs
  if (value.length === 8) {
    fetchLogs(courseSelect.value, value);
  } else {
    // Hide logs if not 8 digits
    logsSection.style.display = 'none';
    logsLoaded = false;
    updateAddLogButton();
  }
}

/**
 * Fetch logs from API based on course and UVU ID using Axios
 */
async function fetchLogs(courseId, uvuId) {
  try {
    const response = await axios.get(`${API_BASE}/logs`, {
      params: { courseId, uvuId }
    });
    
    const logs = response.data;
    displayLogs(logs, uvuId);
    logsLoaded = true;
  } catch (error) {
    console.error('Error fetching logs:', error);
    
    if (error.response) {
      // Server responded with error status
      uvuIdDisplay.textContent = 'Error fetching logs. Please try again.';
      logsSection.style.display = 'block';
      logsList.innerHTML = '<li class="no-logs">Unable to load logs</li>';
    } else {
      // Network or other error
      uvuIdDisplay.textContent = 'Error connecting to server.';
      logsSection.style.display = 'block';
      logsList.innerHTML = '<li class="no-logs">Connection error</li>';
    }
    logsLoaded = false;
  }
  
  updateAddLogButton();
}

/**
 * Display logs in the UI
 */
function displayLogs(logs, uvuId) {
  // Update header
  uvuIdDisplay.textContent = `Student Logs for ${uvuId}`;
  
  // Clear existing logs
  logsList.innerHTML = '';
  
  if (logs.length === 0) {
    logsList.innerHTML = '<li class="no-logs">No logs found for this student in this course.</li>';
  } else {
    // Sort logs by date (newest first)
    logs.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Create log items
    logs.forEach(log => {
      const li = createLogItem(log);
      logsList.appendChild(li);
    });
  }
  
  // Show logs section
  logsSection.style.display = 'block';
}

/**
 * Create a single log list item element
 */
function createLogItem(log) {
  const li = document.createElement('li');
  
  const dateDiv = document.createElement('div');
  const small = document.createElement('small');
  small.textContent = log.date;
  dateDiv.appendChild(small);
  
  const pre = document.createElement('pre');
  const p = document.createElement('p');
  p.textContent = log.text;
  pre.appendChild(p);
  
  li.appendChild(dateDiv);
  li.appendChild(pre);
  
  // Toggle visibility on click
  li.addEventListener('click', () => {
    pre.classList.toggle('hidden');
  });
  
  return li;
}

/**
 * Update the Add Log button state
 * Button is enabled only when logs are loaded and textarea has content
 */
function updateAddLogButton() {
  const hasText = logTextarea.value.trim().length > 0;
  addLogBtn.disabled = !(logsLoaded && hasText);
}

/**
 * Handle form submission for adding a new log using Axios
 */
async function handleFormSubmit(event) {
  event.preventDefault();
  
  const logText = logTextarea.value.trim();
  if (!logText || !logsLoaded) return;
  
  const newLog = {
    courseId: courseSelect.value,
    uvuId: uvuIdInput.value,
    date: new Date().toLocaleString(),
    text: logText
  };
  
  try {
    const response = await axios.post(`${API_BASE}/logs`, newLog, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    const savedLog = response.data;
    
    // Add new log to the top of the list
    const li = createLogItem(savedLog);
    
    // Remove "no logs" message if present
    const noLogsItem = logsList.querySelector('.no-logs');
    if (noLogsItem) {
      noLogsItem.remove();
    }
    
    // Insert at the beginning
    logsList.insertBefore(li, logsList.firstChild);
    
    // Clear textarea
    logTextarea.value = '';
    updateAddLogButton();
  } catch (error) {
    console.error('Error saving log:', error);
    alert('Error connecting to server. Please try again.');
  }
}

/**
 * Initialize theme on page load
 * Priority: User Pref > Browser Pref > OS Pref > Default (light)
 */
function initializeTheme() {
  // Check stored user preference
  const storedTheme = localStorage.getItem('theme');
  
  // Check browser preference (prefers-color-scheme media query)
  let browserPref = 'unknown';
  if (window.matchMedia) {
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      browserPref = 'dark';
    } else if (window.matchMedia('(prefers-color-scheme: light)').matches) {
      browserPref = 'light';
    }
  }
  
  // OS preference is typically the same as browser preference in modern browsers
  // Since browsers expose OS preference through prefers-color-scheme
  const osPref = browserPref; // Browser exposes OS preference
  
  // Log all preferences for grading
  console.log(`User Pref: ${storedTheme || 'unknown'}`);
  console.log(`Browser Pref: ${browserPref}`);
  console.log(`OS Pref: ${osPref}`);
  
  // Determine theme to use
  let themeToApply = 'light'; // default
  
  if (storedTheme) {
    themeToApply = storedTheme;
  } else if (browserPref !== 'unknown') {
    themeToApply = browserPref;
  } else if (osPref !== 'unknown') {
    themeToApply = osPref;
  }
  
  currentTheme = themeToApply;
  applyTheme(themeToApply);
}

/**
 * Apply theme to the document
 */
function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  
  // Update toggle button icon
  const icon = themeToggle.querySelector('.theme-icon');
  if (icon) {
    icon.textContent = theme === 'dark' ? '☀️' : '🌙';
  }
  
  currentTheme = theme;
}

/**
 * Toggle between light and dark themes
 */
function toggleTheme() {
  const newTheme = currentTheme === 'light' ? 'dark' : 'light';
  
  // Save preference to localStorage
  localStorage.setItem('theme', newTheme);
  
  // Apply the new theme
  applyTheme(newTheme);
}

// Initialize the app when DOM is ready
document.addEventListener('DOMContentLoaded', init);
