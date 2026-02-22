"use strict";
/**
 * Student Logs Application
 * Handles course selection, UVU ID input validation, log fetching, and log creation
 * Uses jQuery for DOM manipulation and AJAX
 */
// API Base URL - uses relative path since served from same origin
const API_BASE = '/api/v1';
// State to track if logs have been successfully loaded
let logsLoaded = false;
// Theme management
let currentTheme = 'light';
/**
 * Fetch and populate courses dropdown from API using jQuery
 */
function loadCourses() {
    return $.ajax({
        url: `${API_BASE}/courses`,
        method: 'GET',
        dataType: 'json'
    }).done((courses) => {
        const $courseSelect = $('#course');
        $courseSelect.html('<option selected value="">Choose Courses</option>');
        $.each(courses, function (_i, course) {
            $courseSelect.append($('<option></option>').val(course.id).text(course.display));
        });
    }).fail((jqXHR, textStatus, errorThrown) => {
        console.error('Error loading courses:', errorThrown);
    });
}
/**
 * Set up all event listeners using jQuery
 */
function setupEventListeners() {
    $('#course').on('change', handleCourseChange);
    $('#uvuId').on('input', handleUvuIdInput);
    $('#logTextarea').on('input', updateAddLogButton);
    $('#logForm').on('submit', handleFormSubmit);
    $('#themeToggle').on('click', toggleTheme);
}
/**
 * Handle course selection change
 * Shows/hides UVU ID input based on selection
 */
function handleCourseChange() {
    const selectedCourse = $('#course').val();
    if (selectedCourse) {
        $('#uvuIdSection').removeClass('d-none');
        $('#uvuId').val('').trigger('focus');
    }
    else {
        $('#uvuIdSection').addClass('d-none');
        $('#logsSection').addClass('d-none');
        logsLoaded = false;
    }
    $('#logsSection').addClass('d-none');
    $('#logsList').empty();
    logsLoaded = false;
    updateAddLogButton();
}
/**
 * Handle UVU ID input
 * Filters non-numeric characters and triggers fetch when valid
 */
function handleUvuIdInput(event) {
    let value = $(event.target).val().replace(/\D/g, '');
    if (value.length > 8) {
        value = value.substring(0, 8);
    }
    $(event.target).val(value);
    if (value.length === 8) {
        fetchLogs($('#course').val(), value);
    }
    else {
        $('#logsSection').addClass('d-none');
        logsLoaded = false;
        updateAddLogButton();
    }
}
/**
 * Fetch logs from API based on course and UVU ID using jQuery
 */
function fetchLogs(courseId, uvuId) {
    return $.ajax({
        url: `${API_BASE}/logs`,
        method: 'GET',
        data: { courseId, uvuId },
        dataType: 'json'
    }).done((logs) => {
        displayLogs(logs, uvuId);
        logsLoaded = true;
    }).fail((jqXHR) => {
        console.error('Error fetching logs:', jqXHR);
        if (jqXHR.status) {
            $('#uvuIdDisplay').text('Error fetching logs. Please try again.');
            $('#logsSection').show();
            $('#logsList').html('<li class="list-group-item text-muted">Unable to load logs</li>');
        }
        else {
            $('#uvuIdDisplay').text('Error connecting to server.');
            $('#logsSection').show();
            $('#logsList').html('<li class="list-group-item text-muted">Connection error</li>');
        }
        logsLoaded = false;
    }).always(() => {
        updateAddLogButton();
    });
}
/**
 * Display logs in the UI
 */
function displayLogs(logs, uvuId) {
    $('#uvuIdDisplay').text(`Student Logs for ${uvuId}`);
    $('#logsList').empty();
    if (logs.length === 0) {
        $('#logsList').append('<li class="list-group-item text-muted no-logs">No logs found for this student in this course.</li>');
    }
    else {
        const sorted = [...logs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        $.each(sorted, function (_i, log) {
            $('#logsList').append(createLogItem(log));
        });
    }
    $('#logsSection').removeClass('d-none');
}
/**
 * Create a single log list item element
 */
function createLogItem(log) {
    const $li = $('<li></li>').addClass('list-group-item list-group-item-action');
    const $dateDiv = $('<div></div>');
    const $small = $('<small></small>').addClass('text-muted').text(log.date);
    $dateDiv.append($small);
    const $pre = $('<pre></pre>').addClass('mb-0 mt-2');
    const $p = $('<p></p>').addClass('mb-0').text(log.text);
    $pre.append($p);
    $li.append($dateDiv).append($pre);
    $li.on('click', function () {
        $pre.toggleClass('d-none');
    });
    return $li;
}
/**
 * Update the Add Log button state
 * Button is enabled only when logs are loaded and textarea has content
 */
function updateAddLogButton() {
    const hasText = $('#logTextarea').val().trim().length > 0;
    $('#addLogBtn').prop('disabled', !(logsLoaded && hasText));
}
/**
 * Handle form submission for adding a new log using jQuery
 */
function handleFormSubmit(event) {
    event.preventDefault();
    const logText = $('#logTextarea').val().trim();
    if (!logText || !logsLoaded)
        return;
    const newLog = {
        courseId: $('#course').val(),
        uvuId: $('#uvuId').val(),
        date: new Date().toLocaleString(),
        text: logText
    };
    $.ajax({
        url: `${API_BASE}/logs`,
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(newLog),
        dataType: 'json'
    }).done((savedLog) => {
        const $li = createLogItem(savedLog);
        $('#logsList .no-logs').remove();
        $('#logsList').prepend($li);
        $('#logTextarea').val('');
        updateAddLogButton();
    }).fail(() => {
        console.error('Error saving log');
        alert('Error connecting to server. Please try again.');
    });
}
/**
 * Initialize theme on page load
 * Priority: User Pref > Browser Pref > OS Pref > Default (light)
 */
function initializeTheme() {
    const storedTheme = localStorage.getItem('theme');
    let browserPref = 'unknown';
    if (typeof matchMedia !== 'undefined') {
        if (matchMedia('(prefers-color-scheme: dark)').matches) {
            browserPref = 'dark';
        }
        else if (matchMedia('(prefers-color-scheme: light)').matches) {
            browserPref = 'light';
        }
    }
    const osPref = browserPref;
    console.log(`User Pref: ${storedTheme || 'unknown'}`);
    console.log(`Browser Pref: ${browserPref}`);
    console.log(`OS Pref: ${osPref}`);
    let themeToApply = 'light';
    if (storedTheme) {
        themeToApply = storedTheme;
    }
    else if (browserPref !== 'unknown') {
        themeToApply = browserPref;
    }
    else if (osPref !== 'unknown') {
        themeToApply = osPref;
    }
    currentTheme = themeToApply;
    applyTheme(themeToApply);
}
/**
 * Apply theme to the document
 */
function applyTheme(theme) {
    $('html').attr({ 'data-theme': theme, 'data-bs-theme': theme });
    const iconText = theme === 'dark' ? '☀️' : '🌙';
    $('#themeToggle .theme-icon').text(iconText);
    currentTheme = theme;
}
/**
 * Toggle between light and dark themes
 */
function toggleTheme() {
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    localStorage.setItem('theme', newTheme);
    applyTheme(newTheme);
}
/**
 * Initialize the application when DOM is ready
 */
$(function () {
    initializeTheme();
    loadCourses();
    setupEventListeners();
});
