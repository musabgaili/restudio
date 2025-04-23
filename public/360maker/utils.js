// utils.js - Utility functions for 360 Tour Studio

/**
 * Generate a unique ID
 * @returns {string} A unique identifier
 */
function generateUniqueId() {
    return Math.random().toString(36).substring(2, 15) +
           Math.random().toString(36).substring(2, 15);
}

/**
 * Format a number with leading zeros
 * @param {number} num - The number to format
 * @param {number} places - The number of places/digits
 * @returns {string} The formatted number
 */
function formatNumber(num, places = 2) {
    return String(num).padStart(places, '0');
}

/**
 * Format a date object to a readable string
 * @param {Date} date - The date to format
 * @returns {string} Formatted date string
 */
function formatDate(date) {
    if (!(date instanceof Date)) {
        date = new Date(date);
    }

    return `${date.getFullYear()}-${formatNumber(date.getMonth() + 1)}-${formatNumber(date.getDate())} ${formatNumber(date.getHours())}:${formatNumber(date.getMinutes())}:${formatNumber(date.getSeconds())}`;
}

/**
 * Deep clone an object
 * @param {Object} obj - The object to clone
 * @returns {Object} A deep copy of the object
 */
function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
}

/**
 * Get CSRF token from meta tag
 * @returns {string} CSRF token value
 */
function getCsrfToken() {
    return document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
}

/**
 * Make a POST request with CSRF protection
 * @param {string} url - Target URL
 * @param {Object|FormData} data - Data to send
 * @returns {Promise} Promise resolving to the response
 */
function postWithCsrf(url, data) {
    const headers = {
        'X-CSRF-TOKEN': getCsrfToken()
    };

    // If it's not FormData, add Content-Type header
    if (!(data instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
        data = JSON.stringify(data);
    }

    return fetch(url, {
        method: 'POST',
        headers: headers,
        body: data,
    }).then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    });
}

export {
    generateUniqueId,
    formatNumber,
    formatDate,
    deepClone,
    getCsrfToken,
    postWithCsrf
};
