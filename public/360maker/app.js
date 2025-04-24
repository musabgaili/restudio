// app.js - Main application entry point for 360 Tour Studio
import { setupViewer, getViewer, getMarkersPlugin, getTourPlugin } from './viewer.js';
import {
    initializeNodeManager,
    getCurrentNodeId,
    getNodes,
    addNodeLink,
    getNodeMarkers,
    getNodePolygons,
    getNodeTexts,
    undoLastAction,
    canUndo
} from './nodes-manager.js';
import {
    initializeUIHandlers,
    showNotification,
    getSelectedStrokeWidth
} from './ui-manager.js';

import {
    initializePolygonManager,
    isInDrawingMode,
    setupPolygonGeneration,
    setupPolygonDragging,
    toggleDrawingMode,
    finishDrawingPolygon,
    currentDrawingPoints
} from './polygon-manager.js';

import {
    initializeTextManager,
    isInTextMode,
    toggleTextMode
} from './text-manager.js';

import {
    setupMarkerPlacement,
    clearAndRestoreMarkers,
    setPendingLinkTarget,
    startAddingLink,
    isAddingLink
} from './markers-manager.js';

// Global app state
let images = [];
let pendingLinkTarget = null;

/**
 * Initialize the application
 */
function initApp() {
    console.log('Initializing 360 Tour Studio application');

    // Initialize components
    initializeUIHandlers({
        onImagesUploaded: handleImagesUploaded,
        onImageSelected: handleImageSelected,
        onAddLinkRequest: handleAddLinkRequest,
        onPolygonDrawingRequested: handlePolygonDrawingRequested,
        onTextAdditionRequested: handleTextAdditionRequested,
        onClearAllRequested: handleClearAll,
        onSaveRequested: handleSaveAll,
        onUndoRequested: handleUndo
    });

    initializeNodeManager();

    // Handle load request if in view mode with a tour ID
    const tourIdParam = new URLSearchParams(window.location.search).get('id');
    if (tourIdParam && document.getElementById('viewerMode')) {
        loadTour(tourIdParam);
    }

    console.log('360 Tour Studio initialized');
}

/**
 * Handle undo request
 */
function handleUndo() {
    const markersPlugin = getMarkersPlugin();
    if (!markersPlugin) return;

    const undoneAction = undoLastAction(markersPlugin);
    if (undoneAction) {
        console.log('Undid action:', undoneAction);
        showNotification(`Undid: ${undoneAction.type}`, 'info');
    }

    document.getElementById('undoBtn').disabled = !canUndo();
}

/**
 * Handle when user uploads images
 * @param {Array} uploadedImages - Array of uploaded image objects
 */
function handleImagesUploaded(uploadedImages) {
    console.log('Handling uploaded images:', uploadedImages);
    images = uploadedImages;

    const viewer = setupViewer(images);

    if (viewer) {
        // Setup interactions after viewer is initialized
        setupInteractions(viewer);
    }

    showNotification(`Uploaded ${images.length} images successfully!`, 'success');
}

/**
 * Set up all interactions for the editor
 */
function setupInteractions(viewer) {
    const markersPlugin = getMarkersPlugin();
    const tourPlugin = getTourPlugin();

    if (markersPlugin) {
        initializePolygonManager(viewer, markersPlugin);
        initializeTextManager(viewer, markersPlugin);
        setupMarkerPlacement(viewer, markersPlugin);
        setupPolygonGeneration(viewer, markersPlugin);
        setupPolygonDragging(markersPlugin);
    }

    if (tourPlugin) {
        // Handle node changes
        tourPlugin.addEventListener('node-changed', (e) => {
            console.log('Node changed to:', e.node);

            const nodeId = e.node.id;
            document.querySelectorAll('.thumb').forEach(el => el.classList.remove('selected'));
            document.getElementById(`thumb-${nodeId}`)?.classList.add('selected');

            // Restore markers, polygons, and texts for this node
            if (markersPlugin) {
                markersPlugin.clearMarkers();

                // Restore markers
                const markers = getNodeMarkers(nodeId);
                markers.forEach(marker => markersPlugin.addMarker(marker));

                // Restore polygons
                const polygons = getNodePolygons(nodeId);
                polygons.forEach(polygon => markersPlugin.addMarker(polygon));

                // Restore texts
                const texts = getNodeTexts(nodeId);
                texts.forEach(text => markersPlugin.addMarker(text));
            }
        });
    }

    // Re-create all UI event handlers directly here to be sure they work

    // Draw Polygon button
    const drawPolygonBtn = document.getElementById('drawPolygonBtn');
    if (drawPolygonBtn) {
        drawPolygonBtn.addEventListener('click', () => {
            console.log('Draw polygon button clicked');
            if (!getCurrentNodeId()) {
                showNotification('Please upload and select a panorama first', 'warning');
                return;
            }
            toggleDrawingMode();
        });
    }

    // Add Text button
    const addTextBtn = document.getElementById('addTextBtn');
    if (addTextBtn) {
        addTextBtn.addEventListener('click', () => {
            console.log('Add text button clicked');
            if (!getCurrentNodeId()) {
                showNotification('Please upload and select a panorama first', 'warning');
                return;
            }
            toggleTextMode();
        });
    }

    // Add Link button
    const addLinkBtn = document.getElementById('addLinkBtn');
    if (addLinkBtn) {
        addLinkBtn.addEventListener('click', handleLinkButtonClick);
    }

    // Finish polygon button
    const finishPolygonBtn = document.getElementById('finishPolygonBtn');
    if (finishPolygonBtn) {
        finishPolygonBtn.addEventListener('click', () => {
            if (currentDrawingPoints && currentDrawingPoints.length >= 3) {
                finishDrawingPolygon();
            } else {
                showNotification('Need at least 3 points to create a polygon', 'warning');
            }
        });
    }

    console.log('Interactions set up successfully');
}

