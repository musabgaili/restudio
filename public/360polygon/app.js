// app.js - Main application entry point for polygon editor
import { setupViewer, changeImage, getMarkersPlugin } from './viewer.js';
import {
    initializeNodeManager,
    getCurrentNodeId,
    undoLastAction,
    canUndo,
    clearNodePolygons,
    clearNodeTexts
} from './nodes-manager.js';
import { initializeUIHandlers, showNotification } from './ui-manager.js';
import {
    generateRandomPolygons,
    clearAllPolygons,
    savePolygonData,
    isInDrawingMode
} from './polygon-manager.js';
import {
    initializeTextManager,
    isInTextMode
} from './text-manager.js';

// Global app state
let images = [];

/**
 * Initialize the application
 */
function initApp() {
    // Initialize components
    initializeUIHandlers({
        onImagesUploaded: handleImagesUploaded,
        onImageSelected: handleImageSelected,
        onGeneratePolygons: handleGeneratePolygons,
        onClearPolygons: handleClearAll,
        onSaveAll: handleSaveAll
    });

    initializeNodeManager();

    // Set up undo button
    setupUndoButton();

    // Log that the app is ready
    console.log('Polygon editor application initialized');
}

/**
 * Set up the undo button functionality
 */
function setupUndoButton() {
    const undoBtn = document.getElementById('undoBtn');
    if (undoBtn) {
        undoBtn.addEventListener('click', handleUndo);
        // Initial state - disabled
        undoBtn.disabled = true;
    }
}

/**
 * Handle the undo button click
 */
function handleUndo() {
    // Get markers plugin
    const markersPlugin = getMarkersPlugin();
    if (!markersPlugin) return;

    // Perform undo operation
    const undoneAction = undoLastAction(markersPlugin);

    if (undoneAction) {
        // Show notification about what was undone
        let actionDescription = '';
        switch (undoneAction.type) {
            case 'add_polygon':
                actionDescription = 'Added polygon';
                break;
            case 'add_text':
                actionDescription = 'Added text';
                break;
            case 'remove_polygon':
                actionDescription = 'Removed polygon';
                break;
            case 'remove_text':
                actionDescription = 'Removed text';
                break;
            case 'clear_polygons':
                actionDescription = 'Cleared all polygons';
                break;
            case 'clear_texts':
                actionDescription = 'Cleared all texts';
                break;
        }

        showNotification(`Undid: ${actionDescription}`, 'info');
    }

    // Disable undo button if no more actions
    if (!canUndo()) {
        const undoBtn = document.getElementById('undoBtn');
        if (undoBtn) {
            undoBtn.disabled = true;
        }
    }
}

/**
 * Handle when user uploads images
 * @param {Array} uploadedImages - Array of uploaded image objects
 */
function handleImagesUploaded(uploadedImages) {
    images = uploadedImages;
    const viewer = setupViewer(images);

    // Initialize text manager after viewer is set up
    if (viewer) {
        initializeTextManager(viewer, getMarkersPlugin());
    }

    showNotification(`Uploaded ${images.length} images successfully!`, 'success');
}

/**
 * Handle when user selects an image from the list
 * @param {string} imageId - ID of the selected image
 */
function handleImageSelected(imageId) {
    // If in drawing mode or text mode, prevent changing images
    if (isInDrawingMode()) {
        showNotification('Please finish or cancel your polygon before changing images.', 'warning');
        return;
    }

    if (isInTextMode()) {
        showNotification('Please finish or cancel your text before changing images.', 'warning');
        return;
    }

    changeImage(imageId, images);
}

/**
 * Handle request to generate random polygons
 * @param {number} count - Number of polygons to generate
 * @param {number} complexity - Number of points per polygon
 * @param {boolean} fill - Whether to fill the polygons
 */
function handleGeneratePolygons(count, complexity, fill) {
    if (images.length === 0) {
        showNotification('Please upload at least one image first.', 'warning');
        return;
    }

    // If in drawing mode or text mode, prevent generating polygons
    if (isInDrawingMode()) {
        showNotification('Please finish or cancel your polygon before generating random polygons.', 'warning');
        return;
    }

    if (isInTextMode()) {
        showNotification('Please finish or cancel your text before generating random polygons.', 'warning');
        return;
    }

    generateRandomPolygons(count, complexity, fill);
    showNotification(`Generated ${count} random polygons with ${complexity} points each.`, 'success');
}

/**
 * Handle request to clear all elements (polygons and text)
 */
function handleClearAll() {
    if (images.length === 0) {
        showNotification('No images loaded.', 'warning');
        return;
    }

    // If in drawing mode or text mode, prevent clearing
    if (isInDrawingMode()) {
        showNotification('Please finish or cancel your polygon before clearing.', 'warning');
        return;
    }

    if (isInTextMode()) {
        showNotification('Please finish or cancel your text before clearing.', 'warning');
        return;
    }

    const markersPlugin = getMarkersPlugin();
    if (markersPlugin) {
        // Clear all markers from view
        markersPlugin.clearMarkers();

        // Clear data structures
        const currentNodeId = getCurrentNodeId();
        if (currentNodeId) {
            clearNodePolygons(currentNodeId);
            clearNodeTexts(currentNodeId);
        }

        showNotification('All elements cleared.', 'info');
    }
}

/**
 * Handle saving all data
 */
function handleSaveAll() {
    if (images.length === 0) {
        showNotification('No data to save. Please upload images first.', 'warning');
        return;
    }

    // If in drawing mode or text mode, prevent saving
    if (isInDrawingMode()) {
        showNotification('Please finish or cancel your polygon before saving.', 'warning');
        return;
    }

    if (isInTextMode()) {
        showNotification('Please finish or cancel your text before saving.', 'warning');
        return;
    }

    // Prepare a payload with all data
    savePolygonData(images)
        .then(result => {
            showNotification('Data saved successfully!', 'success');
        })
        .catch(error => {
            showNotification('Failed to save data: ' + error.message, 'danger');
        });
}

// Export functions and data that might be needed elsewhere
export {
    initApp,
    images,
    getCurrentNodeId
};

// Initialize the app when DOM is ready
document.addEventListener('DOMContentLoaded', initApp);
