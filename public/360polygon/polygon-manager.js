// polygon-manager.js - Handling polygon creation and management
import { getCurrentNodeId, addPolygonToNode, getNodePolygons, getNodeTexts, clearNodePolygons } from './nodes-manager.js';
import { getViewer } from './viewer.js';
import { generateUniqueId } from './utils.js';
import { getSelectedStrokeWidth } from './ui-manager.js';

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
 * Generate a random point on the sphere within visible area
 * @returns {Object} Object with yaw and pitch coordinates
 */
function generateRandomPoint() {
    // Generate random coordinates for a point that's visible in the viewer
    // Limit to the area that's likely to be in view
    const yaw = Math.random() * Math.PI * 2 - Math.PI; // -180 to 180 degrees
    const pitch = Math.random() * Math.PI - Math.PI / 2; // -90 to 90 degrees

    return {
        yaw: yaw,
        pitch: pitch
    };
}

/**
 * Generate random polygons on the current panorama
 * @param {number} count - Number of polygons to generate
 * @param {number} complexity - Number of points per polygon
 * @param {boolean} fill - Whether to fill the polygons
 */
function generateRandomPolygons(count, complexity, fill) {
    if (!viewer || !markersPlugin) return;

    const nodeId = getCurrentNodeId();
    if (!nodeId) return;

    // Clear existing polygons first
    clearAllPolygons(markersPlugin);

    // Get current stroke width
    const strokeWidth = getSelectedStrokeWidth();

    // Generate new random polygons
    for (let i = 0; i < count; i++) {
        // Generate polygon with random points
        const points = [];
        for (let j = 0; j < complexity; j++) {
            points.push(generateRandomPoint());
        }

        // Get random color from the global color array
        const colorIndex = Math.floor(Math.random() * window.polygonColors.length);
        const color = window.polygonColors[colorIndex];

        const polygonId = `polygon-${generateUniqueId()}`;

        // Create polygon data
        const polygonData = {
            id: polygonId,
            polygon: points,
            svgStyle: {
                fill: fill ? color : 'none',
                stroke: color.replace(/[^,]+\)/, '1)'), // Make stroke fully opaque
                strokeWidth: `${strokeWidth}px`
            },
            tooltip: `Polygon ${i + 1}`,
            data: {
                type: 'randomPolygon',
                createdAt: new Date().toISOString(),
                isFilled: fill,
                strokeWidth: strokeWidth,
                isDraggable: true
            }
        };

        // Add polygon to view
        markersPlugin.addMarker(polygonData);

        // Store polygon data
        addPolygonToNode(nodeId, polygonData);
    }
}

/**
 * Clear all polygons from the current view
 * @param {Object} markersPlugin - Markers plugin instance
 */
function clearAllPolygons(markersPlugin) {
    if (!markersPlugin) return;

    markersPlugin.clearMarkers();

    const nodeId = getCurrentNodeId();
    if (nodeId) {
        clearNodePolygons(nodeId);
    }
}

/**
 * Restore polygons for the current node
 * @param {string} nodeId - ID of the node
 */
function restorePolygons(nodeId) {
    if (!markersPlugin) return;

    // Clear existing markers
    markersPlugin.clearMarkers();

    // Get saved polygons for this node
    const polygons = getNodePolygons(nodeId);

    // Re-add them to the view
    if (polygons && polygons.length > 0) {
        polygons.forEach(polygon => {
            markersPlugin.addMarker(polygon);
        });
    }
}

/**
 * Save all polygon and text data to the server
 * @param {Array} images - Array of all images with their polygons
 */
