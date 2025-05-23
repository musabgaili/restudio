// app.js - Main application entry point for polygon editor
import { setupViewer, changeImage, getMarkersPlugin, getViewer } from './viewer.js';
import {
    initializeNodeManager,
    getCurrentNodeId,
    updateCurrentNodeId,
    undoLastAction,
    canUndo,
    clearNodePolygons,
    clearNodeTexts,
    getNodes,
    getNodePolygons,
    getNodeTexts
} from './nodes-manager.js';
import { initializeUIHandlers, showNotification } from './ui-manager.js';
import {
    generateRandomPolygons,
    clearAllPolygons,
    savePolygonData,
    isInDrawingMode,
    restorePolygons
} from './polygon-manager.js';
import {
    initializeTextManager,
    isInTextMode
} from './text-manager.js';

// Global app state
let images = [];
let globalNodeMarkers = {}; // Store node markers globally so they can be accessed in changeNodeImage
let isSaving = false; // Flag to prevent double execution of save

/**
 * Initialize the application
 * @param {Array} apiNodes - Array of node objects from API
 */
function initApp(apiNodes = []) {
    console.log('Init App with nodes:', apiNodes);

    // Initialize components
    initializeUIHandlers({
        onImagesUploaded: handleImagesUploaded,
        onImageSelected: handleImageSelected,
        onGeneratePolygons: handleGeneratePolygons,
        onClearPolygons: handleClearAll,
        onSaveAll: handleSaveAll
    });

    // Initialize node manager with API data
    initializeNodeManager(apiNodes);

    // Process markers for navigation between nodes
    const nodeMarkers = processNodeMarkers(apiNodes);
    console.log('Node markers:', nodeMarkers);

    // Store node markers globally for later use
    globalNodeMarkers = nodeMarkers;

    // Log stored nodes after initialization
    console.log('Stored nodes after initialization:', getNodes());

    // Set up undo button
    setupUndoButton();

    // Create viewer if we have nodes
    if (apiNodes && apiNodes.length > 0) {
        const apiImages = apiNodes.map(node => ({
            id: node.id,
            name: node.name,
            url: node.media && node.media.length > 0 && node.media[0].original_url ?
                node.media[0].original_url :
                `/storage/${node.panorama_path}`,
            thumbnail: node.media && node.media.length > 0 && node.media[0].original_url ?
                node.media[0].original_url :
                `/storage/${node.thumbnail_path}`
        }));

        images = apiImages;

        // Find the start node if available, otherwise use the first node
        const startNode = apiNodes.find(node => node.start_node) || apiNodes[0];
        const startImage = apiImages.find(img => img.id === startNode.id) || apiImages[0];

        console.log('Starting with image:', startImage);

        // Initialize viewer with all images
        const viewer = setupViewer(apiImages);

        // Initialize text manager after viewer is set up
        if (viewer) {
            initializeTextManager(viewer, getMarkersPlugin());

            // Wait for viewer to be ready, then load polygons and texts
            viewer.addEventListener('ready', () => {
                const markersPlugin = getMarkersPlugin();
                if (markersPlugin) {
                    // Load the node's polygons and texts
                    const nodeId = startNode.id;
                    updateCurrentNodeId(nodeId);
                    console.log('Set current node ID to:', nodeId);

                    const nodePolygons = getNodePolygons(nodeId);
                    const nodeTexts = getNodeTexts(nodeId);

                    // Add polygons to the view
                    nodePolygons.forEach(polygon => {
                        markersPlugin.addMarker(polygon);
                    });

                    // Add texts to the view
                    nodeTexts.forEach(text => {
                        markersPlugin.addMarker(text);
                    });

                    // Add navigation markers for the current node
                    const currentNodeMarkers = nodeMarkers[nodeId] || [];
                    currentNodeMarkers.forEach(marker => {
                        markersPlugin.addMarker(marker);
                    });

                    // Set up marker click event
                    setupMarkerListeners(markersPlugin);
                }
            });
        }
    }

    // Log that the app is ready
    console.log('Polygon editor application initialized with nodes');
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
    console.log('handleSaveAll, starting the save operation' + isSaving);

    // If a save is already in progress, don't start another one
    if (isSaving) {
        console.log('handleSaveAll Save operation already in progress, skipping duplicate call');
        return;
    }

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
    // savePolygonData(images)
    //     .then(result => {
    //         showNotification('Data saved successfully!', 'success');
    //     })
    //     .catch(error => {
    //         showNotification('Failed to save data: ' + error.message, 'danger');
    //     });
    // Prepare and send data
    handleSaveTours();
}

