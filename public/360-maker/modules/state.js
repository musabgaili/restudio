/**
 * state.js
 * Central store for application state and shared variables
 */

// Viewer instance
let viewer = null;

// Data stores
const images = {};
const hotspots = {};

// Active image tracking
let currentImageKey = null;

/**
 * Set the current image key
 * @param {string} key - The image key to set as current
 */
function setCurrentImageKey(key) {
  currentImageKey = key;
}

// Export all state variables
export {
  viewer,
  images,
  hotspots,
  currentImageKey,
  setCurrentImageKey
};
