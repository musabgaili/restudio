// app.js - Main application entry point
import { setupViewer, getViewer, getTourPlugin } from './viewer.js';
// import { initializeNodeManager, getCurrentNodeId } from './nodes-manager.js';
import { initializeNodeManager, getCurrentNodeId, getNodes, getNodeMarkers } from './nodes-manager.js';

import { initializeUIHandlers } from './ui-manager.js';

// Global app state
let images = [];

// Initialize the application
function initApp() {
    // Initialize components
    initializeUIHandlers({
        onImagesUploaded: handleImagesUploaded,
        onImageSelected: handleImageSelected,
        onAddLinkRequest: handleAddLinkRequest,
        onConfirmLink: handleConfirmLink
    });

    initializeNodeManager();
}

// Handle when user uploads images
function handleImagesUploaded(uploadedImages) {
    images = uploadedImages;
    setupViewer(images);
}

// Handle when user selects an image from the list
function handleImageSelected(imageId) {
    const tour = getTourPlugin();
    if (tour) tour.setCurrentNode(imageId);
}

// Handle request to add a link
function handleAddLinkRequest() {
    document.getElementById('linkDropdown').style.display = 'flex';
}

// Handle confirmation of link creation
function handleConfirmLink(targetNodeId) {
    const tour = getTourPlugin();
    if (!tour) return;

    // Set the pending link target in markers manager
    window.pendingLinkTarget = targetNodeId;
}

// Enhanced version to send files to backend
function handleSaveTours() {
    const formData = new FormData();
    formData.append('name', 'My Virtual Tour');
    formData.append('slug', 'my-virtual-tour');
    formData.append('description', 'A description of my virtual tour');

    // Step 1: Assign temp_ids
    images.forEach((img, index) => {
        img.temp_id = `node-${index}`;
    });

    images.forEach((img, index) => {
        const node = getNodes().find(n => n.id === img.id);
        const markers = getNodeMarkers(img.id).map(marker => {
            // Make a deep copy of the marker
            const updatedMarker = JSON.parse(JSON.stringify(marker));

            // Check if marker has a target node
            if (updatedMarker.data && updatedMarker.data.targetNodeId) {
                // Need to find the matching node in our temp_id mapping
                const targetNodeIndex = images.findIndex(i => i.id === updatedMarker.data.targetNodeId);

                if (targetNodeIndex !== -1) {
                    // Update targetNodeId to use the node's temp_id (node-X format) which will be mapped in backend
                    updatedMarker.data.targetNodeId = images[targetNodeIndex].temp_id;
                    console.log(`Updated marker target from ${marker.data.targetNodeId} to ${updatedMarker.data.targetNodeId}`);
                } else {
                    console.error(`Could not find node with id ${updatedMarker.data.targetNodeId}`);
                }
            }
            return updatedMarker;
        });

        formData.append(`panoramas[${index}]`, img.file);
        formData.append(`nodes[${index}][id]`, img.temp_id);
        formData.append(`nodes[${index}][name]`, img.name);
        formData.append(`nodes[${index}][start_node]`, img.id === images[0].id);
        formData.append(`nodes[${index}][markers]`, JSON.stringify(markers));
    });

    fetch('/api/virtual-tours', {
        method: 'POST',
        body: formData,
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Tour saved successfully!');
            } else {
                alert('Failed to save tour.');
            }
        })
        .catch(error => {
            console.error('Error saving tour:', error);
            alert('An error occurred while saving the tour.');
        });
}



// Export functions and data that might be needed elsewhere
export {
    initApp,
    images,
    getCurrentNodeId
};

// Initialize the app when DOM is ready
document.addEventListener('DOMContentLoaded', initApp);

document.getElementById('saveAllBtn').onclick = handleSaveTours;
