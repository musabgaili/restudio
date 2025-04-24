// text-manager.js - Handling text creation and management
import { getCurrentNodeId, addTextToNode, getNodeTexts } from './nodes-manager.js';
import { getViewer } from './viewer.js';
import { generateUniqueId } from './utils.js';
import { showNotification } from './ui-manager.js';

// Module state
let viewer = null;
let markersPlugin = null;
let isTextMode = false;
let textOverlay = null;

/**
 * Initialize the text manager
 * @param {Object} viewerInstance - Viewer instance
 * @param {Object} markersPluginInstance - Markers plugin instance
 */
function initializeTextManager(viewerInstance, markersPluginInstance) {
    viewer = viewerInstance;
    markersPlugin = markersPluginInstance;

    setupTextHandlers();
    console.log('Text manager initialized');
}

/**
 * Set up handlers for text creation
 */
function setupTextHandlers() {
    // Create an overlay div for capturing clicks
    if (!textOverlay) {
        textOverlay = document.createElement('div');
        textOverlay.id = 'textOverlay';
        textOverlay.className = 'text-overlay';
        textOverlay.style.display = 'none';
        textOverlay.style.position = 'absolute';
        textOverlay.style.top = '0';
        textOverlay.style.left = '0';
        textOverlay.style.width = '100%';
        textOverlay.style.height = '100%';
        textOverlay.style.zIndex = '10';

        if (viewer && viewer.container && viewer.container.parentNode) {
            viewer.container.parentNode.appendChild(textOverlay);

            // Add click handler for text placement
            textOverlay.addEventListener('click', handleTextPlacement);
            console.log('Text overlay created and attached');
        } else {
            console.error('Cannot attach text overlay - viewer container not found');
        }
    }

    // Set up Add Text button
    const addTextBtn = document.getElementById('addTextBtn');
    if (addTextBtn) {
        console.log('Add Text button found');
    } else {
        console.error('Add Text button not found');
    }
}

/**
 * Handle text placement on click
 * @param {Object} event - Click event
 */
function handleTextPlacement(event) {
    if (!isTextMode || !viewer || !markersPlugin) return;

    event.preventDefault();
    event.stopPropagation();

    // Get text content from input
    const textInput = document.getElementById('textInput');
    const text = textInput ? textInput.value.trim() : '';

    if (!text) {
        showNotification('Please enter text before placing it', 'warning');
        return;
    }

    // Get text styling options
    const fontFamily = document.getElementById('fontFamily')?.value || 'Arial';
    const fontSize = parseInt(document.getElementById('fontSize')?.value || '16', 10);
    const fontWeight = document.getElementById('fontWeight')?.value || 'normal';
    const textColor = document.getElementById('textColor')?.value || '#ffffff';

    // Get click position in the viewer
    const rect = viewer.container.getBoundingClientRect();
    const viewerPoint = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
    };

    // Convert mouse coordinates to sphere coordinates
    const position = viewer.dataHelper.viewerCoordsToSphericalCoords({
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
    });

    // Create text marker
    createTextMarker(text, position, { fontFamily, fontSize, fontWeight, textColor });

    // Exit text mode
    toggleTextMode();
}

/**
 * Create a text marker at the specified position
 * @param {string} text - The text content
 * @param {Object} position - Position with yaw and pitch
 * @param {Object} style - Text styling options
 */
function createTextMarker(text, position, style) {
    if (!markersPlugin) return;

    // Get current node ID
    const nodeId = getCurrentNodeId();
    if (!nodeId) {
        showNotification('No active panorama selected', 'error');
        return;
    }

    // Create a unique ID for the text
    const textId = `text-${generateUniqueId()}`;

    // Create text data
    const textData = {
        id: textId,
        position: position,
        html: `<div class="text-marker" style="
            font-family: ${style.fontFamily};
            font-size: ${style.fontSize}px;
            font-weight: ${style.fontWeight};
            color: ${style.textColor};
        ">${text}</div>`,
        anchor: 'center',
        scale: [1, 1],
        size: { width: 200, height: 50 },
        tooltip: 'Text element',
        data: {
            type: 'text',
            createdAt: new Date().toISOString(),
            text: text,
            style: style
        }
    };

    // Add text to view
    markersPlugin.addMarker(textData);

    // Store text data
    addTextToNode(nodeId, textData);

    // Show success notification
    showNotification('Text added successfully!', 'success');

    // Enable undo button
    document.getElementById('undoBtn').disabled = false;

    console.log('Added text to node:', nodeId, textData);
    return textData;
}

/**
 * Toggle text mode on/off
 */
function toggleTextMode() {
    isTextMode = !isTextMode;
    console.log('Text mode toggled:', isTextMode);

    if (textOverlay) {
        textOverlay.style.display = isTextMode ? 'block' : 'none';
        console.log('Text overlay display:', textOverlay.style.display);
    } else {
        console.error('Text overlay not initialized');
        setupTextHandlers();
        if (textOverlay) {
            textOverlay.style.display = isTextMode ? 'block' : 'none';
            console.log('Text overlay created and displayed');
        }
    }

    // Show or hide text help overlay
    const textHelp = document.getElementById('textHelp');
    if (textHelp) {
        textHelp.style.display = isTextMode ? 'block' : 'none';
    }

    // Update button text
    const addTextBtn = document.getElementById('addTextBtn');
    if (addTextBtn) {
        addTextBtn.innerHTML = isTextMode ?
            '<i class="fas fa-times me-1"></i> Cancel' :
            '<i class="fas fa-font me-1"></i> Add Text';
    }

    if (isTextMode) {
        showNotification('Text Mode: Click where you want to place your text', 'info');
    } else {
        showNotification('Text placement canceled', 'info');
    }
}

/**
 * Check if currently in text mode
 * @returns {boolean} True if in text mode
 */
function isInTextMode() {
    return isTextMode;
}

export {
    initializeTextManager,
    isInTextMode,
    toggleTextMode
};
