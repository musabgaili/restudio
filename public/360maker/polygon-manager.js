// polygon-manager.js - Handling polygon creation and management
import { getCurrentNodeId, addPolygonToNode, getNodePolygons, getNodeTexts, clearNodePolygons } from './nodes-manager.js';
import { getViewer } from './viewer.js';
import { generateUniqueId } from './utils.js';
import { getSelectedStrokeWidth, showNotification } from './ui-manager.js';

// Module state
let viewer = null;
let markersPlugin = null;
let isDrawingMode = false;
let isDraggingPolygon = false;
let currentDrawingPoints = []; // Store points while drawing a polygon
let tempPointMarkers = []; // Store temporary point markers
let tempLineMarkers = []; // Store temporary line markers
let selectedPolygon = null; // Currently selected polygon for dragging
let drawOverlay = null; // Store reference to drawing overlay

/**
 * Initialize the polygon manager
 * @param {Object} viewerInstance - Viewer instance
 * @param {Object} markersPluginInstance - Markers plugin instance
 */
function initializePolygonManager(viewerInstance, markersPluginInstance) {
    viewer = viewerInstance;
    markersPlugin = markersPluginInstance;
    console.log('Polygon manager initialized');
}

/**
 * Set up polygon generation functionality
 * @param {Object} viewerInstance - Viewer instance
 * @param {Object} markersPluginInstance - Markers plugin instance
 */
function setupPolygonGeneration(viewerInstance, markersPluginInstance) {
    viewer = viewerInstance;
    markersPlugin = markersPluginInstance;

    // Setup click handler for manual drawing - Only use click event not the viewer container
    // This prevents it from interfering with panorama dragging
    setupManualDrawingHandlers();
}

/**
 * Set up event handlers for manual polygon drawing
 */
function setupManualDrawingHandlers() {
    // Create an overlay div for capturing clicks (instead of attaching directly to viewer container)
    if (!drawOverlay) {
        drawOverlay = document.createElement('div');
        drawOverlay.id = 'polygonDrawOverlay';
        drawOverlay.className = 'drawing-overlay';
        drawOverlay.style.display = 'none';
        drawOverlay.style.position = 'absolute';
        drawOverlay.style.top = '0';
        drawOverlay.style.left = '0';
        drawOverlay.style.width = '100%';
        drawOverlay.style.height = '100%';
        drawOverlay.style.zIndex = '10';

        if (viewer && viewer.container && viewer.container.parentNode) {
            viewer.container.parentNode.appendChild(drawOverlay);

            // Add click handler to the overlay instead of the viewer container
            drawOverlay.addEventListener('click', handleViewerClick);

            console.log('Polygon draw overlay created and attached');
        } else {
            console.error('Cannot attach polygon draw overlay - viewer container not found');
        }
    }

    // Set up Finish Polygon button
    const finishPolygonBtn = document.getElementById('finishPolygonBtn');
    if (finishPolygonBtn) {
        // Remove existing handlers to avoid duplicates
        finishPolygonBtn.removeEventListener('click', finishPolygonButtonHandler);
        finishPolygonBtn.addEventListener('click', finishPolygonButtonHandler);
        console.log('Finish polygon button handler attached');
    } else {
        console.error('Finish polygon button not found');
    }
}

/**
 * Handler for finish polygon button
 */
function finishPolygonButtonHandler() {
    console.log('Finish polygon button clicked, points:', currentDrawingPoints.length);
    if (currentDrawingPoints.length >= 3) {
        finishDrawingPolygon();
    } else {
        showNotification('Need at least 3 points to create a polygon', 'warning');
    }
}

/**
 * Setup polygon dragging functionality
 * @param {Object} markersPluginInstance - Markers plugin instance
 */
function setupPolygonDragging(markersPluginInstance) {
    markersPlugin = markersPluginInstance;

    // Add event listeners for dragging polygons
    if (markersPlugin) {
        markersPlugin.addEventListener('select-marker', (e) => {
            if (e.marker && e.marker.data && e.marker.data.type === 'polygon') {
                if (!isDrawingMode) {
                    selectedPolygon = e.marker;
                    handlePolygonDragStart(e);
                }
            }
        });

        // Add mousemove event for dragging
        document.addEventListener('mousemove', (e) => {
            if (isDraggingPolygon && selectedPolygon) {
                handlePolygonDrag(e);
            }
        });

        // Add mouseup event to end dragging
        document.addEventListener('mouseup', () => {
            if (isDraggingPolygon) {
                handlePolygonDragEnd();
            }
        });
    }
}

/**
 * Handle start of polygon dragging
 * @param {Object} e - Event object
 */
function handlePolygonDragStart(e) {
    if (isDrawingMode) return; // Don't allow dragging while drawing

    isDraggingPolygon = true;
    document.body.style.cursor = 'move';
    showNotification('Dragging polygon. Click to release.', 'info');
}

/**
 * Handle polygon dragging
 * @param {Object} e - Event object
 */