/**
 * Handle when user selects an image from the list
 * @param {string} imageId - ID of the selected image
 */
function handleImageSelected(imageId) {
    console.log('Image selected:', imageId);

    // If in drawing mode or text mode, prevent changing images
    if (isInDrawingMode()) {
        showNotification('Please finish or cancel your polygon before changing images.', 'warning');
        return;
    }

    if (isInTextMode()) {
        showNotification('Please finish or cancel your text before changing images.', 'warning');
        return;
    }

    const tourPlugin = getTourPlugin();
    if (tourPlugin) {
        tourPlugin.setCurrentNode(imageId);
    }
}

/**
 * Handle request to add a link between nodes
 */
function handleAddLinkRequest() {
    console.log('Add link requested');

    if (images.length < 2) {
        showNotification('You need at least two images to create links.', 'warning');
        return;
    }

    document.getElementById('linkDropdown').style.display = 'flex';
}

/**
 * Handle link button click to show the dropdown
 */
function handleLinkButtonClick() {
    console.log('Add link button clicked');

    // Get current node ID to exclude it from available targets
    const currentNodeId = getCurrentNodeId();

    if (!currentNodeId) {
        showNotification('Please upload and select a panorama first', 'warning');
        return;
    }

    // Get all available nodes
    const nodes = getNodes();
    if (nodes.length <= 1) {
        showNotification('Need at least 2 panoramas to create links', 'warning');
        return;
    }

    // Populate dropdown with nodes, excluding the current one
    const targetSelect = document.getElementById('targetSelect');
    targetSelect.innerHTML = '';

    nodes.forEach(node => {
        if (node.id !== currentNodeId) {
            const option = document.createElement('option');
            option.value = node.id;
            option.textContent = node.name || `Node ${node.id.substring(0, 6)}`;
            targetSelect.appendChild(option);
        }
    });

    // Show dropdown
    const linkDropdown = document.getElementById('linkDropdown');
    if (linkDropdown) {
        linkDropdown.style.display = 'block';
    }
}

/**
 * Handle link confirmed
 * @param {string} targetNodeId - ID of the target node
 */
function handleLinkConfirmed(targetNodeId) {
    console.log('Link confirmed to target:', targetNodeId);

    if (!targetNodeId) {
        showNotification('Please select a target node', 'warning');
        return;
    }

    // Hide dropdown
    const linkDropdown = document.getElementById('linkDropdown');
    if (linkDropdown) {
        linkDropdown.style.display = 'none';
    }

    // Start adding link
    if (window.markersManager && typeof window.markersManager.setPendingLinkTarget === 'function') {
        window.markersManager.setPendingLinkTarget(targetNodeId);
    } else {
        startAddingLink(targetNodeId);
    }
}

/**
 * Handle request to start drawing a polygon
 */
function handlePolygonDrawingRequested() {
    console.log('Polygon drawing requested');

    // Check if we have an active panorama
    if (!getCurrentNodeId()) {
        showNotification('Please upload and select an image first.', 'warning');
        return;
    }

    // Toggle drawing mode on
    toggleDrawingMode();
}

/**
 * Handle request to add text
 */
