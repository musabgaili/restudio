/**
 * hotspotCreation.js
 * Functions for creating, placing, and manipulating hotspots
 */

import { images, hotspots, currentImageKey } from './state.js';
import { enableHotspotFields, updateLinkSelectOptions } from './formHandlers.js';

/**
 * Start hotspot placement mode
 * @param {string} type - The type of hotspot to place ('info' or 'link')
 */
function startHotspotPlacement(type) {
  // Set the type
  window.appState.selectedHotspotType = type;
  document.getElementById('hotspotType').value = type;

  // Update UI
  window.appState.isPlacingHotspot = true;

  // Update button states
  if (type === 'info') {
    document.getElementById('infoButton').classList.add('active');
    document.getElementById('linkButton').classList.remove('active');
  } else {
    document.getElementById('infoButton').classList.remove('active');
    document.getElementById('linkButton').classList.add('active');
  }

  // Show instruction message
  const viewerContainer = document.getElementById('viewer');
  const instructionEl = document.createElement('div');
  instructionEl.id = 'placement-instruction';
  instructionEl.className = 'placement-instruction';
  instructionEl.textContent = `Click on the image to place a ${type} hotspot`;
  viewerContainer.appendChild(instructionEl);

  // Change cursor
  document.getElementById('viewer').style.cursor = 'crosshair';

  // Disable form fields until placement
  disableHotspotFields();
}

/**
 * Place hotspot on the image at specified coordinates
 * @param {number} pitch - The pitch coordinate
 * @param {number} yaw - The yaw coordinate
 */
function placeHotspot(pitch, yaw) {
  // Exit placement mode
  window.appState.isPlacingHotspot = false;

  // Remove instruction message
  const instructionEl = document.getElementById('placement-instruction');
  if (instructionEl) instructionEl.remove();

  // Reset cursor
  document.getElementById('viewer').style.cursor = 'grab';

  // Create a temporary hotspot
  createTempHotspot(pitch, yaw);

  // Enable form fields for editing
  enableHotspotFields();

  // Show the appropriate form fields
  const hotspotTextContainer = document.getElementById('hotspotTextContainer');
  const hotspotLinkContainer = document.getElementById('hotspotLinkContainer');

  if (window.appState.selectedHotspotType === 'info') {
    hotspotTextContainer.style.display = 'block';
    hotspotLinkContainer.style.display = 'none';
    document.getElementById('hotspotText').focus();
  } else {
    hotspotTextContainer.style.display = 'none';
    hotspotLinkContainer.style.display = 'block';
    updateLinkSelectOptions();
    // Don't set focus on the select element as it can cause validation issues
  }
}

/**
 * Create a temporary hotspot for preview and editing
 * @param {number} pitch - The pitch coordinate
 * @param {number} yaw - The yaw coordinate
 */
function createTempHotspot(pitch, yaw) {
  // Cancel any existing temp hotspot
  cancelTempHotspot();

  const type = window.appState.selectedHotspotType;
  const cssClass = type === 'info' ? 'temp-info-hotspot' : 'temp-link-hotspot';

  window.appState.tempHotspot = {
    id: 'temp-hotspot',
    pitch: pitch,
    yaw: yaw,
    type: type === 'info' ? 'info' : 'scene',
    text: type === 'info' ? 'Info Hotspot' : 'Link Hotspot',
    cssClass: cssClass
  };

  // Add temp hotspot to viewer
  window.viewer.addHotSpot(window.appState.tempHotspot);

  // Set form values
  document.getElementById('hotspotPitch').value = pitch;
  document.getElementById('hotspotYaw').value = yaw;

  // Make it draggable
  setTimeout(() => {
    const hotspotElement = document.querySelector(`.${cssClass}`);
    if (hotspotElement) {
      hotspotElement.addEventListener('mousedown', function(e) {
        e.stopPropagation();
        window.appState.isDragging = true;

        const moveHandler = function(moveEvent) {
          if (!window.appState.isDragging) return;

          const coords = window.viewer.mouseEventToCoords(moveEvent);
          updateTempHotspot(coords[0], coords[1]);
        };

        const upHandler = function() {
          window.appState.isDragging = false;
          document.removeEventListener('mousemove', moveHandler);
          document.removeEventListener('mouseup', upHandler);
        };

        document.addEventListener('mousemove', moveHandler);
        document.addEventListener('mouseup', upHandler);
      });
    }
  }, 100);
}

/**
 * Update temporary hotspot position
 * @param {number} pitch - The new pitch coordinate
 * @param {number} yaw - The new yaw coordinate
 */
function updateTempHotspot(pitch, yaw) {
  if (!window.appState || !window.appState.tempHotspot || !window.viewer) return;

  document.getElementById('hotspotPitch').value = pitch;
  document.getElementById('hotspotYaw').value = yaw;

  try {
    window.viewer.removeHotSpot('temp-hotspot');

    window.appState.tempHotspot.pitch = pitch;
    window.appState.tempHotspot.yaw = yaw;

    window.viewer.addHotSpot(window.appState.tempHotspot);
  } catch (error) {
    console.log('Error updating temporary hotspot:', error);
  }
}

/**
 * Cancel/remove the temporary hotspot
 */
function cancelTempHotspot() {
  try {
    if (window.appState && window.appState.tempHotspot && window.viewer) {
      window.viewer.removeHotSpot('temp-hotspot');
    }
  } catch (error) {
    console.log('Error removing temporary hotspot:', error);
  }

  if (window.appState) {
    window.appState.tempHotspot = null;
  }
}

/**
 * Find a hotspot at given coordinates
 * @param {number} pitch - The pitch coordinate to check
 * @param {number} yaw - The yaw coordinate to check
 * @returns {number} The index of the found hotspot or -1 if none found
 */
function findHotspotAtCoords(pitch, yaw) {
  if (!currentImageKey || !hotspots[currentImageKey]) return -1;

  // Threshold for hotspot selection (in degrees)
  const threshold = 5;

  for (let i = 0; i < hotspots[currentImageKey].length; i++) {
    const hs = hotspots[currentImageKey][i];

    // Calculate distance between points on a sphere
    const pitchDiff = Math.abs(hs.pitch - pitch);
    const yawDiff = Math.abs(hs.yaw - yaw);

    if (pitchDiff < threshold && yawDiff < threshold) {
      return i;
    }
  }

  return -1;
}

// Helper function to disable form fields - needed to avoid circular dependency
function disableHotspotFields() {
  const formElements = document.getElementById('hotspotForm').querySelectorAll('input, select, button');
  formElements.forEach(el => {
    el.disabled = true;
  });

  document.getElementById('hotspotFormFields').style.display = 'none';
}

export {
  startHotspotPlacement,
  placeHotspot,
  createTempHotspot,
  updateTempHotspot,
  cancelTempHotspot,
  findHotspotAtCoords
};
