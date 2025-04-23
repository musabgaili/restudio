// nodes-manager.js - Managing the nodes data structure
import { generateUniqueId } from './utils.js';

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
    console.log('Initializing node manager');
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
    console.log('Creating nodes from images:', images);

    nodes = images.map((img) => ({
        id: img.id,
        panorama: img.url,
        name: img.name,
        caption: img.name,
        // Additional properties for the VirtualTourPlugin
        markers: [],      // Marker links to other nodes
        polygons: [],     // Polygon shapes (with optional links)
        texts: [],        // Text elements (with optional links)
        links: []         // Explicit links to other nodes
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
    console.log('Updating current node ID:', nodeId);
    currentNodeId = nodeId;
}

/**
 * Add a link between nodes
 * @param {string} sourceNodeId - ID of the source node
 * @param {string} targetNodeId - ID of the target node
 * @param {Object} position - Position object with yaw and pitch
 */
function addNodeLink(sourceNodeId, targetNodeId, position) {
    console.log('Adding link:', { from: sourceNodeId, to: targetNodeId, position });

    const sourceNode = nodes.find(node => node.id === sourceNodeId);
    if (sourceNode) {
        if (!sourceNode.links) sourceNode.links = [];

        sourceNode.links.push({
            nodeId: targetNodeId,
            position: {
                yaw: position.yaw,
                pitch: position.pitch
            }
        });
    }
}

/**
 * Add a marker to a node
 * @param {string} nodeId - ID of the node
 * @param {Object} markerData - Marker data object
 */
function addMarkerToNode(nodeId, markerData) {
    console.log('Adding marker to node:', { nodeId, marker: markerData });

    const node = nodes.find(node => node.id === nodeId);
    if (node) {
        if (!node.markers) node.markers = [];

        // Add to history before modifying
        addToHistory({
            type: 'add_marker',
            nodeId: nodeId,
            elementId: markerData.id
        });

        node.markers.push(markerData);
    }
}

/**
 * Add a polygon to a node
 * @param {string} nodeId - ID of the node
 * @param {Object} polygonData - Polygon data object
 */
function addPolygonToNode(nodeId, polygonData) {
    console.log('Adding polygon to node:', { nodeId, polygon: polygonData });

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
 * Add a text element to a node
 * @param {string} nodeId - ID of the node
 * @param {Object} textData - Text data object
 */
function addTextToNode(nodeId, textData) {
    console.log('Adding text to node:', { nodeId, text: textData });

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
 * Get markers for a specific node
 * @param {string} nodeId - ID of the node
 * @returns {Array} Array of marker data objects
 */
function getNodeMarkers(nodeId) {
    const node = nodes.find(node => node.id === nodeId);
    return node?.markers || [];
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
 * Get text elements for a specific node
 * @param {string} nodeId - ID of the node
 * @returns {Array} Array of text data objects
 */
function getNodeTexts(nodeId) {
    const node = nodes.find(node => node.id === nodeId);
    return node?.texts || [];
}

/**
 * Clear markers for a specific node
 * @param {string} nodeId - ID of the node
 */
function clearNodeMarkers(nodeId) {
    const node = nodes.find(node => node.id === nodeId);
    if (node && node.markers && node.markers.length > 0) {
        // Add to history before clearing
        addToHistory({
            type: 'clear_markers',
            nodeId: nodeId,
            data: [...node.markers]
        });

        node.markers = [];
    }
}

/**
 * Clear polygons for a specific node
 * @param {string} nodeId - ID of the node
 */
function clearNodePolygons(nodeId) {
    const node = nodes.find(node => node.id === nodeId);
    if (node && node.polygons && node.polygons.length > 0) {
        // Add to history before clearing
        addToHistory({
            type: 'clear_polygons',
            nodeId: nodeId,
            data: [...node.polygons]
        });

        node.polygons = [];
    }
}

/**
 * Clear text elements for a specific node
 * @param {string} nodeId - ID of the node
 */
function clearNodeTexts(nodeId) {
    const node = nodes.find(node => node.id === nodeId);
    if (node && node.texts && node.texts.length > 0) {
        // Add to history before clearing
        addToHistory({
            type: 'clear_texts',
            nodeId: nodeId,
            data: [...node.texts]
        });

        node.texts = [];
    }
}

/**
 * Remove a specific element from a node
 * @param {string} nodeId - ID of the node
 * @param {string} elementId - ID of the element to remove
 * @param {string} elementType - Type of element ('marker', 'polygon', 'text')
 * @returns {boolean} True if removal was successful
 */
function removeElementFromNode(nodeId, elementId, elementType) {
    console.log('Removing element from node:', { nodeId, elementId, elementType });

    const node = nodes.find(node => node.id === nodeId);
    if (!node) return false;

    let collection, type;
    switch (elementType) {
        case 'marker':
            collection = node.markers;
            type = 'remove_marker';
            break;
        case 'polygon':
            collection = node.polygons;
            type = 'remove_polygon';
            break;
        case 'text':
            collection = node.texts;
            type = 'remove_text';
            break;
        default:
            return false;
    }

    if (collection) {
        const index = collection.findIndex(item => item.id === elementId);
        if (index !== -1) {
            // Add to history before removing
            addToHistory({
                type: type,
                nodeId: nodeId,
                elementId: elementId,
                data: collection[index]
            });

            collection.splice(index, 1);
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
    console.log('Adding action to history:', action);

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
    console.log('Undoing action:', lastAction);

    // Handle different action types
    switch (lastAction.type) {
        case 'add_marker':
        case 'add_polygon':
        case 'add_text':
            // Get the element type from the action type
            const elementType = lastAction.type.split('_')[1];
            // Remove the element that was added
            removeElementFromNode(lastAction.nodeId, lastAction.elementId, elementType);
            markersPlugin.removeMarker(lastAction.elementId);
            break;

        case 'remove_marker':
        case 'remove_polygon':
        case 'remove_text':
            // Get the element type and node
            const type = lastAction.type.split('_')[1];
            const node = nodes.find(node => node.id === lastAction.nodeId);

            if (node) {
                // Determine which collection to add back to
                let collection;
                switch (type) {
                    case 'marker': collection = 'markers'; break;
                    case 'polygon': collection = 'polygons'; break;
                    case 'text': collection = 'texts'; break;
                }

                if (!node[collection]) node[collection] = [];
                node[collection].push(lastAction.data);

                // If current node, also add back to view
                if (lastAction.nodeId === getCurrentNodeId()) {
                    markersPlugin.addMarker(lastAction.data);
                }
            }
            break;

        case 'clear_markers':
        case 'clear_polygons':
        case 'clear_texts':
            // Get the element type and node
            const clearType = lastAction.type.split('_')[1];
            const clearNode = nodes.find(node => node.id === lastAction.nodeId);

            if (clearNode) {
                // Determine which collection to restore
                let clearCollection;
                switch (clearType) {
                    case 'marker': clearCollection = 'markers'; break;
                    case 'polygon': clearCollection = 'polygons'; break;
                    case 'text': clearCollection = 'texts'; break;
                }

                clearNode[clearCollection] = lastAction.data;

                // If current node, also restore to view
                if (lastAction.nodeId === getCurrentNodeId()) {
                    lastAction.data.forEach(item => {
                        markersPlugin.addMarker(item);
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
    addNodeLink,
    addMarkerToNode,
    addPolygonToNode,
    addTextToNode,
    getNodeMarkers,
    getNodePolygons,
    getNodeTexts,
    clearNodeMarkers,
    clearNodePolygons,
    clearNodeTexts,
    removeElementFromNode,
    undoLastAction,
    canUndo
};