function savePolygonData(images) {
    const formData = new FormData();

    // Prepare data for saving
    images.forEach((img, index) => {
        const nodeId = img.id;
        const polygons = getNodePolygons(nodeId);
        const texts = getNodeTexts(nodeId);

        formData.append(`images[${index}]`, img.file);
        formData.append(`data[${index}][name]`, img.name);
        formData.append(`data[${index}][id]`, nodeId);
        formData.append(`data[${index}][polygons]`, JSON.stringify(polygons));
        formData.append(`data[${index}][texts]`, JSON.stringify(texts));
    });

    // Send to server
    return fetch('/api/polygon-data', {
        method: 'POST',
        body: formData,
    })
    .then(response => response.json())
    .then(data => {
        return data;
    })
    .catch(error => {
        console.error('Error saving polygon data:', error);
        throw error;
    });
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

            console.log('Drawing overlay created and attached');
        } else {
            console.error('Viewer container not found, cannot attach drawing overlay');
        }
    }

    // Setup draw polygon button
    const drawPolygonBtn = document.getElementById('drawPolygonBtn');
    if (drawPolygonBtn) {
        // Remove any existing event listeners to prevent duplicates
        const newBtn = drawPolygonBtn.cloneNode(true);
        drawPolygonBtn.parentNode.replaceChild(newBtn, drawPolygonBtn);
        newBtn.addEventListener('click', toggleDrawingMode);
    }

    // Setup finish polygon button
    const finishPolygonBtn = document.getElementById('finishPolygonBtn');
    if (finishPolygonBtn) {
        // Remove any existing event listeners to prevent duplicates
        const newBtn = finishPolygonBtn.cloneNode(true);
        finishPolygonBtn.parentNode.replaceChild(newBtn, finishPolygonBtn);
        newBtn.addEventListener('click', finishDrawingPolygon);
    }

    // Setup polygon dragging
    setupPolygonDragging();
}

/**
 * Set up polygon dragging functionality
 */
function setupPolygonDragging() {
    // Listen for marker select events
    if (markersPlugin) {
        markersPlugin.addEventListener('select-marker', (e) => {
            if (e.marker && e.marker.data && e.marker.data.type &&
                (e.marker.data.type === 'randomPolygon' || e.marker.data.type === 'manualPolygon')) {
                // Store reference to selected polygon
                selectedPolygon = e.marker;

                // Show dragging tooltip only if not in drawing mode
                if (!isDrawingMode) {
                    showDraggingTooltip(true);
                }
            }
        });

        markersPlugin.addEventListener('unselect-marker', () => {
            // Reset selected polygon reference
            selectedPolygon = null;

            // Hide dragging tooltip
            showDraggingTooltip(false);
        });
    }

    // Add mouse events for dragging on the viewer container
    viewer.container.addEventListener('mousedown', handlePolygonDragStart);
    viewer.container.addEventListener('mousemove', handlePolygonDrag);
    viewer.container.addEventListener('mouseup', handlePolygonDragEnd);
    viewer.container.addEventListener('mouseleave', handlePolygonDragEnd);
}

/**
 * Show or hide the dragging tooltip
 * @param {boolean} show - Whether to show or hide the tooltip
 */
function showDraggingTooltip(show) {
    let tooltip = document.getElementById('draggingTooltip');

    if (show) {
        if (!tooltip) {
            tooltip = document.createElement('div');
            tooltip.id = 'draggingTooltip';
            tooltip.className = 'dragging-tooltip';
            tooltip.innerHTML = '<i class="fas fa-arrows-alt me-2"></i>Drag to move polygon';
            document.body.appendChild(tooltip);
        }

        // Position near the cursor
        document.addEventListener('mousemove', positionTooltip);
        tooltip.style.display = 'block';
    } else if (tooltip) {
        tooltip.style.display = 'none';
        document.removeEventListener('mousemove', positionTooltip);
    }
}

/**
 * Position the dragging tooltip near the cursor
 * @param {MouseEvent} e - Mouse event
 */
function positionTooltip(e) {
    const tooltip = document.getElementById('draggingTooltip');
    if (tooltip) {
        tooltip.style.left = (e.clientX + 15) + 'px';
        tooltip.style.top = (e.clientY + 15) + 'px';
    }
}

/**
 * Handle the start of polygon dragging
 * @param {MouseEvent} e - Mouse event
 */
function handlePolygonDragStart(e) {
    if (isDrawingMode || !selectedPolygon) return;

    isDraggingPolygon = true;
    viewer.stopAnimation();
    viewer.container.style.cursor = 'grabbing';

    // Prevent default panorama movement
    e.stopPropagation();
}

/**
 * Handle polygon dragging
 * @param {MouseEvent} e - Mouse event
 */
