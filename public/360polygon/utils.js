// utils.js - Helper functions for the polygon application

/**
 * Generate a unique ID
 * @returns {string} A unique ID
 */
function generateUniqueId() {
    return 'id-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
}

/**
 * Convert degrees to radians
 * @param {number} degrees - Angle in degrees
 * @returns {number} Angle in radians
 */
function degToRad(degrees) {
    return degrees * (Math.PI / 180);
}

/**
 * Convert radians to degrees
 * @param {number} radians - Angle in radians
 * @returns {number} Angle in degrees
 */
function radToDeg(radians) {
    return radians * (180 / Math.PI);
}

/**
 * Create a helper for logging without flooding console
 * @returns {Function} Logging function with rate limiting
 */
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

/**
 * Calculate the centroid of a polygon
 * @param {Array} points - Array of points with yaw and pitch
 * @returns {Object} Centroid coordinates {yaw, pitch}
 */
function calculatePolygonCentroid(points) {
    if (!points || points.length === 0) return { yaw: 0, pitch: 0 };

    // Convert spherical coordinates to Cartesian for proper averaging
    const cartesianPoints = points.map(point => {
        const x = Math.cos(point.pitch) * Math.cos(point.yaw);
        const y = Math.cos(point.pitch) * Math.sin(point.yaw);
        const z = Math.sin(point.pitch);
        return { x, y, z };
    });

    // Calculate average position in Cartesian space
    const sumX = cartesianPoints.reduce((sum, p) => sum + p.x, 0);
    const sumY = cartesianPoints.reduce((sum, p) => sum + p.y, 0);
    const sumZ = cartesianPoints.reduce((sum, p) => sum + p.z, 0);

    const avgX = sumX / points.length;
    const avgY = sumY / points.length;
    const avgZ = sumZ / points.length;

    // Convert back to spherical coordinates
    const r = Math.sqrt(avgX * avgX + avgY * avgY + avgZ * avgZ);
    const yaw = Math.atan2(avgY, avgX);
    const pitch = Math.asin(avgZ / r);

    return { yaw, pitch };
}

/**
 * Format angle for display
 * @param {number} angleRad - Angle in radians
 * @returns {string} Formatted angle in degrees
 */
function formatAngle(angleRad) {
    return Math.round(radToDeg(angleRad)) + '°';
}

export {
    generateUniqueId,
    degToRad,
    radToDeg,
    debugLog,
    calculatePolygonCentroid,
    formatAngle
};
