// markers-manager.js - Handling marker creation and management
import { getCurrentNodeId, addMarkerToNode, addNodeLink, getNodeMarkers } from './nodes-manager.js';
import { getTourPlugin } from './viewer.js';

// Module state
let pendingLinkTarget = null;

// Set up click handler for placing markers
function setupMarkerPlacement(viewer, markersPlugin) {

    viewer.container.addEventListener('click', (event) => {
        if (!pendingLinkTarget) return;

        // Calculate accurate position from mouse click
        const rect = viewer.container.getBoundingClientRect();
        const size = viewer.getSize();  // Using correct method

        const x = (event.clientX - rect.left) * size.width / rect.width;
        const y = (event.clientY - rect.top) * size.height / rect.height;

        const position = viewer.dataHelper.viewerCoordsToSphericalCoords({ x, y });

        if (!position) {
            console.warn('⚠️ No position found from mouse event!');
            return;
        }

        const markerId = 'marker-' + Date.now();
        const currentNodeId = getCurrentNodeId();

        // New marker data object with correct structure
        const markerData = {
            id: markerId,
            position: {
                yaw: position.yaw,    // Explicitly store yaw
                pitch: position.pitch  // Explicitly store pitch
            },
            image: window.markerImageUrl,
            size: {
                width: 32,
                height: 32
            },
            anchor: 'bottom center',
            tooltip: targetSelect ? 'Go to ' + targetSelect.options[targetSelect.selectedIndex].text : 'Go to image', // Show destination name
            data: {
                targetNodeId: pendingLinkTarget // This will be the node-X format
            }
        };

        // Add marker to view
        markersPlugin.addMarker(markerData);

        // Store marker in node data
        addMarkerToNode(currentNodeId, markerData);

        // Add link between nodes
        addNodeLink(currentNodeId, pendingLinkTarget, {
            yaw: position.yaw,
            pitch: position.pitch
        });

        // Reset pending state
        pendingLinkTarget = null;
        document.getElementById('linkDropdown').style.display = 'none';

        // Log for debugging
        console.log('Added marker at position:', { yaw: position.yaw, pitch: position.pitch });

        // Log the marker for debugging
        console.log('Created marker with target node ID:', pendingLinkTarget);

        // Add click event handler for this marker
        markersPlugin.addEventListener('select-marker', (e) => {
            if (e.marker && e.marker.data && e.marker.data.targetNodeId) {
                const tour = getTourPlugin();
                if (tour) {
                    tour.setCurrentNode(e.marker.data.targetNodeId);
                }
            }
        });
        // End of Add click event handler for this marker
    });
}

// Clear all markers and restore markers for current node
function clearAndRestoreMarkers(markersPlugin, nodeId) {
    // Clear existing markers
    markersPlugin.clearMarkers();

    // Restore markers for this node
    const nodeMarkers = getNodeMarkers(nodeId);

    if (nodeMarkers && nodeMarkers.length > 0) {
        console.log('Restoring markers for node', nodeId, nodeMarkers);

        nodeMarkers.forEach(marker => {
            // Make sure the marker has correct position format
            const fixedMarker = {
                ...marker,
                // Ensure position is properly formatted as {yaw, pitch} object
                position: {
                    yaw: marker.position.yaw,
                    pitch: marker.position.pitch
                }
            };

            // Debug the marker being restored
            console.log('Restoring marker with position:', fixedMarker.position);

            // Add marker with explicit position
            markersPlugin.addMarker(fixedMarker);
        });
    }
}

// Setup marker click navigation
function setupMarkerClickNavigation(markersPlugin) {
    markersPlugin.addEventListener('select-marker', (e) => {
        if (e.marker && e.marker.data && e.marker.data.targetNodeId) {
            const tourPlugin = window.tourPlugin; // We'll set this globally
            if (tourPlugin) {
                console.log('Navigating to node:', e.marker.data.targetNodeId);
                tourPlugin.setCurrentNode(e.marker.data.targetNodeId);
            }
        }
    });
}

// Set pending link target
function setPendingLinkTarget(targetId) {
    pendingLinkTarget = targetId;
}

// Get pending link target
function getPendingLinkTarget() {
    return pendingLinkTarget;
}

export {
    setupMarkerPlacement,
    clearAndRestoreMarkers,
    setPendingLinkTarget,
    getPendingLinkTarget,
    pendingLinkTarget,  // Exporting for global access
    setupMarkerClickNavigation
};