function handlePolygonDrag(e) {
    if (!isDraggingPolygon || !selectedPolygon) return;

    // Get movement delta in viewer coordinates
    const rect = viewer.container.getBoundingClientRect();
    const size = viewer.getSize();

    const x = (e.clientX - rect.left) * size.width / rect.width;
    const y = (e.clientY - rect.top) * size.height / rect.height;

    // Convert to spherical coordinates
    const newPosition = viewer.dataHelper.viewerCoordsToSphericalCoords({ x, y });

    if (!newPosition) return;

    // Calculate the offset to apply to all polygon points
    // We need to use the center of the polygon as a reference
    const polygonPoints = selectedPolygon.polygon;
    const center = calculatePolygonCenter(polygonPoints);

    const deltaYaw = newPosition.yaw - center.yaw;
    const deltaPitch = newPosition.pitch - center.pitch;

    // Apply the offset to create new polygon points
    const newPolygonPoints = polygonPoints.map(point => ({
        yaw: point.yaw + deltaYaw,
        pitch: point.pitch + deltaPitch
    }));

    // Update the polygon in the viewer
    const updatedPolygon = {
        ...selectedPolygon,
        polygon: newPolygonPoints
    };

    markersPlugin.updateMarker(updatedPolygon);

    // Also update the polygon in storage
    updatePolygonInNode(getCurrentNodeId(), selectedPolygon.id, newPolygonPoints);

    // Update selected polygon reference with new points
    selectedPolygon = updatedPolygon;

    // Prevent default panorama movement
    e.stopPropagation();
    e.preventDefault();
}

/**
 * Calculate the center point of a polygon
 * @param {Array} points - Array of points with yaw and pitch
 * @returns {Object} The center point with yaw and pitch
 */
function calculatePolygonCenter(points) {
    // Convert spherical coordinates to Cartesian for proper averaging
    const cartesianPoints = points.map(point => {
        const x = Math.cos(point.pitch) * Math.cos(point.yaw);
        const y = Math.cos(point.pitch) * Math.sin(point.yaw);
        const z = Math.sin(point.pitch);
        return { x, y, z };
    });

    // Calculate average position in Cartesian space
    const sumX = cartesianPoints.reduce((sum, p) => sum + p.x, 0);
    const sumY = cartesianPoints.reduce((sum, p) => sum + p.y, 0);
    const sumZ = cartesianPoints.reduce((sum, p) => sum + p.z, 0);

    const avgX = sumX / points.length;
    const avgY = sumY / points.length;
    const avgZ = sumZ / points.length;

    // Convert back to spherical coordinates
    const r = Math.sqrt(avgX * avgX + avgY * avgY + avgZ * avgZ);
    const yaw = Math.atan2(avgY, avgX);
    const pitch = Math.asin(avgZ / r);

    return { yaw, pitch };
}

/**
 * Update a polygon's points in the node data
 * @param {string} nodeId - ID of the node
 * @param {string} polygonId - ID of the polygon
 * @param {Array} newPoints - New polygon points
 */
function updatePolygonInNode(nodeId, polygonId, newPoints) {
    const node = window.getNodes().find(node => node.id === nodeId);
    if (!node || !node.polygons) return;

    const polygonIndex = node.polygons.findIndex(poly => poly.id === polygonId);
    if (polygonIndex === -1) return;

    // Update the polygon points
    node.polygons[polygonIndex].polygon = newPoints;
}

/**
 * Handle the end of polygon dragging
 */
function handlePolygonDragEnd() {
    if (!isDraggingPolygon) return;

    isDraggingPolygon = false;
    viewer.container.style.cursor = '';

    // Hide dragging tooltip
    showDraggingTooltip(false);
}

/**
 * Toggle polygon drawing mode
 */
