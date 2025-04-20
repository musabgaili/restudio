/**
 * hotspotEditing.js
 * Functions for editing, updating, and deleting hotspots
 */

import { images, hotspots, currentImageKey } from './state.js';
import { loadImage } from './imageHandlers.js';
import { cancelTempHotspot, createTempHotspot } from './hotspotCreation.js';
import { enableHotspotFields, disableHotspotFields, updateLinkSelectOptions } from './formHandlers.js';

/**
 * Edit an existing hotspot
 * @param {number} index - The index of the hotspot to edit
 */
function editHotspot(index) {
  if (!currentImageKey || !hotspots[currentImageKey]) return;

  const hotspot = hotspots[currentImageKey][index];
  window.appState.editingHotspotIndex = index;

  // Set form values
  const hotspotPitch = document.getElementById('hotspotPitch');
  const hotspotYaw = document.getElementById('hotspotYaw');
  const hotspotType = document.getElementById('hotspotType');
  const hotspotText = document.getElementById('hotspotText');
  const hotspotTextContainer = document.getElementById('hotspotTextContainer');
  const hotspotLinkContainer = document.getElementById('hotspotLinkContainer');
  const infoButton = document.getElementById('infoButton');
  const linkButton = document.getElementById('linkButton');

  hotspotPitch.value = hotspot.pitch;
  hotspotYaw.value = hotspot.yaw;

  // Set type
  window.appState.selectedHotspotType = hotspot.type === 'info' ? 'info' : 'link';
  hotspotType.value = window.appState.selectedHotspotType;

  // Update UI
  if (window.appState.selectedHotspotType === 'info') {
    infoButton.classList.add('active');
    linkButton.classList.remove('active');
    hotspotTextContainer.style.display = 'block';
    hotspotLinkContainer.style.display = 'none';
    hotspotText.value = hotspot.text;
  } else {
    infoButton.classList.remove('active');
    linkButton.classList.add('active');
    hotspotTextContainer.style.display = 'none';
    hotspotLinkContainer.style.display = 'block';
    updateLinkSelectOptions();

    const hotspotLink = document.getElementById('hotspotLink');
    if (hotspot.sceneId) {
      hotspotLink.value = hotspot.sceneId;
    }
  }

  // Create temp hotspot for dragging/editing
  createTempHotspot(hotspot.pitch, hotspot.yaw);

  // Enable form fields
  enableHotspotFields();

  // Update form to show it's for editing
  updateFormMode('edit');
}

/**
 * Delete a hotspot
 */
function deleteHotspot() {
  if (window.appState.editingHotspotIndex === null || !currentImageKey) return;

  // Remove from array
  hotspots[currentImageKey].splice(window.appState.editingHotspotIndex, 1);

  // Reload the current image to refresh hotspots
  loadImage(currentImageKey);

  // Reset form
  resetForm();
}

/**
 * Update form UI based on mode (create/edit)
 * @param {string} mode - The form mode ('create' or 'edit')
 */
function updateFormMode(mode) {
  const submitBtn = document.getElementById('hotspotForm').querySelector('button[type="submit"]');

  if (mode === 'edit') {
    submitBtn.textContent = 'Update Hotspot';

    // Add delete button if it doesn't exist
    if (!document.getElementById('deleteHotspotBtn')) {
      const deleteBtn = document.createElement('button');
      deleteBtn.id = 'deleteHotspotBtn';
      deleteBtn.className = 'btn btn-danger mt-2';
      deleteBtn.textContent = 'Delete Hotspot';
      deleteBtn.type = 'button';
      deleteBtn.addEventListener('click', deleteHotspot);

      const cancelBtn = document.createElement('button');
      cancelBtn.id = 'cancelEditBtn';
      cancelBtn.className = 'btn btn-secondary mt-2 me-2';
      cancelBtn.textContent = 'Cancel';
      cancelBtn.type = 'button';
      cancelBtn.addEventListener('click', resetForm);

      const buttonContainer = document.createElement('div');
      buttonContainer.id = 'editButtonsContainer';
      buttonContainer.className = 'd-flex';
      buttonContainer.appendChild(cancelBtn);
      buttonContainer.appendChild(deleteBtn);

      submitBtn.parentNode.appendChild(buttonContainer);
    }
  } else {
    submitBtn.textContent = 'Save Hotspot';

    // Remove edit buttons if they exist
    const buttonContainer = document.getElementById('editButtonsContainer');
    if (buttonContainer) {
      buttonContainer.remove();
    }
  }
}

/**
 * Reset form and cancel editing
 */
function resetForm() {
  const hotspotForm = document.getElementById('hotspotForm');
  const hotspotPitch = document.getElementById('hotspotPitch');
  const hotspotYaw = document.getElementById('hotspotYaw');

  try {
    hotspotForm.reset();
    hotspotPitch.value = '';
    hotspotYaw.value = '';

    if (window.appState) {
      window.appState.editingHotspotIndex = null;
      window.appState.isPlacingHotspot = false;
    }

    cancelTempHotspot();
    updateFormMode('create');
    disableHotspotFields();

    // Remove instruction if exists
    const instructionEl = document.getElementById('placement-instruction');
    if (instructionEl) instructionEl.remove();

    // Reset cursor
    document.getElementById('viewer').style.cursor = 'grab';
  } catch (error) {
    console.log('Error in resetForm:', error);
  }
}

/**
 * Save hotspot from form
 * @param {Event} e - The form submit event
 */
function saveHotspot(e) {
  e.preventDefault();

  const hotspotPitch = document.getElementById('hotspotPitch');
  const hotspotYaw = document.getElementById('hotspotYaw');
  const hotspotText = document.getElementById('hotspotText');
  const hotspotLink = document.getElementById('hotspotLink');

  if (!currentImageKey) {
    alert('Please select an image first.');
    return;
  }

  if (!hotspotPitch.value || !hotspotYaw.value) {
    alert('Please click on the image to set hotspot position.');
    return;
  }

  const pitch = parseFloat(hotspotPitch.value);
  const yaw = parseFloat(hotspotYaw.value);
  const type = window.appState.selectedHotspotType;

  let hotspotData;

  if (type === 'info') {
    const text = hotspotText.value;
    if (!text) {
      alert('Please enter text for the info hotspot.');
      return;
    }

    hotspotData = {
      pitch: pitch,
      yaw: yaw,
      type: 'info',
      text: text
    };
  } else { // link type
    if (!hotspotLink.value) {
      alert('Please select a target image.');
      return;
    }

    const targetScene = hotspotLink.value;
    hotspotData = {
      pitch: pitch,
      yaw: yaw,
      type: 'scene',  // Must be 'scene' for pannellum to handle it as a link
      text: images[targetScene].name,
      sceneId: targetScene,
      targetPitch: 0,
      targetYaw: 0
    };
  }

  if (window.appState.editingHotspotIndex !== null) {
    // Update existing hotspot
    hotspots[currentImageKey][window.appState.editingHotspotIndex] = hotspotData;
  } else {
    // Add new hotspot
    hotspots[currentImageKey].push(hotspotData);
  }

  // Remove temporary hotspot
  cancelTempHotspot();

  // Reload the current scene to refresh hotspots
  loadImage(currentImageKey);

  // Reset form
  resetForm();
}

export {
  editHotspot,
  deleteHotspot,
  saveHotspot,
  updateFormMode,
  resetForm
};