function handlePolygonDrag(e) {
    if (!markersPlugin || !selectedPolygon || !viewer) return;

    // Convert mouse position to viewer coordinates
    const rect = viewer.container.getBoundingClientRect();
    const pos = viewer.getPosition();

    // Calculate the movement based on mouse position
    const dx = (e.clientX - rect.left) / rect.width - 0.5;
    const dy = (e.clientY - rect.top) / rect.height - 0.5;

    // Adjust speed based on viewer size
    const speed = 0.1;
    const yawDelta = dx * speed;
    const pitchDelta = dy * speed;

    // Update all points in the polygon
    if (selectedPolygon.polygon) {
        const newPoints = selectedPolygon.polygon.map(point => ({
            yaw: point.yaw + yawDelta,
            pitch: point.pitch + pitchDelta
        }));

        // Create a new polygon marker with updated points
        const updatedPolygon = {
            ...selectedPolygon,
            polygon: newPoints
        };

        // Replace the old polygon with the updated one
        markersPlugin.removeMarker(selectedPolygon.id);
        markersPlugin.addMarker(updatedPolygon);

        // Update the reference to the selected polygon
        selectedPolygon = markersPlugin.getMarker(updatedPolygon.id);

        // Update in storage
        const nodeId = getCurrentNodeId();
        if (nodeId) {
            updatePolygonInNode(nodeId, selectedPolygon.id, newPoints);
        }
    }
}

/**
 * Update polygon points in the node storage
 * @param {string} nodeId - Node ID
 * @param {string} polygonId - Polygon ID
 * @param {Array} newPoints - New polygon points
 */
function updatePolygonInNode(nodeId, polygonId, newPoints) {
    const polygons = getNodePolygons(nodeId);
    const updatedPolygons = polygons.map(p => {
        if (p.id === polygonId) {
            return {
                ...p,
                polygon: newPoints
            };
        }
        return p;
    });

    // Replace the polygons list with updated one
    clearNodePolygons(nodeId);
    updatedPolygons.forEach(p => addPolygonToNode(nodeId, p));
}

/**
 * Handle end of polygon dragging
 */
function handlePolygonDragEnd() {
    isDraggingPolygon = false;
    selectedPolygon = null;
    document.body.style.cursor = 'auto';
}

/**
 * Toggle drawing mode on/off
 */
function toggleDrawingMode() {
    isDrawingMode = !isDrawingMode;
    console.log('Drawing mode toggled:', isDrawingMode);

    if (drawOverlay) {
        drawOverlay.style.display = isDrawingMode ? 'block' : 'none';
        console.log('Draw overlay display:', drawOverlay.style.display);
    } else {
        console.error('Draw overlay not initialized');
        setupManualDrawingHandlers();
        if (drawOverlay) {
            drawOverlay.style.display = isDrawingMode ? 'block' : 'none';
            console.log('Draw overlay created and displayed');
        }
    }

    // Show or hide drawing help overlay
    const drawingHelp = document.getElementById('drawingHelp');
    if (drawingHelp) {
        drawingHelp.style.display = isDrawingMode ? 'block' : 'none';
    }

    // Reset points counter
    updatePointsCounter(0);

    // Reset current drawing
    currentDrawingPoints = [];
    clearTemporaryMarkers();

    // Enable/disable finish button
    const finishBtn = document.getElementById('finishPolygonBtn');
    if (finishBtn) {
        finishBtn.disabled = true;
    }

    // Update button text
    const drawBtn = document.getElementById('drawPolygonBtn');
    if (drawBtn) {
        drawBtn.innerHTML = isDrawingMode ?
            '<i class="fas fa-times me-1"></i> Cancel' :
            '<i class="fas fa-draw-polygon me-1"></i> Draw';
    }

    if (isDrawingMode) {
        showNotification('Drawing Mode: Click to add points (min 3)', 'info');
    } else {
        showNotification('Drawing canceled', 'info');
    }
}

/**
 * Handle viewer click for polygon drawing
 * @param {Object} event - Click event
 */
function handleViewerClick(event) {
    if (!isDrawingMode || !viewer) return;

    event.preventDefault();
    event.stopPropagation();

    // Get click position in the viewer
    const rect = viewer.container.getBoundingClientRect();
    const viewerPoint = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
    };

    // Convert to spherical coordinates
    const position = viewer.getPosition();

    // Convert mouse coordinates to sphere coordinates
    const sphericalCoords = viewer.dataHelper.viewerCoordsToSphericalCoords({
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
    });

    // Add point to current drawing
    addPointToCurrentDrawing(sphericalCoords);
}

/**
 * Add a point to the current drawing
 * @param {Object} position - Position with yaw and pitch
 */