function handleTextAdditionRequested() {
    console.log('Text addition requested');

    // Check if we have an active panorama
    if (!getCurrentNodeId()) {
        showNotification('Please upload and select an image first.', 'warning');
        return;
    }

    // Toggle text mode on
    toggleTextMode();
}

/**
 * Handle request to clear all elements
 */
function handleClearAll() {
    console.log('Clear all requested');

    if (images.length === 0) {
        showNotification('No images loaded.', 'warning');
        return;
    }

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

        // Clear data structures for current node
        const currentNodeId = getCurrentNodeId();
        if (currentNodeId) {
            // Clear markers, polygons, and texts
            const nodes = getNodes();
            const node = nodes.find(n => n.id === currentNodeId);
            if (node) {
                node.markers = [];
                node.polygons = [];
                node.texts = [];
            }
        }

        showNotification('All elements cleared.', 'info');
    }
}

/**
 * Handle save request
 */
function handleSaveAll() {
    console.log('Save requested');

    if (images.length === 0) {
        showNotification('No data to save. Please upload images first.', 'warning');
        return;
    }

    if (isInDrawingMode()) {
        showNotification('Please finish or cancel your polygon before saving.', 'warning');
        return;
    }

    if (isInTextMode()) {
        showNotification('Please finish or cancel your text before saving.', 'warning');
        return;
    }

    // Prepare data for saving
    const tourName = document.getElementById('tourName')?.value || 'Untitled Tour';
    const tourDescription = document.getElementById('tourDescription')?.value || '';

    const formData = new FormData();
    formData.append('name', tourName);
    formData.append('description', tourDescription);

    const nodes = getNodes();

    // Add nodes data
    nodes.forEach((node, index) => {
        console.log(`Preparing node ${index} for saving:`, node);

        formData.append(`nodes[${index}][id]`, node.id);
        formData.append(`nodes[${index}][name]`, node.name);
        formData.append(`nodes[${index}][start_node]`, node.id === nodes[0].id);

        // Add image file if available
        const img = images.find(img => img.id === node.id);
        if (img && img.file) {
            formData.append(`panoramas[${index}]`, img.file);
        }

        // Add markers
        if (node.markers && node.markers.length > 0) {
            formData.append(`markers[${index}]`, JSON.stringify(node.markers.map(marker => {
                return {
                    ...marker,
                    node_id: node.id
                };
            })));
        }

        // Add polygons
        if (node.polygons && node.polygons.length > 0) {
            formData.append(`polygons[${index}]`, JSON.stringify(node.polygons.map(polygon => {
                return {
                    ...polygon,
                    node_id: node.id
                };
            })));
        }

        // Add texts
        if (node.texts && node.texts.length > 0) {
            formData.append(`texts[${index}]`, JSON.stringify(node.texts.map(text => {
                return {
                    ...text,
                    node_id: node.id
                };
            })));
        }
    });

    // Log form data entries for debugging
    for (let pair of formData.entries()) {
        if (pair[0].includes('panoramas')) {
            console.log(pair[0], 'File object');
        } else {
            console.log(pair[0], pair[1]);
        }
    }

    // Send data to server
    fetch('/api/studio/tours', {
        method: 'POST',
        body: formData,
    })
    .then(response => {
        console.log('Response:', response);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        console.log('Tour saved successfully:', data);
        showNotification('Tour saved successfully!', 'success');

        // Redirect to tour list
        setTimeout(() => {
            window.location.href = '/studio';
        }, 2000);
    })
    .catch(error => {
        console.error('Error saving tour:', error);
        showNotification('Failed to save tour: ' + error.message, 'danger');
    });
}

/**
 * Load a tour by ID
 * @param {string|number} tourId - ID of the tour to load
 */
function loadTour(tourId) {
    console.log('Loading tour:', tourId);

    fetch(`/api/studio/tours/${tourId}/data`)
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        console.log('Tour data loaded:', data);

        // Initialize viewer with tour data
        setupViewerWithTourData(data);
    })
    .catch(error => {
        console.error('Error loading tour:', error);
        showNotification('Failed to load tour: ' + error.message, 'danger');
    });
}

/**
 * Setup viewer with tour data
 * @param {Object} tourData - The tour data from the server
 */
