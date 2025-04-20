/**
 * Main application file for the 360 Tour Builder
 * This file imports all modules and initializes the application
 */

// The import statement is already at the top level of the module, so it should remain here.
// Ensure that this import statement is the first line in the script.js file, before any other code.
import { viewer, images, hotspots, currentImageKey, setCurrentImageKey } from './modules/state.js';
import {
  loadImage,
  handleImageUpload,
  addImageToList
} from './modules/imageHandlers.js';
import {
  placeHotspot,
  createTempHotspot,
  updateTempHotspot,
  cancelTempHotspot,
  findHotspotAtCoords,
  startHotspotPlacement
} from './modules/hotspotCreation.js';
import {
  editHotspot,
  deleteHotspot,
  saveHotspot,
  updateFormMode,
  resetForm
} from './modules/hotspotEditing.js';
import {
  enableHotspotFields,
  disableHotspotFields,
  updateLinkSelectOptions
} from './modules/formHandlers.js';
import {
  saveProject,
  loadProject,
  exportHotspots,
  loadProjectData
} from './modules/dataHandlers.js';

// Global state that needs to be shared between modules
window.appState = {
  isPlacingHotspot: false,
  selectedHotspotType: 'info',
  tempHotspot: null,
  editingHotspotIndex: null,
  isDragging: false
};

/**
 * Initialize the application
 * Sets up event listeners and loads data if available
 */
function init() {
  // Get DOM elements
  const imageInput = document.getElementById('imageInput');
  const hotspotForm = document.getElementById('hotspotForm');
  const infoButton = document.getElementById('infoButton');
  const linkButton = document.getElementById('linkButton');
  const exportBtn = document.getElementById('exportBtn');
  const saveBtn = document.getElementById('saveBtn');
  const loadBtn = document.getElementById('loadBtn');

  // Initialize global references
  window.viewer = null;

  // Disable hotspot controllers initially
  disableHotspotFields();

  // Set up event listeners
  imageInput.addEventListener('change', handleImageUpload);
  hotspotForm.addEventListener('submit', saveHotspot);
  infoButton.addEventListener('click', () => startHotspotPlacement('info'));
  linkButton.addEventListener('click', () => startHotspotPlacement('link'));
  exportBtn.addEventListener('click', exportHotspots);
  saveBtn.addEventListener('click', saveProject);
  loadBtn.addEventListener('click', loadProject);

  // Load any existing data from localStorage on startup
  const savedData = localStorage.getItem('360tourProject');
  if (savedData) {
    try {
      const projectData = JSON.parse(savedData);
      if (projectData.images && Object.keys(projectData.images).length > 0) {
        const { loadProjectData } = require('./modules/dataHandlers.js');
        loadProjectData(projectData);
      }
    } catch (e) {
      console.error("Error loading saved data:", e);
    }
  }
}

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', init);