function addPointToCurrentDrawing(position) {
    if (!markersPlugin) return;

    // Add point to array
    currentDrawingPoints.push(position);

    // Create a point marker
    const pointMarkerId = `temp-point-${currentDrawingPoints.length}`;
    const pointMarker = {
        id: pointMarkerId,
        position: position,
        circle: 5,
        tooltip: `Point ${currentDrawingPoints.length}`,
        svgStyle: {
            fill: 'rgba(255, 255, 255, 0.8)',
            stroke: 'rgba(0, 0, 0, 0.8)',
            strokeWidth: '2px'
        }
    };

    markersPlugin.addMarker(pointMarker);
    tempPointMarkers.push(pointMarkerId);

    // Draw line to previous point if this isn't the first point
    if (currentDrawingPoints.length > 1) {
        const prevPoint = currentDrawingPoints[currentDrawingPoints.length - 2];
        drawLineBetweenPoints(prevPoint, position);
    }

    // Draw closing line if we have 3+ points
    if (currentDrawingPoints.length >= 3) {
        // Enable finish button
        const finishBtn = document.getElementById('finishPolygonBtn');
        if (finishBtn) {
            finishBtn.disabled = false;
        }
    }

    // Update points counter
    updatePointsCounter(currentDrawingPoints.length);
}

/**
 * Draw a line between two points
 * @param {Object} point1 - First point
 * @param {Object} point2 - Second point
 */
function drawLineBetweenPoints(point1, point2) {
    if (!markersPlugin) return;

    const lineId = `temp-line-${tempLineMarkers.length + 1}`;
    const lineMarker = {
        id: lineId,
        polyline: [
            { position: point1 },
            { position: point2 }
        ],
        svgStyle: {
            stroke: 'rgba(255, 255, 255, 0.8)',
            strokeWidth: '2px',
            strokeLinecap: 'round',
            strokeLinejoin: 'round'
        }
    };

    markersPlugin.addMarker(lineMarker);
    tempLineMarkers.push(lineId);
}

/**
 * Clear all temporary markers (points and lines)
 */
function clearTemporaryMarkers() {
    if (!markersPlugin) return;

    // Remove all temporary point markers
    tempPointMarkers.forEach(id => {
        markersPlugin.removeMarker(id);
    });

    // Remove all temporary line markers
    tempLineMarkers.forEach(id => {
        markersPlugin.removeMarker(id);
    });

    tempPointMarkers = [];
    tempLineMarkers = [];
}

/**
 * Update the points counter display
 * @param {number} count - Number of points
 */
function updatePointsCounter(count) {
    const pointsCount = document.getElementById('pointsCount');
    if (pointsCount) {
        pointsCount.textContent = `Points: ${count}`;
    }
}

/**
 * Finish drawing the current polygon
 */
function finishDrawingPolygon() {
    if (currentDrawingPoints.length < 3 || !markersPlugin) {
        showNotification('Need at least 3 points to create a polygon', 'warning');
        return;
    }

    // Get current node ID
    const nodeId = getCurrentNodeId();
    if (!nodeId) {
        showNotification('No active panorama selected', 'error');
        return;
    }

    // Get color and style settings
    const colorSelect = document.getElementById('polygonColor');
    const fillCheckbox = document.getElementById('fillPolygons');

    const colorIndex = colorSelect ? parseInt(colorSelect.value, 10) : 0;
    const color = window.polygonColors[colorIndex];
    const fill = fillCheckbox ? fillCheckbox.checked : true;
    const strokeWidth = getSelectedStrokeWidth();

    // Create a unique ID for the polygon
    const polygonId = `polygon-${generateUniqueId()}`;

    // Format points for the polygon
    const formattedPoints = currentDrawingPoints.map(point => ({
        position: point
    }));

    // Create polygon data
    const polygonData = {
        id: polygonId,
        polylineRad: formattedPoints,
        svgStyle: {
            fill: fill ? color : 'none',
            stroke: color.replace(/[^,]+\)/, '1)'), // Make stroke fully opaque
            strokeWidth: `${strokeWidth}px`
        },
        tooltip: 'Click to select this polygon',
        data: {
            type: 'polygon',
            createdAt: new Date().toISOString(),
            originalPoints: currentDrawingPoints,
            isFilled: fill,
            strokeWidth: strokeWidth,
            isDraggable: true
        }
    };

    // Clear temporary markers
    clearTemporaryMarkers();

    // Add polygon to view
    markersPlugin.addMarker(polygonData);

    // Store polygon data
    addPolygonToNode(nodeId, polygonData);

    // Reset drawing state
    currentDrawingPoints = [];
    updatePointsCounter(0);

    // Exit drawing mode
    toggleDrawingMode();

    // Show success notification
    showNotification('Polygon created successfully!', 'success');

    // Enable undo button
    document.getElementById('undoBtn').disabled = false;

    console.log('Added polygon to node:', nodeId, polygonData);
    return polygonData;
}

/**
 * Check if currently in drawing mode
 * @returns {boolean} True if in drawing mode
 */
function isInDrawingMode() {
    return isDrawingMode;
}

export {
    initializePolygonManager,
    isInDrawingMode,
    setupPolygonGeneration,
    setupPolygonDragging,
    toggleDrawingMode,
    finishDrawingPolygon,
    currentDrawingPoints
};
