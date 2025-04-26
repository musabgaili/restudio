// viewer.js - Photo Sphere Viewer management for polygons
import { Viewer } from '@photo-sphere-viewer/core';
import { MarkersPlugin } from '@photo-sphere-viewer/markers-plugin';
import { createNodes, updateCurrentNodeId } from './nodes-manager.js';
import { setupPolygonGeneration, clearAllPolygons } from './polygon-manager.js';
import { highlightSelectedThumbnail } from './ui-manager.js';

// Module state
let viewer = null;
let markersPlugin = null;

/**
 * Setup the viewer with provided images
 * @param {Array} images - Array of image objects to display in the viewer
 * @returns {Object} The initialized viewer instance
 */
function setupViewer(images) {
    // Destroy existing viewer if present
    if (viewer) {
        viewer.destroy();
        viewer = null;
    }

    // Create nodes from images
    const nodes = createNodes(images);

    // Initialize the viewer with first image if available
    if (images.length > 0) {
        viewer = new Viewer({
            container: document.getElementById('viewer'),
            panorama: images[0].url,
            plugins: [
                [MarkersPlugin, {
                    // Configure markers plugin for polygons
                    markers: []
                }],
            ],
        });

        // Get plugin references
        markersPlugin = viewer.getPlugin(MarkersPlugin);

        // Setup event listeners
        viewer.addEventListener('ready', () => {
            updateCurrentNodeId(images[0].id);
            setupPolygonGeneration(viewer, markersPlugin);
            highlightSelectedThumbnail(images[0].id);
        });

        return viewer;
    }

    return null;
}

/**
 * Change the current panorama image
 * @param {string} imageId - ID of the image to display
 * @param {Array} images - Array of all available images
 */
function changeImage(imageId, images) {
    const image = images.find(img => img.id === imageId);
    if (!image || !viewer) return;

    // Save current polygons before changing
    clearAllPolygons(markersPlugin);

    // Change panorama
    viewer.setPanorama(image.url).then(() => {
        updateCurrentNodeId(imageId);
        highlightSelectedThumbnail(imageId);
    });
}

/**
 * Get viewer instance
 * @returns {Object} The viewer instance
 */
function getViewer() {
    return viewer;
}

/**
 * Get markers plugin instance
 * @returns {Object} The markers plugin instance
 */
function getMarkersPlugin() {
    return markersPlugin;
}

export {
    setupViewer,
    getViewer,
    getMarkersPlugin,
    changeImage
};
