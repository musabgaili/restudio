// nodes-manager.js - Managing the nodes/images data structure
// Module state
let nodes = [];
let currentNodeId = null;

// Action history for undo
let actionHistory = [];
const MAX_HISTORY = 50; // Maximum number of actions to keep in history

/**
 * Initialize the node manager
 */
function initializeNodeManager() {
    nodes = [];
    currentNodeId = null;
    actionHistory = [];
}

/**
 * Create node objects from images
 * @param {Array} images - Array of image objects
 * @returns {Array} Array of node objects
 */
function createNodes(images) {
    nodes = images.map((img) => ({
        id: img.id,
        panorama: img.url,
        name: img.name,
        polygons: [], // Store polygons for each node/image
        texts: []     // Store text markers for each node/image
    }));

    return nodes;
}

/**
 * Get all nodes
 * @returns {Array} Array of all nodes
 */
function getNodes() {
    return nodes;
}

/**
 * Get current node ID
 * @returns {string} Current node ID
 */
function getCurrentNodeId() {
    return currentNodeId;
}

/**
 * Update current node ID
 * @param {string} nodeId - ID of current node
 */
function updateCurrentNodeId(nodeId) {
    currentNodeId = nodeId;
}

/**
 * Add a polygon to a node
 * @param {string} nodeId - ID of the node
 * @param {Object} polygonData - Polygon data object
 */
function addPolygonToNode(nodeId, polygonData) {
    const node = nodes.find(node => node.id === nodeId);
    if (node) {
        if (!node.polygons) node.polygons = [];

        // Add to history before modifying
        addToHistory({
            type: 'add_polygon',
            nodeId: nodeId,
            elementId: polygonData.id
        });

        node.polygons.push(polygonData);
    }
}

/**
 * Add a text marker to a node
 * @param {string} nodeId - ID of the node
 * @param {Object} textData - Text marker data object
 */
function addTextToNode(nodeId, textData) {
    const node = nodes.find(node => node.id === nodeId);
    if (node) {
        if (!node.texts) node.texts = [];

        // Add to history before modifying
        addToHistory({
            type: 'add_text',
            nodeId: nodeId,
            elementId: textData.id
        });

        node.texts.push(textData);
    }
}

/**
 * Get polygons for a specific node
 * @param {string} nodeId - ID of the node
 * @returns {Array} Array of polygon data objects
 */
function getNodePolygons(nodeId) {
    const node = nodes.find(node => node.id === nodeId);
    return node?.polygons || [];
}

/**
 * Get text markers for a specific node
 * @param {string} nodeId - ID of the node
 * @returns {Array} Array of text marker data objects
 */
function getNodeTexts(nodeId) {
    const node = nodes.find(node => node.id === nodeId);
    return node?.texts || [];
}

/**
 * Clear all polygons for a specific node
 * @param {string} nodeId - ID of the node
 */
function clearNodePolygons(nodeId) {
    const node = nodes.find(node => node.id === nodeId);
    if (node && node.polygons && node.polygons.length > 0) {
        // Add to history before clearing
        addToHistory({
            type: 'clear_polygons',
            nodeId: nodeId,
            data: [...node.polygons] // Make a copy of the polygons
        });

        node.polygons = [];
    }
}

/**
 * Clear all text markers for a specific node
 * @param {string} nodeId - ID of the node
 */
function clearNodeTexts(nodeId) {
    const node = nodes.find(node => node.id === nodeId);
    if (node && node.texts && node.texts.length > 0) {
        // Add to history before clearing
        addToHistory({
            type: 'clear_texts',
            nodeId: nodeId,
            data: [...node.texts] // Make a copy of the texts
        });

        node.texts = [];
    }
}

/**
 * Remove a specific element (polygon or text) from a node
 * @param {string} nodeId - ID of the node
 * @param {string} elementId - ID of the element to remove
 * @param {string} elementType - Type of element ('polygon' or 'text')
 * @returns {boolean} True if removal was successful
 */
