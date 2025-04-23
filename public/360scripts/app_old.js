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

// Handle save button click
// function handleSaveTours() {
//     const tourData = {
//         name: 'My Virtual Tour', // Example name, you might want to get this from user input
//         slug: 'my-virtual-tour', // Example slug, ensure it's unique or generate it dynamically
//         description: 'A description of my virtual tour',
//         nodes: images.map(img => ({
//             id: img.id,
//             name: img.name,
//             panorama_path: img.url, // This should be the path where the image is stored
//             thumbnail_path: img.url, // Use the same for now, or generate a thumbnail
//             gps: null, // Add GPS data if available
//             sphere_correction: null, // Add sphere correction data if available
//             start_node: img.id === images[0].id, // Set the first image as the start node
//             // links: nodes.find(node => node.id === img.id).links,
//             links: getNodes().find(node => node.id === img.id)?.links || [],
//             markers: getNodeMarkers(img.id)
//         }))
//     };

//     fetch('/api/virtual-tours', {
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(tourData),
//     })
//     .then(response => response.json())
//     .then(data => {
//         if (data.success) {
//             alert('Tour saved successfully!');
//         } else {
//             alert('Failed to save tour.');
//         }
//     })
//     .catch(error => {
//         console.error('Error saving tour:', error);
//         alert('An error occurred while saving the tour.');
//     });
// }

// Enhanced version to send files to backend
function handleSaveTours() {
    const formData = new FormData();
    formData.append('name', 'My Virtual Tour'); // Example name
    formData.append('slug', 'my-virtual-tour'); // Example slug
    formData.append('description', 'A description of my virtual tour');

    images.forEach((img, index) => {
        formData.append(`panoramas[${index}]`, img.file); // Append each image file
        formData.append(`nodes[${index}][name]`, img.name);
        formData.append(`nodes[${index}][start_node]`, img.id === images[0].id);
        formData.append(`nodes[${index}][links]`, JSON.stringify(getNodes().find(node => node.id === img.id)?.links || []));
        formData.append(`nodes[${index}][markers]`, JSON.stringify(getNodeMarkers(img.id)));
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