/**
 * Save polygon and text data to the server
 */
function handleSaveTours() {
    // Prevent multiple simultaneous save operations
    if (isSaving) {
        console.log('handleSaveTours Save operation already in progress, skipping duplicate call');
        return;
    }

    isSaving = true; // Set flag to indicate save in progress

    const nodes = getNodes();
    if (!nodes || nodes.length === 0) {
        showNotification('No nodes data to save.', 'warning');
        isSaving = false; // Reset flag
        return;
    }

    let tourId = nodes[0]?.virtual_tour_id;
    if (!tourId) {
        // Get tour ID from the DOM if not in nodes data
        const tourIdElement = document.getElementById('shit');
        if (tourIdElement && tourIdElement.dataset.tourId) {
            tourId = tourIdElement.dataset.tourId;
        } else {
            showNotification('Missing tour ID. Cannot save data.', 'danger');
            isSaving = false; // Reset flag
            return;
        }
    }

    const payload = {
        nodes: nodes.map(node => {
            return {
                id: node.id,
                name: node.name,
                polygons: getNodePolygons(node.id),
                texts: getNodeTexts(node.id),
                panorama: node.panorama_path
            };
        })
    };

    // Log the request payload
    console.log('Sending payload:', payload);

    // Send request to API - using the correct endpoint from routes
    fetch(`/api/studio/tours/${tourId}/polygons`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content
        },
        body: JSON.stringify(payload)
    })
        .then(response => {
            console.log('Response:', response);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            console.log('Success:', data);
            showNotification('Data saved successfully!', 'success');
            isSaving = false; // Reset flag after successful save
        })
        .catch(error => {
            console.log('Error:', error);
            console.error('Error:', error);
            showNotification('Error saving data: ' + error.message, 'danger');
            isSaving = false; // Reset flag after error
        });
}

/**
 * Change the current panorama image based on node ID
 * @param {string} nodeId - ID of the node to display
 */
function changeNodeImage(nodeId) {
    // Convert nodeId to integer for comparison
    const nodeIdInt = parseInt(nodeId);
    console.log('Changing node image to ID:', nodeIdInt);

    // If in drawing mode or text mode, prevent changing images
    if (isInDrawingMode()) {
        showNotification('Please finish or cancel your polygon before changing images.', 'warning');
        return;
    }

    if (isInTextMode()) {
        showNotification('Please finish or cancel your text before changing images.', 'warning');
        return;
    }

    // Get the current node ID before changing
    const previousNodeId = getCurrentNodeId();
    console.log('Previous node ID:', previousNodeId);

    // Use the images array which is already formatted for the viewer
    const imageToShow = images.find(img => parseInt(img.id) === nodeIdInt);
    if (!imageToShow) {
        console.error('Image not found for node ID:', nodeIdInt);
        console.log('Available images:', images);
        return;
    }

    console.log('Found image for node:', imageToShow);

    // Log global marker state for debugging
    console.log('Global node markers before change:', globalNodeMarkers);
    console.log(`Looking for markers with key ${nodeIdInt}:`, globalNodeMarkers[nodeIdInt]);

    // Update the current node ID before changing the image
    updateCurrentNodeId(nodeIdInt);

    // Use the existing changeImage function which is already compatible with the viewer
    changeImage(nodeIdInt, images);

    // After changing the image, load the polygons and texts for this node
    const markersPlugin = getMarkersPlugin();
    if (markersPlugin) {
        // Clear existing markers
        markersPlugin.clearMarkers();

        // Use the restorePolygons function to load polygons and texts
        const restoration = restorePolygons(nodeIdInt, markersPlugin);
        console.log(`Restored ${restoration?.polygonsCount || 0} polygons and ${restoration?.textsCount || 0} texts for node ${nodeIdInt}`);

        // Add navigation markers for this node
        const currentNodeMarkers = globalNodeMarkers[nodeIdInt] || [];
        console.log(`Loading markers for node ${nodeIdInt}:`, currentNodeMarkers);

        if (currentNodeMarkers.length > 0) {
            // Add the markers to the view
            currentNodeMarkers.forEach(marker => {
                try {
                    markersPlugin.addMarker(marker);
                } catch (e) {
                    console.error(`Error adding marker ${marker.id}:`, e);
                }
            });
        } else {
            console.log(`No markers found for node ${nodeIdInt}`);
        }

        // Set up marker click event listeners
        setupMarkerListeners(markersPlugin);

        showNotification(`Loaded image: ${imageToShow.name}`, 'info');
    }
}

