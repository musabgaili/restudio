/**
 * imageHandlers.js
 * Functions for handling image upload, display, and management
 */

import { viewer, images, hotspots, currentImageKey, setCurrentImageKey } from './state.js';
import { cancelTempHotspot } from './hotspotCreation.js';
import { resetForm } from './hotspotEditing.js';
import { disableHotspotFields } from './formHandlers.js';

/**
 * Handle image upload from user input
 * Adds to existing images instead of replacing them
 * @param {Event} e - The file input change event
 */
function handleImageUpload(e) {
  const files = Array.from(e.target.files);
  const currentImageCount = Object.keys(images).length;

  files.forEach((file, idx) => {
    const key = `img_${currentImageCount + idx}`;
    const url = URL.createObjectURL(file);
    images[key] = {
      url: url,
      name: file.name
    };
    hotspots[key] = [];

    // Add to image list
    addImageToList(key, file.name);
  });

  // If this is the first image, load it
  if (currentImageCount === 0 && files.length > 0) {
    loadImage(`img_${currentImageCount}`);
  }

  // Clear the file input
  e.target.value = '';
}

/**
 * Add image to the UI list
 * @param {string} key - The image identifier
 * @param {string} name - The display name of the image
 */
function addImageToList(key, name) {
  const imageList = document.getElementById('imageList');
  const btn = document.createElement('button');
  btn.className = 'list-group-item list-group-item-action';
  btn.dataset.key = key;
  btn.textContent = name;
  btn.addEventListener('click', () => loadImage(key));
  imageList.appendChild(btn);
}

/**
 * Load an image into the viewer
 * @param {string} key - The image identifier to load
 */
function loadImage(key) {
  // Update state
  setCurrentImageKey(key);
  const imageList = document.getElementById('imageList');
  const hotspotControllers = document.getElementById('hotspotControllers');

  // Update active state in image list
  Array.from(imageList.children).forEach(btn => {
    if (btn.dataset.key === key) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  if (viewer) viewer.destroy();

  // Cancel any ongoing editing/placement
  cancelTempHotspot();
  resetForm();

  // Create new viewer instance
  window.viewer = pannellum.viewer('viewer', {
    type: 'equirectangular',
    panorama: images[key].url,
    autoLoad: true,
    hotSpots: hotspots[key],
    mouseZoom: true,
    hfov: 120,
    showControls: true
  });

  // Handle hotspot clicks for navigation
  window.viewer.on('click', function(hotspotData) {
    // Only process scene navigation hotspots
    if (hotspotData && hotspotData.type === 'scene' && hotspotData.sceneId) {
      if (images[hotspotData.sceneId]) {
        loadImage(hotspotData.sceneId);
      }
    }
  });

  window.viewer.on('mousedown', async function(event) {
    // Only handle left mouse button
    if (event.which !== 1) return;

    const coords = window.viewer.mouseEventToCoords(event);
    const pitch = coords[0];
    const yaw = coords[1];

    // If we're in hotspot placement mode
    if (window.appState.isPlacingHotspot) {
      // Import the function to avoid circular dependency
      const { placeHotspot } = await import('./hotspotCreation.js');
      placeHotspot(pitch, yaw);
      return;
    }

    // Check if clicking on an existing hotspot for editing
    const { findHotspotAtCoords } = await import('./hotspotCreation.js');
    const { editHotspot } = await import('./hotspotEditing.js');
    const clickedHotspotIndex = findHotspotAtCoords(pitch, yaw);

    if (clickedHotspotIndex !== -1) {
      editHotspot(clickedHotspotIndex);
    }
  });

  // Enable hotspot placement buttons
  hotspotControllers.classList.remove('disabled');

  // Disable form fields initially until hotspot is placed
  disableHotspotFields();
}

export {
  handleImageUpload,
  addImageToList,
  loadImage
};