function setupViewerWithTourData(tourData) {
    // Format the nodes for the viewer
    const formattedNodes = tourData.nodes.map(node => {
        return {
            id: node.id.toString(),
            name: node.name,
            panorama: `/storage/${node.panorama_path}`,
            thumbnail: node.thumbnail_path ? `/storage/${node.thumbnail_path}` : null,
            links: [],  // Will populate after all nodes are created
        };
    });

    // Setup the viewer
    const viewer = setupViewer(formattedNodes);

    if (viewer) {
        const markersPlugin = getMarkersPlugin();

        // Process markers, polygons, and texts after viewer is ready
        viewer.addEventListener('ready', () => {
            processTourElements(tourData, markersPlugin);
        });
    }
}

/**
 * Process tour elements (markers, polygons, texts) and add them to the viewer
 * @param {Object} tourData - The tour data from the server
 * @param {Object} markersPlugin - The markers plugin instance
 */
function processTourElements(tourData, markersPlugin) {
    if (!markersPlugin) return;

    // Setup node change handler to show the appropriate elements
    const tourPlugin = getTourPlugin();
    if (tourPlugin) {
        tourPlugin.addEventListener('node-changed', (e) => {
            const nodeId = e.node.id;

            // Clear existing markers
            markersPlugin.clearMarkers();

            // Find the node in the tour data
            const node = tourData.nodes.find(n => n.id.toString() === nodeId);
            if (node) {
                // Add markers
                if (node.markers && node.markers.length > 0) {
                    node.markers.forEach(marker => {
                        const formattedMarker = formatMarkerForViewer(marker, node.id);
                        markersPlugin.addMarker(formattedMarker);
                    });
                }

                // Add polygons
                if (node.polygons && node.polygons.length > 0) {
                    node.polygons.forEach(polygon => {
                        const formattedPolygon = formatPolygonForViewer(polygon, node.id);
                        markersPlugin.addMarker(formattedPolygon);
                    });
                }

                // Add texts
                if (node.texts && node.texts.length > 0) {
                    node.texts.forEach(text => {
                        const formattedText = formatTextForViewer(text, node.id);
                        markersPlugin.addMarker(formattedText);
                    });
                }
            }
        });

        // Set to start node
        const startNode = tourData.nodes.find(n => n.start_node);
        if (startNode) {
            tourPlugin.setCurrentNode(startNode.id.toString());
        } else if (tourData.nodes.length > 0) {
            tourPlugin.setCurrentNode(tourData.nodes[0].id.toString());
        }
    }
}

/**
 * Format a marker for the viewer
 * @param {Object} marker - The marker data from the server
 * @param {string|number} nodeId - The ID of the node the marker belongs to
 * @returns {Object} Formatted marker for the viewer
 */
function formatMarkerForViewer(marker, nodeId) {
    const position = typeof marker.position === 'string' ? JSON.parse(marker.position) : marker.position;

    return {
        id: marker.client_id || `marker-${marker.id}`,
        longitude: position.yaw || position.longitude || 0,
        latitude: position.pitch || position.latitude || 0,
        image: '/assets/marker-icon.png',  // Use a default marker icon
        width: 32,
        height: 32,
        anchor: 'bottom center',
        tooltip: marker.label || 'Marker',
        data: {
            type: marker.type,
            isLink: marker.is_link,
            targetNodeId: marker.target_node_id ? marker.target_node_id.toString() : null,
            originalData: marker.data ? (typeof marker.data === 'string' ? JSON.parse(marker.data) : marker.data) : {}
        }
    };
}

/**
 * Format a polygon for the viewer
 * @param {Object} polygon - The polygon data from the server
 * @param {string|number} nodeId - The ID of the node the polygon belongs to
 * @returns {Object} Formatted polygon for the viewer
 */
function formatPolygonForViewer(polygon, nodeId) {
    const points = typeof polygon.points === 'string' ? JSON.parse(polygon.points) : polygon.points;

    return {
        id: polygon.client_id || `polygon-${polygon.id}`,
        polylineRad: points.map(point => {
            return [point.yaw || point.longitude || 0, point.pitch || point.latitude || 0];
        }),
        svgStyle: {
            fill: polygon.fill ? polygon.color : 'none',
            stroke: polygon.color,
            strokeWidth: `${polygon.stroke_width}px`,
            opacity: polygon.opacity
        },
        tooltip: polygon.is_link ? 'Click to navigate' : null,
        data: {
            type: 'polygon',
            isLink: polygon.is_link,
            targetNodeId: polygon.target_node_id ? polygon.target_node_id.toString() : null,
            originalData: polygon.data ? (typeof polygon.data === 'string' ? JSON.parse(polygon.data) : polygon.data) : {}
        }
    };
}

/**
 * Format a text element for the viewer
 * @param {Object} text - The text data from the server
 * @param {string|number} nodeId - The ID of the node the text belongs to
 * @returns {Object} Formatted text for the viewer
 */