/**
 * Process markers from the nodes and create marker objects for the viewer
 * @param {Array} nodes - Array of node objects
 * @returns {Object} Mapping of nodeId to array of markers
 */
function processNodeMarkers(nodes) {
    const nodeMarkers = {};

    nodes.forEach(node => {
        const nodeId = parseInt(node.id); // Ensure nodeId is an integer

        // Skip if node has no markers
        if (!node.markers || node.markers.length === 0) {
            console.log(`Node ${nodeId} has no markers`);
            nodeMarkers[nodeId] = [];
            return;
        }

        console.log(`Processing ${node.markers.length} markers for node ${nodeId}`);

        const markers = node.markers.map(marker => {
            // Parse the position JSON string to an object if needed
            let position;
            try {
                position = typeof marker.position === 'string' ?
                    JSON.parse(marker.position) : marker.position;

                if (!position || (typeof position === 'object' && !position.yaw)) {
                    console.warn(`Invalid marker position for marker ${marker.id}:`, marker.position);
                    // Provide default position if missing or invalid
                    position = { yaw: 0, pitch: 0 };
                }
            } catch (e) {
                console.error(`Error parsing marker position for marker ${marker.id}:`, e);
                position = { yaw: 0, pitch: 0 };
            }

            const markerObj = {
                id: `marker-${marker.id}`,
                position: position,

                // Use HTML instead of image for marker content
                html: `<div class="tour-marker"></div>`,

                // Additional properties
                tooltip: `Link to ${marker.target_node_id ? `Node ${marker.target_node_id}` : 'another view'}`,
                size: { width: 32, height: 32 },
                anchor: 'bottom center',

                // Store the target node for navigation
                data: {
                    targetNodeId: marker.target_node_id
                }
            };

            console.log(`Created marker object for marker ${marker.id}:`, markerObj);
            return markerObj;
        });

        nodeMarkers[nodeId] = markers;
        console.log(`Stored ${markers.length} markers for node ${nodeId}`);
    });

    return nodeMarkers;
}

/**
 * Set up marker click event listeners
 * @param {Object} markersPlugin - The markers plugin
 */
function setupMarkerListeners(markersPlugin) {
    // Remove any existing listener first to avoid duplicates
    markersPlugin.removeEventListener('select-marker');

    // Add the marker click listener
    markersPlugin.addEventListener('select-marker', (event) => {
        console.log('Marker selected:', event.marker);
        if (event.marker && event.marker.data && event.marker.data.targetNodeId) {
            const targetNodeId = event.marker.data.targetNodeId;
            console.log(`Navigating to node: ${targetNodeId}`);
            changeNodeImage(targetNodeId);
        }
    });

    console.log('Marker listeners set up');
}

// Export functions and data that might be needed elsewhere
export {
    initApp,
    images,
    getCurrentNodeId,
    handleSaveTours,
    handleSaveAll,
    changeNodeImage,
    processNodeMarkers,
    setupMarkerListeners
};

// Initialize the app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const nodesElement = document.getElementById('nodes');
    let nodesData = [];
    if (nodesElement) {
        try {
            nodesData = JSON.parse(nodesElement.textContent || '[]');
        } catch (error) {
            console.error('Error parsing nodes JSON:', error);
        }
    }
    initApp(nodesData);
});
