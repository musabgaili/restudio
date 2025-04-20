/**
 * dataHandlers.js
 * Functions for saving, loading, and exporting tour data
 */

import { images, hotspots } from './state.js';
import { addImageToList, loadImage } from './imageHandlers.js';

/**
 * Export hotspots as JSON data
 */
function exportHotspots() {
  const exportData = {
    scenes: {},
    default: {
      firstScene: Object.keys(images)[0] || ''
    }
  };

  // Format export data
  Object.keys(images).forEach(key => {
    if (!images[key]) return;

    exportData.scenes[key] = {
      title: images[key].name,
      panorama: images[key].url,
      hotSpots: hotspots[key].map(hs => {
        const id = `hotspot-${Math.random().toString(36).slice(2, 11)}`;

        if (hs.type === 'scene') {
          return {
            id: id,
            pitch: hs.pitch,
            yaw: hs.yaw,
            type: 'scene',
            text: hs.text,
            sceneId: hs.sceneId,
            targetPitch: hs.targetPitch || 0,
            targetYaw: hs.targetYaw || 0
          };
        } else {
          return {
            id: id,
            pitch: hs.pitch,
            yaw: hs.yaw,
            type: 'info',
            text: hs.text
          };
        }
      })
    };
  });

  // Display the JSON in the output area
  document.getElementById('hotspotsJson').textContent = JSON.stringify(exportData, null, 2);
}

/**
 * Save project state to localStorage
 */
function saveProject() {
  const projectData = {
    images: images,
    hotspots: hotspots
  };

  // Convert to JSON string
  const projectJSON = JSON.stringify(projectData);

  // Save to localStorage
  localStorage.setItem('360tourProject', projectJSON);
  alert('Project saved successfully!');
}

/**
 * Load project state from localStorage
 */
function loadProject() {
  const projectJSON = localStorage.getItem('360tourProject');

  if (!projectJSON) {
    alert('No saved project found.');
    return;
  }

  try {
    const projectData = JSON.parse(projectJSON);
    loadProjectData(projectData);
    alert('Project loaded successfully!');
  } catch (error) {
    console.error('Error loading project:', error);
    alert('Error loading project. Please try again.');
  }
}

/**
 * Load project data from a project data object
 * @param {Object} projectData - The project data to load
 */
function loadProjectData(projectData) {
  const imageList = document.getElementById('imageList');

  try {
    // Clear existing data
    Object.keys(images).forEach(key => {
      if (images[key] && images[key].url) {
        URL.revokeObjectURL(images[key].url);
      }
    });

    // Reset objects
    Object.keys(images).forEach(key => delete images[key]);
    Object.keys(hotspots).forEach(key => delete hotspots[key]);

    // Load data
    if (projectData.images) {
      Object.keys(projectData.images).forEach(key => {
        images[key] = projectData.images[key];
      });
    }

    if (projectData.hotspots) {
      Object.keys(projectData.hotspots).forEach(key => {
        hotspots[key] = projectData.hotspots[key];
      });
    }

    // Rebuild image list
    imageList.innerHTML = '';

    if (Object.keys(images).length > 0) {
      Object.keys(images).forEach(key => {
        if (images[key] && images[key].name) {
          addImageToList(key, images[key].name);
        }
      });

      // Load first image
      loadImage(Object.keys(images)[0]);
    }
  } catch (error) {
    console.error('Error in loadProjectData:', error);
  }
}

export {
  exportHotspots,
  saveProject,
  loadProject,
  loadProjectData
};
