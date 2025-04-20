/**
 * formHandlers.js
 * Functions for handling form inputs, validation, and UI updates
 */

import { images, currentImageKey } from './state.js';

/**
 * Enable hotspot form fields
 */
function enableHotspotFields() {
  const formElements = document.getElementById('hotspotForm').querySelectorAll('input, select, button');
  formElements.forEach(el => {
    el.disabled = false;
  });

  document.getElementById('hotspotFormFields').style.display = 'block';
}

/**
 * Disable hotspot form fields
 */
function disableHotspotFields() {
  const formElements = document.getElementById('hotspotForm').querySelectorAll('input, select, button');
  formElements.forEach(el => {
    el.disabled = true;
  });

  document.getElementById('hotspotFormFields').style.display = 'none';
}

/**
 * Update link select options (exclude current image)
 */
function updateLinkSelectOptions() {
  const linkSelect = document.getElementById('hotspotLink');
  linkSelect.innerHTML = '';

  // Add placeholder option
  const placeholder = document.createElement('option');
  placeholder.value = '';
  placeholder.textContent = 'Select target image';
  placeholder.disabled = true;
  placeholder.selected = true;
  linkSelect.appendChild(placeholder);

  // Add image options, excluding the current image
  let hasOptions = false;
  Object.keys(images).forEach(key => {
    if (key === currentImageKey) return; // Skip current image

    const option = document.createElement('option');
    option.value = key;
    option.textContent = images[key].name;
    linkSelect.appendChild(option);
    hasOptions = true;
  });

  // If no options, add a "no other images" option
  if (!hasOptions) {
    const noOption = document.createElement('option');
    noOption.value = '';
    noOption.textContent = 'No other images available';
    noOption.disabled = true;
    linkSelect.appendChild(noOption);
  }
}

export {
  enableHotspotFields,
  disableHotspotFields,
  updateLinkSelectOptions
};