function formatTextForViewer(text, nodeId) {
    const position = typeof text.position === 'string' ? JSON.parse(text.position) : text.position;

    return {
        id: text.client_id || `text-${text.id}`,
        longitude: position.yaw || position.longitude || 0,
        latitude: position.pitch || position.latitude || 0,
        html: text.content,
        anchor: 'center',
        scale: [0.5, 2],
        style: {
            maxWidth: '200px',
            color: text.text_color,
            fontSize: `${text.font_size}px`,
            fontFamily: text.font_family,
            fontWeight: text.font_weight,
            backgroundColor: text.transparent_background ? 'transparent' : (text.background_color || 'rgba(0,0,0,0.5)'),
            padding: '5px',
            borderRadius: '5px',
            transform: `rotate(${text.rotation || 0}deg)`,
            cursor: text.is_link ? 'pointer' : 'default'
        },
        tooltip: text.is_link ? 'Click to navigate' : null,
        data: {
            type: 'text',
            isLink: text.is_link,
            targetNodeId: text.target_node_id ? text.target_node_id.toString() : null,
            originalData: text.styles ? (typeof text.styles === 'string' ? JSON.parse(text.styles) : text.styles) : {}
        }
    };
}

/**
 * Save the entire tour to the server
 */
function saveTour() {
    try {
        // Get tour data and headers
        const tourData = prepareTourData();
        const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');

        // Disable save button and show loading state
        const saveButton = document.getElementById('saveAllBtn');
        const originalButtonText = saveButton.innerHTML;
        saveButton.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i> Saving...';
        saveButton.disabled = true;

        // Send data to server
        fetch('/studio/store', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': csrfToken
            },
            body: JSON.stringify(tourData)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Server returned ${response.status}: ${response.statusText}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('Tour saved successfully:', data);
            showNotification('Tour saved successfully!', 'success');

            // Redirect to view the tour
            setTimeout(() => {
                window.location.href = `/studio/${data.id}`;
            }, 1000);
        })
        .catch(error => {
            console.error('Error saving tour:', error);
            showNotification('Error saving tour: ' + error.message, 'error');

            // Reset button state
            saveButton.innerHTML = originalButtonText;
            saveButton.disabled = false;
        });
    } catch (error) {
        console.error('Error preparing tour data:', error);
        showNotification('Error preparing tour data: ' + error.message, 'error');

        // Reset button state
        const saveButton = document.getElementById('saveAllBtn');
        saveButton.innerHTML = '<i class="fas fa-save me-1"></i> Save Tour';
        saveButton.disabled = false;
    }
}

/**
 * Prepare the tour data for saving
 * @returns {Object} The prepared tour data
 */
function prepareTourData() {
    // Get tour details
    const tourName = document.getElementById('tourName')?.value || 'Untitled Tour';
    const tourDescription = document.getElementById('tourDescription')?.value || '';

    // Prepare nodes data
    const nodes = getNodes().map(node => {
        // Get the corresponding image
        const img = images.find(img => img.id === node.id);

        // Create node data structure
        return {
            id: node.id,
            name: node.name || (img?.name || `Node ${node.id}`),
            file: img?.file,
            url: img?.url,
            markers: getNodeMarkers(node.id) || [],
            polygons: getNodePolygons(node.id) || [],
            texts: getNodeTexts(node.id) || []
        };
    });

    // Construct final tour data
    return {
        name: tourName,
        description: tourDescription,
        nodes: nodes
    };
}

/**
 * Update the color preview element
 */
function updateColorPreview() {
    const colorSelect = document.getElementById('polygonColor');
    const colorPreview = document.getElementById('currentColorPreview');

    if (colorSelect && colorPreview && window.polygonColors) {
        const selectedIndex = parseInt(colorSelect.value, 10);
        const selectedColor = window.polygonColors[selectedIndex];
        colorPreview.style.backgroundColor = selectedColor;
    }
}

/**
 * Update the stroke width display
 */
function updateStrokeWidthDisplay() {
    const strokeWidthSlider = document.getElementById('strokeWidth');
    const strokeWidthValue = document.getElementById('strokeWidthValue');

    if (strokeWidthSlider && strokeWidthValue) {
        strokeWidthValue.textContent = `${strokeWidthSlider.value}px`;
    }
}

// Export functions and data that might be needed elsewhere
export {
    initApp,
    images,
    getCurrentNodeId,
    handleLinkConfirmed,
    handleLinkButtonClick,
    loadTour
};
