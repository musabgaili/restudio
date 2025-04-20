// app.js - Main application entry point
import { setupViewer, getViewer, getTourPlugin } from './viewer.js';
import { initializeNodeManager, getCurrentNodeId } from './nodes-manager.js';
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

// Export functions and data that might be needed elsewhere
export {
    initApp,
    images,
    getCurrentNodeId
};

// Initialize the app when DOM is ready
document.addEventListener('DOMContentLoaded', initApp);