function toggleDrawingMode() {
    isDrawingMode = !isDrawingMode;

    const drawPolygonBtn = document.getElementById('drawPolygonBtn');
    const finishPolygonBtn = document.getElementById('finishPolygonBtn');
    const drawingHelp = document.getElementById('drawingHelp');

    // Check if drawOverlay exists and create it if not
    if (!drawOverlay && viewer && viewer.container) {
        console.log('Creating missing drawing overlay');
        drawOverlay = document.createElement('div');
        drawOverlay.id = 'polygonDrawOverlay';
        drawOverlay.className = 'drawing-overlay';
        drawOverlay.style.position = 'absolute';
        drawOverlay.style.top = '0';
        drawOverlay.style.left = '0';
        drawOverlay.style.width = '100%';
        drawOverlay.style.height = '100%';
        drawOverlay.style.zIndex = '10';
        viewer.container.parentNode.appendChild(drawOverlay);
        drawOverlay.addEventListener('click', handleViewerClick);
    }

    if (isDrawingMode) {
        // Enable drawing mode
        if (drawPolygonBtn) {
            drawPolygonBtn.classList.remove('btn-primary');
            drawPolygonBtn.classList.add('btn-warning');
            drawPolygonBtn.textContent = 'Cancel Drawing';
        }

        if (finishPolygonBtn) {
            finishPolygonBtn.disabled = true;
        }

        // Show drawing help
        if (drawingHelp) drawingHelp.style.display = 'block';

        // Show drawing overlay to capture clicks
        if (drawOverlay) {
            drawOverlay.style.display = 'block';
            drawOverlay.style.cursor = 'crosshair';
            console.log('Drawing overlay displayed');
        } else {
            console.error('Drawing overlay not found');
        }

        // Reset drawing state
        currentDrawingPoints = [];
        clearTemporaryMarkers();
        updatePointsCounter(0);
    } else {
        // Disable drawing mode
        if (drawPolygonBtn) {
            drawPolygonBtn.classList.remove('btn-warning');
            drawPolygonBtn.classList.add('btn-primary');
            drawPolygonBtn.textContent = 'Draw Polygon';
        }

        if (finishPolygonBtn) {
            finishPolygonBtn.disabled = true;
        }

        // Hide drawing help
        if (drawingHelp) drawingHelp.style.display = 'none';

        // Hide drawing overlay
        if (drawOverlay) {
            drawOverlay.style.display = 'none';
            console.log('Drawing overlay hidden');
        }

        // Clear temporary drawing markers
        clearTemporaryMarkers();
        updatePointsCounter(0);
    }
}

/**
 * Handle click events on the viewer while in drawing mode
 * @param {Event} event - Click event
 */
function handleViewerClick(event) {
    if (!isDrawingMode || !viewer || !markersPlugin) {
        console.log('Click ignored: drawing mode is not active or missing components');
        return;
    }

    console.log('Drawing click detected');

    // Calculate position from click
    const rect = viewer.container.getBoundingClientRect();
    const size = viewer.getSize();

    const x = (event.clientX - rect.left) * size.width / rect.width;
    const y = (event.clientY - rect.top) * size.height / rect.height;

    const position = viewer.dataHelper.viewerCoordsToSphericalCoords({ x, y });

    if (!position) {
        console.warn('No position found from mouse event');
        return;
    }

    // Add point to current drawing
    addPointToCurrentDrawing(position);

    // Stop event propagation to prevent panorama movement
    event.stopPropagation();
}

/**
 * Add a point to the current polygon being drawn
 * @param {Object} position - Position with yaw and pitch coordinates
 */
function addPointToCurrentDrawing(position) {
    console.log('Adding point at position:', position);

    // Add point to array
    currentDrawingPoints.push(position);

    // Create a point marker
    const pointId = `temp-point-${currentDrawingPoints.length}`;
    const pointMarker = {
        id: pointId,
        circle: 5,
        position: position,
        tooltip: `Point ${currentDrawingPoints.length}`,
        svgStyle: {
            fill: 'white',
            stroke: 'black',
            strokeWidth: '2px'
        }
    };

    // Add marker to view
    markersPlugin.addMarker(pointMarker);
    tempPointMarkers.push(pointId);

    // If we have at least 2 points, draw a line between the last two points
    if (currentDrawingPoints.length >= 2) {
        const lastIndex = currentDrawingPoints.length - 1;
        drawLineBetweenPoints(
            currentDrawingPoints[lastIndex - 1],
            currentDrawingPoints[lastIndex]
        );
    }

    // If we have at least 3 points, enable finish button
    const finishPolygonBtn = document.getElementById('finishPolygonBtn');
    if (currentDrawingPoints.length >= 3 && finishPolygonBtn) {
        finishPolygonBtn.disabled = false;
    }

    // Update the points counter
    updatePointsCounter(currentDrawingPoints.length);

    // If this is the first point, also draw a temporary line to show where the next point will connect
    if (currentDrawingPoints.length === 1) {
        // We'll draw this in the next update
    }
}

