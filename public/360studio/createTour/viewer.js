// viewer.js - Photo Sphere Viewer management
import { Viewer } from '@photo-sphere-viewer/core';
import { VirtualTourPlugin } from '@photo-sphere-viewer/virtual-tour-plugin';
import { MarkersPlugin } from '@photo-sphere-viewer/markers-plugin';
import { createNodes, updateCurrentNodeId } from './nodes-manager.js';
import { setupMarkerPlacement, clearAndRestoreMarkers, setupMarkerClickNavigation } from './markers-manager.js';
import { highlightSelectedThumbnail } from './ui-manager.js';

// Module state
let viewer = null;
let tour = null;
let markersPlugin = null;

// Setup the viewer with provided images
function setupViewer(images) {
    // Destroy existing viewer if present
    if (viewer) {
        viewer.destroy();
        viewer = null;
    }

    // Create nodes from images
    const nodes = createNodes(images);

    // Initialize the viewer
    viewer = new Viewer({
        container: document.getElementById('viewer'),
        plugins: [
            MarkersPlugin,
            [VirtualTourPlugin, {
                nodes: nodes,
                startNodeId: images[0]?.id,
                // renderMode: 'markers',  // Only use markers, hide default nodes
                // Or if that doesn't work, try:
                linksElements: false, // Hide the default node links
            }],
        ],
    });

    // Get plugin references
    markersPlugin = viewer.getPlugin(MarkersPlugin);
    tour = viewer.getPlugin(VirtualTourPlugin);
    // Store tour plugin globally for marker navigation
    window.tourPlugin = tour;
    // Set up marker click navigation
    setupMarkerClickNavigation(markersPlugin);

    // Setup event listeners
    viewer.addEventListener('ready', () => {
        const currentNodeId = tour.getCurrentNode()?.id;
        updateCurrentNodeId(currentNodeId);

        document.getElementById('linkControls').style.display = 'block';
        setupMarkerPlacement(viewer, markersPlugin);
        highlightSelectedThumbnail(currentNodeId);
    });

    // Handle node changes
    tour.addEventListener('node-changed', (e) => {
        const nodeId = e.node.id;
        updateCurrentNodeId(nodeId);
        highlightSelectedThumbnail(nodeId);
        clearAndRestoreMarkers(markersPlugin, nodeId);
    });
}

// Get viewer instance
function getViewer() {
    return viewer;
}

// Get tour plugin instance
function getTourPlugin() {
    return tour;
}

// Get markers plugin instance
function getMarkersPlugin() {
    return markersPlugin;
}

export {
    setupViewer,
    getViewer,
    getTourPlugin,
    getMarkersPlugin
};
