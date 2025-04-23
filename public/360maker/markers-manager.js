// markers-manager.js - Handling markers for node links
import { getCurrentNodeId, addNodeLink } from './nodes-manager.js';
import { getViewer } from './viewer.js';
import { generateUniqueId } from './utils.js';
import { showNotification } from './ui-manager.js';

// Module state
let viewer = null;
let markersPlugin = null;
let isAddingLink = false;
let linkOverlay = null;
let pendingLinkTarget = null;

// Base64 encoded arrow icon
const ARROW_ICON = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0OCA0OCIgd2lkdGg9IjQ4IiBoZWlnaHQ9IjQ4Ij48cGF0aCBmaWxsPSIjZmZmZmZmIiBkPSJNMjQgNEwxMiAyMmgxMlYzNmgxMlYyMmgxMkwyNCA0eiIgc3Ryb2tlPSIjMDAwMDAwIiBzdHJva2Utd2lkdGg9IjIiLz48L3N2Zz4=';

/**
 * Set up marker placement for node links
 * @param {Object} viewerInstance - Viewer instance
 * @param {Object} markersPluginInstance - Markers plugin instance
 */
function setupMarkerPlacement(viewerInstance, markersPluginInstance) {
    viewer = viewerInstance;
    markersPlugin = markersPluginInstance;

    setupLinkHandlers();
    console.log('Marker placement initialized');
}

/**
 * Set up handlers for link creation
 */
function setupLinkHandlers() {
    // Create an overlay div for capturing clicks
    if (!linkOverlay) {
        linkOverlay = document.createElement('div');
        linkOverlay.id = 'linkOverlay';
        linkOverlay.className = 'link-overlay';
        linkOverlay.style.display = 'none';
        linkOverlay.style.position = 'absolute';
        linkOverlay.style.top = '0';
        linkOverlay.style.left = '0';
        linkOverlay.style.width = '100%';
        linkOverlay.style.height = '100%';
        linkOverlay.style.zIndex = '10';

        if (viewer && viewer.container && viewer.container.parentNode) {
            viewer.container.parentNode.appendChild(linkOverlay);

            // Add click handler for link placement
            linkOverlay.addEventListener('click', handleLinkPlacement);
        }
    }
}

/**
 * Start the process of adding a link
 * @param {string} targetNodeId - ID of the target node to link to
 */
function startAddingLink(targetNodeId) {
    if (!targetNodeId) {
        showNotification('Please select a target node', 'warning');
        return;
    }

    pendingLinkTarget = targetNodeId;
    isAddingLink = true;

    if (linkOverlay) {
        linkOverlay.style.display = 'block';
    }

    // Show the link help overlay
    const linkHelp = document.getElementById('linkHelp');
    if (linkHelp) {
        linkHelp.style.display = 'block';
    }

    showNotification('Click where you want to place the link marker', 'info');
}

/**
 * Cancel adding a link
 */
function cancelAddingLink() {
    pendingLinkTarget = null;
    isAddingLink = false;

    if (linkOverlay) {
        linkOverlay.style.display = 'none';
    }

    // Hide the link help overlay
    const linkHelp = document.getElementById('linkHelp');
    if (linkHelp) {
        linkHelp.style.display = 'none';
    }
}

/**
 * Handle link marker placement on click
 * @param {Object} event - Click event
 */
function handleLinkPlacement(event) {
    if (!isAddingLink || !pendingLinkTarget || !viewer || !markersPlugin) return;

    event.preventDefault();
    event.stopPropagation();

    // Get click position in the viewer
    const rect = viewer.container.getBoundingClientRect();
    const viewerPoint = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
    };

    // Convert mouse coordinates to sphere coordinates
    const position = viewer.dataHelper.viewerCoordsToSphericalCoords({
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
    });

    // Create a new marker for the link
    createLinkMarker(position, pendingLinkTarget);

    // Reset the adding state
    toggleLinkMode(null);

    // Save the tour
    saveTour();
}

/**
 * Create a link marker at the specified position
 * @param {Object} position - Position with yaw and pitch
 * @param {string} targetNodeId - ID of the target node
 */
function createLinkMarker(position, targetNodeId) {
    if (!markersPlugin) return;

    // Get current node ID
    const sourceNodeId = getCurrentNodeId();
    if (!sourceNodeId) {
        showNotification('No active panorama selected', 'error');
        return;
    }

    // Create a unique ID for the marker
    const markerId = `link-${generateUniqueId()}`;

    // Create marker data
    const markerData = {
        id: markerId,
        position: position,
        image: ARROW_ICON,
        width: 32,
        height: 32,
        anchor: 'center',
        tooltip: `Link to node ${targetNodeId}`,
        data: {
            isLink: true,
            type: 'link',
            targetNodeId: targetNodeId,
            createdAt: new Date().toISOString()
        }
    };

    // Add marker to view
    markersPlugin.addMarker(markerData);

    // Store link data
    addNodeLink(sourceNodeId, markerId, targetNodeId, markerData);

    // Show success notification
    showNotification('Link marker added successfully!', 'success');

    // Enable undo button
    document.getElementById('undoBtn').disabled = false;

    console.log('Added link marker from node:', sourceNodeId, 'to node:', targetNodeId, markerData);
    return markerData;
}

/**
 * Clear and restore markers for a node
 * @param {string} nodeId - ID of the node
 * @param {Array} markers - Array of marker objects
 */
function clearAndRestoreMarkers(nodeId, markers) {
    if (!markersPlugin) return;

    // Clear existing markers
    markersPlugin.clearMarkers();

    // Add markers back if provided
    if (markers && markers.length > 0) {
        markers.forEach(marker => {
            markersPlugin.addMarker(marker);
        });
    }
}

/**
 * Check if currently adding a link
 * @returns {boolean} True if adding a link
 */
function getIsAddingLink() {
    return isAddingLink;
}

/**
 * Set the target node ID for a link
 * @param {string} targetId - ID of the target node
 */
function setPendingLinkTarget(targetId) {
    pendingLinkTarget = targetId;
    startAddingLink(targetId);
}

export {
    setupMarkerPlacement,
    clearAndRestoreMarkers,
    getIsAddingLink as isAddingLink,
    setPendingLinkTarget,
    startAddingLink,
    cancelAddingLink
};