/**
 * Draw a line between two points
 * @param {Object} point1 - First point with yaw and pitch
 * @param {Object} point2 - Second point with yaw and pitch
 */
function drawLineBetweenPoints(point1, point2) {
    const lineId = `temp-line-${tempLineMarkers.length + 1}`;
    const lineMarker = {
        id: lineId,
        polyline: [point1, point2],
        svgStyle: {
            stroke: '#ffffff',
            strokeWidth: '2px',
            strokeDasharray: '5 5',
            fill: 'none'
        }
    };

    markersPlugin.addMarker(lineMarker);
    tempLineMarkers.push(lineId);
}

/**
 * Clear all temporary markers used during drawing
 */
function clearTemporaryMarkers() {
    // Remove all temporary markers
    tempPointMarkers.forEach(id => {
        markersPlugin.removeMarker(id);
    });

    tempLineMarkers.forEach(id => {
        markersPlugin.removeMarker(id);
    });

    tempPointMarkers = [];
    tempLineMarkers = [];
}

/**
 * Update the points counter in the UI
 * @param {number} count - Number of points currently added
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
    if (currentDrawingPoints.length < 3) {
        console.warn('Need at least 3 points to create a polygon');
        return;
    }

    const nodeId = getCurrentNodeId();
    if (!nodeId) return;

    // Create the closing line between last and first point
    drawLineBetweenPoints(
        currentDrawingPoints[currentDrawingPoints.length - 1],
        currentDrawingPoints[0]
    );

    // Get selected color
    const colorSelect = document.getElementById('polygonColor');
    const colorIndex = colorSelect ? parseInt(colorSelect.value, 10) : 0;
    const color = window.polygonColors[colorIndex];

    // Get fill setting
    const fillPolygons = document.getElementById('fillPolygons').checked;

    // Get current stroke width
    const strokeWidth = getSelectedStrokeWidth();

    // Create polygon data
    const polygonId = `polygon-${generateUniqueId()}`;
    const polygonData = {
        id: polygonId,
        polygon: currentDrawingPoints,
        svgStyle: {
            fill: fillPolygons ? color : 'none',
            stroke: color.replace(/[^,]+\)/, '1)'), // Make stroke fully opaque
            strokeWidth: `${strokeWidth}px`
        },
        tooltip: `Manual Polygon`,
        data: {
            type: 'manualPolygon',
            createdAt: new Date().toISOString(),
            isFilled: fillPolygons,
            pointCount: currentDrawingPoints.length,
            strokeWidth: strokeWidth,
            isDraggable: true
        }
    };

    // Clear temporary markers
    clearTemporaryMarkers();

    // Add final polygon
    markersPlugin.addMarker(polygonData);

    // Store polygon data
    addPolygonToNode(nodeId, polygonData);

    // Reset drawing state
    currentDrawingPoints = [];
    updatePointsCounter(0);

    // Exit drawing mode
    toggleDrawingMode();
}

/**
 * Check if currently in drawing mode
 * @returns {boolean} True if in drawing mode
 */
function isInDrawingMode() {
    return isDrawingMode;
}

/**
 * Undo the last point in polygon drawing mode
 * @returns {boolean} True if a point was undone
 */
function undoLastDrawingPoint() {
    if (!isDrawingMode || currentDrawingPoints.length === 0) return false;

    // Remove the last point
    currentDrawingPoints.pop();

    // Remove the last point marker
    if (tempPointMarkers.length > 0) {
        const lastPointId = tempPointMarkers.pop();
        markersPlugin.removeMarker(lastPointId);
    }

    // Remove the last line marker
    if (tempLineMarkers.length > 0) {
        const lastLineId = tempLineMarkers.pop();
        markersPlugin.removeMarker(lastLineId);
    }

    // Update the finish button state
    const finishPolygonBtn = document.getElementById('finishPolygonBtn');
    if (finishPolygonBtn) {
        finishPolygonBtn.disabled = currentDrawingPoints.length < 3;
    }

    // Update the points counter
    updatePointsCounter(currentDrawingPoints.length);

    return true;
}

export {
    setupPolygonGeneration,
    generateRandomPolygons,
    clearAllPolygons,
    restorePolygons,
    savePolygonData,
    toggleDrawingMode,
    finishDrawingPolygon,
    isInDrawingMode,
    undoLastDrawingPoint
};
