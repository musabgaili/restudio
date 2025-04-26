// nodes-manager.js - Managing the nodes data structure
// Module state
let nodes = [];
let currentNodeId = null;

// Initialize the node manager
function initializeNodeManager() {
    nodes = [];
    currentNodeId = null;
}

// Create node objects from images
function createNodes(images) {
    nodes = images.map((img, index) => ({
        id: img.id,
        panorama: img.url,
        name: img.name,
        // links: index < images.length - 1 ? [{
        //     nodeId: images[index + 1].id,
        //     position: {
        //         yaw: 0,
        //         pitch: 0
        //     }
        // }] : [],
        links: [],
        markers: [],
    }));

    return nodes;
}

// Get all nodes
function getNodes() {
    return nodes;
}

// Get current node ID
function getCurrentNodeId() {
    return currentNodeId;
}

// Update current node ID
function updateCurrentNodeId(nodeId) {
    currentNodeId = nodeId;
}

// Add a link between nodes
// function addNodeLink(sourceNodeId, targetNodeId, position) {
//     const sourceNode = nodes.find(node => node.id === sourceNodeId);
//     if (sourceNode) {
//         sourceNode.links.push({
//             nodeId: targetNodeId,
//             position
//         });
//     }
// }
// Update this function in nodes-manager.js
function addNodeLink(sourceNodeId, targetNodeId, position) {
    const sourceNode = nodes.find(node => node.id === sourceNodeId);
    if (sourceNode) {
        sourceNode.links.push({
            nodeId: targetNodeId,
            // Ensure position is stored as explicit yaw/pitch values
            position: {
                yaw: position.yaw,
                pitch: position.pitch
            }
        });
        console.log('Added link with position:', {yaw: position.yaw, pitch: position.pitch});
    }
}

// Add a marker to a node
function addMarkerToNode(nodeId, markerData) {
    const node = nodes.find(node => node.id === nodeId);
    if (node) {
        if (!node.markers) node.markers = [];
        node.markers.push(markerData);
    }
}

// Get markers for a specific node
function getNodeMarkers(nodeId) {
    const node = nodes.find(node => node.id === nodeId);
    return node?.markers || [];
}

export {
    initializeNodeManager,
    createNodes,
    getNodes,
    getCurrentNodeId,
    updateCurrentNodeId,
    addNodeLink,
    addMarkerToNode,
    getNodeMarkers
};
