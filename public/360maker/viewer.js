// viewer.js - Photo Sphere Viewer management
import { Viewer } from '@photo-sphere-viewer/core';
import { VirtualTourPlugin } from '@photo-sphere-viewer/virtual-tour-plugin';
import { MarkersPlugin } from '@photo-sphere-viewer/markers-plugin';
import { createNodes, updateCurrentNodeId } from './nodes-manager.js';

// Module state
let viewer = null;
let tourPlugin = null;
let markersPlugin = null;

/**
 * Setup the viewer with provided nodes or images
 * @param {Array} items - Array of images or pre-formatted nodes
 * @returns {Object} The initialized viewer instance
 */
function setupViewer(items) {
    console.log('Setting up viewer with items:', items);

    // Destroy existing viewer if present
    if (viewer) {
        viewer.destroy();
        viewer = null;
    }

    if (!items || items.length === 0) {
        console.warn('No items provided to setupViewer');
        return null;
    }

    // Check if the items are pre-formatted nodes or raw images
    const isPreformattedNodes = items[0].panorama !== undefined;

    // Create nodes from images if needed
    const nodes = isPreformattedNodes ? items : createNodes(items);

    // Initialize the viewer
    try {
        viewer = new Viewer({
            container: document.getElementById('viewer'),
            panorama: isPreformattedNodes ? nodes[0].panorama : items[0].url,
            caption: isPreformattedNodes ? nodes[0].name : items[0].name,
            navbar: [
                'autorotate', 'zoom', 'fullscreen'
            ],
            plugins: [
                [VirtualTourPlugin, {
                    nodes: nodes,
                    startNodeId: nodes[0].id,
                    renderMode: '2d',
                    linksElements: false,
                }],
                MarkersPlugin,
            ],
        });

        // Get plugin references
        markersPlugin = viewer.getPlugin(MarkersPlugin);
        tourPlugin = viewer.getPlugin(VirtualTourPlugin);

        // Store tour plugin globally for accessibility
        window.tourPlugin = tourPlugin;

        // Setup event listeners
        viewer.addEventListener('ready', () => {
            console.log('Viewer ready, current node:', tourPlugin.getCurrentNode());
            updateCurrentNodeId(tourPlugin.getCurrentNode()?.id);

            // Add interaction handlers
            setupInteractionHandlers();
        });

        return viewer;
    } catch (error) {
        console.error('Error setting up viewer:', error);
        return null;
    }
}

/**
 * Setup interaction handlers for the viewer
 */
function setupInteractionHandlers() {
    if (!viewer || !markersPlugin || !tourPlugin) return;

    // Handle marker clicks (for navigation)
    markersPlugin.addEventListener('select-marker', (e) => {
        if (e.marker && e.marker.data) {
            console.log('Marker selected:', e.marker);

            // If the marker is a link, navigate to the target node
            if (e.marker.data.isLink && e.marker.data.targetNodeId) {
                console.log('Navigating to node:', e.marker.data.targetNodeId);
                tourPlugin.setCurrentNode(e.marker.data.targetNodeId);
            }
        }
    });

    // Handle node changes
    tourPlugin.addEventListener('node-changed', (e) => {
        console.log('Node changed:', e.node);
        updateCurrentNodeId(e.node.id);

        // Highlight the selected thumbnail
        document.querySelectorAll('.thumb').forEach(el => el.classList.remove('selected'));
        document.getElementById(`thumb-${e.node.id}`)?.classList.add('selected');
    });
}

/**
 * Change the current panorama image/node
 * @param {string} nodeId - ID of the node to display
 */
function changeNode(nodeId) {
    console.log('Changing to node:', nodeId);

    if (!tourPlugin) {
        console.warn('Tour plugin not available');
        return;
    }

    tourPlugin.setCurrentNode(nodeId);
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

/**
 * Get tour plugin instance
 * @returns {Object} The tour plugin instance
 */
function getTourPlugin() {
    return tourPlugin;
}

export {
    setupViewer,
    getViewer,
    getMarkersPlugin,
    getTourPlugin,
    changeNode
};