function removeElementFromNode(nodeId, elementId, elementType) {
    const node = nodes.find(node => node.id === nodeId);
    if (!node) return false;

    if (elementType === 'polygon' && node.polygons) {
        const index = node.polygons.findIndex(polygon => polygon.id === elementId);
        if (index !== -1) {
            // Add to history before removing
            addToHistory({
                type: 'remove_polygon',
                nodeId: nodeId,
                elementId: elementId,
                data: node.polygons[index]
            });

            node.polygons.splice(index, 1);
            return true;
        }
    } else if (elementType === 'text' && node.texts) {
        const index = node.texts.findIndex(text => text.id === elementId);
        if (index !== -1) {
            // Add to history before removing
            addToHistory({
                type: 'remove_text',
                nodeId: nodeId,
                elementId: elementId,
                data: node.texts[index]
            });

            node.texts.splice(index, 1);
            return true;
        }
    }

    return false;
}

/**
 * Add an action to the history
 * @param {Object} action - The action to add to history
 */
function addToHistory(action) {
    // Add timestamp to action
    action.timestamp = Date.now();

    // Add action to history
    actionHistory.push(action);

    // Trim history if it exceeds max length
    if (actionHistory.length > MAX_HISTORY) {
        actionHistory.shift(); // Remove oldest action
    }

    // Enable undo button if it exists
    const undoBtn = document.getElementById('undoBtn');
    if (undoBtn) {
        undoBtn.disabled = false;
    }
}

/**
 * Undo the last action
 * @param {Object} markersPlugin - The markers plugin instance
 * @returns {Object|null} The undone action or null if no action to undo
 */
function undoLastAction(markersPlugin) {
    if (actionHistory.length === 0 || !markersPlugin) return null;

    // Get the last action
    const lastAction = actionHistory.pop();

    // Handle different action types
    switch (lastAction.type) {
        case 'add_polygon':
            // Remove the polygon that was added
            removeElementFromNode(lastAction.nodeId, lastAction.elementId, 'polygon');
            markersPlugin.removeMarker(lastAction.elementId);
            break;

        case 'add_text':
            // Remove the text that was added
            removeElementFromNode(lastAction.nodeId, lastAction.elementId, 'text');
            markersPlugin.removeMarker(lastAction.elementId);
            break;

        case 'remove_polygon':
            // Add back the polygon that was removed
            const node = nodes.find(node => node.id === lastAction.nodeId);
            if (node) {
                if (!node.polygons) node.polygons = [];
                node.polygons.push(lastAction.data);

                // If current node, also add back to view
                if (lastAction.nodeId === getCurrentNodeId()) {
                    markersPlugin.addMarker(lastAction.data);
                }
            }
            break;

        case 'remove_text':
            // Add back the text that was removed
            const textNode = nodes.find(node => node.id === lastAction.nodeId);
            if (textNode) {
                if (!textNode.texts) textNode.texts = [];
                textNode.texts.push(lastAction.data);

                // If current node, also add back to view
                if (lastAction.nodeId === getCurrentNodeId()) {
                    markersPlugin.addMarker(lastAction.data);
                }
            }
            break;

        case 'clear_polygons':
            // Restore all cleared polygons
            const polyNode = nodes.find(node => node.id === lastAction.nodeId);
            if (polyNode) {
                polyNode.polygons = lastAction.data;

                // If current node, also restore to view
                if (lastAction.nodeId === getCurrentNodeId()) {
                    lastAction.data.forEach(polygon => {
                        markersPlugin.addMarker(polygon);
                    });
                }
            }
            break;

        case 'clear_texts':
            // Restore all cleared texts
            const textClearNode = nodes.find(node => node.id === lastAction.nodeId);
            if (textClearNode) {
                textClearNode.texts = lastAction.data;

                // If current node, also restore to view
                if (lastAction.nodeId === getCurrentNodeId()) {
                    lastAction.data.forEach(text => {
                        markersPlugin.addMarker(text);
                    });
                }
            }
            break;
    }

    // Disable undo button if no more actions
    if (actionHistory.length === 0) {
        const undoBtn = document.getElementById('undoBtn');
        if (undoBtn) {
            undoBtn.disabled = true;
        }
    }

    return lastAction;
}

/**
 * Check if there are actions in the history that can be undone
 * @returns {boolean} True if there are actions to undo
 */
function canUndo() {
    return actionHistory.length > 0;
}

export {
    initializeNodeManager,
    createNodes,
    getNodes,
    getCurrentNodeId,
    updateCurrentNodeId,
    addPolygonToNode,
    addTextToNode,
    getNodePolygons,
    getNodeTexts,
    clearNodePolygons,
    clearNodeTexts,
    removeElementFromNode,
    undoLastAction,
    canUndo
};
