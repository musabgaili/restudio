// utils.js - Helper functions for the application

// Generate a unique ID
function generateUniqueId() {
    return 'id-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
}

// Convert degrees to radians
function degToRad(degrees) {
    return degrees * (Math.PI / 180);
}

// Convert radians to degrees
function radToDeg(radians) {
    return radians * (180 / Math.PI);
}

// Helper for logging without flooding console
const debugLog = (function() {
    let lastLog = {};

    return function(category, message, obj = null) {
        const now = Date.now();
        // Only log if more than 1 second has passed since last log of this category
        if (!lastLog[category] || now - lastLog[category] > 1000) {
            console.log(`[${category}]`, message, obj);
            lastLog[category] = now;
        }
    };
})();

export {
    generateUniqueId,
    degToRad,
    radToDeg,
    debugLog
};
