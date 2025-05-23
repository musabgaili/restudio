// text-manager.js - Handling text creation and management in the 360° viewer
import { getCurrentNodeId, addTextToNode } from './nodes-manager.js';
import { getViewer } from './viewer.js';
import { generateUniqueId } from './utils.js';

// Module state
let viewer = null;
let markersPlugin = null;
let isTextMode = false;
let customFonts = {};
let selectedText = null;
let isDraggingText = false;
let isRotatingText = false;
let initialRotation = 0;
let initialTextPosition = null;
let lastMousePosition = { x: 0, y: 0 };
let textOverlay = null; // Store reference to text overlay

/**
 * Initialize the text manager
 * @param {Object} viewerInstance - The Photo Sphere Viewer instance
 * @param {Object} markersPluginInstance - The Markers Plugin instance
 */
function initializeTextManager(viewerInstance, markersPluginInstance) {
    viewer = viewerInstance;
    markersPlugin = markersPluginInstance;

    console.log('Initializing text manager with viewer:', !!viewer, 'markers plugin:', !!markersPlugin);

    // Create a click overlay for text placement (separate from the polygon drawing overlay)
    if (!textOverlay && viewer && viewer.container) {
        textOverlay = document.createElement('div');
        textOverlay.id = 'textPlacementOverlay';
        textOverlay.className = 'text-overlay';
        textOverlay.style.display = 'none';
        textOverlay.style.position = 'absolute';
        textOverlay.style.top = '0';
        textOverlay.style.left = '0';
        textOverlay.style.width = '100%';
        textOverlay.style.height = '100%';
        textOverlay.style.zIndex = '10';
        textOverlay.style.pointerEvents = 'auto';

        viewer.container.parentNode.appendChild(textOverlay);

        // Add click handler to the overlay
        textOverlay.addEventListener('click', handleTextPlacement);

        console.log('Text overlay created and attached');
    } else {
        console.error('Viewer container not found or text overlay already exists');
    }

    // Setup add text button
    const addTextBtn = document.getElementById('addTextBtn');
    if (addTextBtn) {
        // Remove existing event listeners to prevent duplicates
        const newBtn = addTextBtn.cloneNode(true);
        addTextBtn.parentNode.replaceChild(newBtn, addTextBtn);
        newBtn.addEventListener('click', toggleTextMode);
    }

    // Setup custom font uploader
    const customFontInput = document.getElementById('customFont');
    if (customFontInput) {
        // Remove existing event listeners to prevent duplicates
        const newInput = customFontInput.cloneNode(true);
        customFontInput.parentNode.replaceChild(newInput, customFontInput);
        newInput.addEventListener('change', handleCustomFontUpload);
    }

    // Setup text background color picker
    setupBackgroundColorPicker();

    // Setup text interaction (dragging and rotation)
    setupTextInteraction();
}

/**
 * Setup text background color picker
 */
function setupBackgroundColorPicker() {
    // Check if background color picker already exists
    if (!document.getElementById('textBgColor')) {
        // Find the parent container
        const textColorContainer = document.getElementById('textColor')?.parentElement;

        if (textColorContainer) {
            // Create a new row for the background color
            const newRow = document.createElement('div');
            newRow.className = 'row g-2 mb-2';
            newRow.innerHTML = `
                <div class="col-12">
                    <label for="textBgColor" class="form-label">Background</label>
                    <input type="color" id="textBgColor" class="form-control form-control-color w-100" value="#000000">
                </div>
                <div class="col-12">
                    <div class="form-check form-switch">
                        <input class="form-check-input" type="checkbox" id="textBgTransparent" checked>
                        <label class="form-check-label" for="textBgTransparent">
                            Transparent Background
                        </label>
                    </div>
                </div>
            `;

            // Insert the new row after the text color
            const nextElement = textColorContainer.nextElementSibling;
            if (nextElement) {
                nextElement.parentNode.insertBefore(newRow, nextElement);
            } else {
                textColorContainer.parentNode.appendChild(newRow);
            }

            // Add event listener for the transparency toggle
            const transparentBgToggle = document.getElementById('textBgTransparent');
            const bgColorInput = document.getElementById('textBgColor');

            if (transparentBgToggle && bgColorInput) {
                transparentBgToggle.addEventListener('change', (e) => {
                    bgColorInput.disabled = e.target.checked;
                });

                // Initial state
                bgColorInput.disabled = transparentBgToggle.checked;
            }
        }
    }
}

/**
 * Set up text interaction (dragging and rotation)
 */
function setupTextInteraction() {
    // Listen for marker select events for text markers
    if (markersPlugin) {
        markersPlugin.addEventListener('select-marker', (e) => {
            // Validate marker and ensure it has the proper structure
            if (!e.marker) {
                console.warn('Selected marker event received but marker is undefined');
                return;
            }

            // Log marker data for debugging
            console.log('Marker selected:', {
                id: e.marker.id,
                type: e.marker.data?.type,
                hasPosition: !!e.marker.position,
                position: e.marker.position
            });

            // Check if it's a text marker
            if (e.marker.data && e.marker.data.type === 'text') {
                // Store the selected text marker
                selectedText = e.marker;

                // Only show dragging controls if not in text mode
                if (!isTextMode) {
                    // Short timeout to ensure the viewer has finished processing the marker selection
                    setTimeout(() => {
                        showTextInteractionControls(true);
                    }, 50);
                }
            }
        });

        markersPlugin.addEventListener('unselect-marker', () => {
            selectedText = null;
            showTextInteractionControls(false);
        });
    }

    // Add mouse events for text dragging and rotation
    if (viewer && viewer.container) {
        viewer.container.addEventListener('mousedown', handleTextInteractionStart);
        viewer.container.addEventListener('mousemove', handleTextInteraction);
        viewer.container.addEventListener('mouseup', handleTextInteractionEnd);
        viewer.container.addEventListener('mouseleave', handleTextInteractionEnd);

        // Add event listeners to reposition controls when the viewer moves
        viewer.addEventListener('position-updated', updateControlsPosition);
        viewer.addEventListener('zoom-updated', updateControlsPosition);
        viewer.addEventListener('size-updated', updateControlsPosition);
    }
}

/**
 * Show or hide text interaction controls
 * @param {boolean} show - Whether to show or hide controls
 */
function showTextInteractionControls(show) {
    // Remove any existing controls
    const existingControls = document.getElementById('textControls');
    if (existingControls) {
        existingControls.remove();
    }

    if (show && selectedText) {
        // Log selected text details for debugging
        console.log('Selected text for controls:', {
            id: selectedText.id,
            hasPosition: !!selectedText.position,
            position: selectedText.position
        });

        // Create controls element
        const controls = document.createElement('div');
        controls.id = 'textControls';
        controls.className = 'text-interaction-controls';
        controls.innerHTML = `
            <div class="text-control-button drag-button" title="Drag Text (Click and hold to drag)">
                <i class="fas fa-arrows-alt"></i>
            </div>
            <div class="text-control-button rotate-button" title="Rotate Text (Click to rotate 10° or hold to rotate freely)">
                <i class="fas fa-sync-alt"></i>
            </div>
        `;
        document.body.appendChild(controls);

        // Position the controls near the selected text marker (not following the mouse)
        positionControlsNearText(selectedText);

        // Add event listeners to the buttons
        const dragButton = controls.querySelector('.drag-button');
        const rotateButton = controls.querySelector('.rotate-button');

        if (dragButton) {
            // Enable drag mode on mouse down
            dragButton.addEventListener('mousedown', (e) => {
                // Set mode to dragging
                isDraggingText = true;
                isRotatingText = false;

                // Change cursor to indicate drag mode
                viewer.container.style.cursor = 'move';

                // Store current text attributes for later comparison to detect changes
                initialTextPosition = selectedText.position;

                // Prevent event propagation to avoid panorama movement
                e.stopPropagation();
            });
        }

        if (rotateButton) {
            // Enable single click rotate (10° increment)
            rotateButton.addEventListener('click', (e) => {
                rotateTextBy10Degrees();
                e.stopPropagation();
            });

            // Enable free rotation on mouse down and hold
            rotateButton.addEventListener('mousedown', (e) => {
                // Set mode to rotating
                isRotatingText = true;
                isDraggingText = false;

                // Change cursor to indicate rotation mode
                viewer.container.style.cursor = 'grab';

                // Store initial rotation for continuous rotation calculation
                initialRotation = selectedText.data?.rotation || 0;

                // Store the current mouse position as reference for rotation calculation
                const rect = viewer.container.getBoundingClientRect();
                lastMousePosition = {
                    x: e.clientX - rect.left,
                    y: e.clientY - rect.top
                };

                // Prevent event propagation to avoid panorama movement
                e.stopPropagation();
            });
        }
    }
}

/**
 * Position the controls near the selected text marker
 * @param {Object} textMarker - The selected text marker
 */
function positionControlsNearText(textMarker) {
    const controls = document.getElementById('textControls');
    if (!controls || !textMarker || !viewer) return;

    try {
        // Get the viewer container dimensions
        const container = viewer.container;
        const rect = container.getBoundingClientRect();

        // Check if the text marker has valid position data
        if (!textMarker.position || typeof textMarker.position.yaw === 'undefined' || typeof textMarker.position.pitch === 'undefined') {
            console.warn('Text marker has invalid position data, using fallback positioning');
            useFallbackPositioning(controls, rect);
            return;
        }

        // Convert the text marker's spherical position to viewer coordinates
        const viewerPos = viewer.dataHelper.sphericalCoordsToViewerCoords(textMarker.position);

        if (!viewerPos) {
            console.warn('Failed to convert spherical coordinates to viewer coordinates, using fallback positioning');
            useFallbackPositioning(controls, rect);
            return;
        }

        // Convert viewer coordinates to screen coordinates
        const screenX = viewerPos.x * rect.width / viewer.getSize().width + rect.left;
        const screenY = viewerPos.y * rect.height / viewer.getSize().height + rect.top;

        // Position controls above the text
        // Since we're using transform: translate(-50%, 0) in CSS, we position at the exact X coordinate
        // and offset Y to ensure they don't obstruct the text (60px above the text)
        controls.style.left = `${screenX}px`;
        controls.style.top = `${screenY - 60}px`;
    } catch (error) {
        console.error('Error positioning controls:', error);
        // Use fallback positioning if anything goes wrong
        const rect = viewer.container.getBoundingClientRect();
        useFallbackPositioning(controls, rect);
    }
}

/**
 * Fallback method to position controls if the normal method fails
 * @param {HTMLElement} controls - The controls element
 * @param {DOMRect} rect - The viewer container rect
 */
function useFallbackPositioning(controls, rect) {
    // Position controls in the center top of the viewer
    controls.style.left = `${rect.left + rect.width / 2}px`;
    controls.style.top = `${rect.top + 60}px`; // 60px from the top
}

/**
 * Handle text marker selection updates by repositioning controls
 * This should be called when the viewer moves or zooms
 */
function updateControlsPosition() {
    if (selectedText) {
        positionControlsNearText(selectedText);
    }
}

/**
 * Rotate text by 10 degrees clockwise
 * Used for quick adjustments when user clicks the rotate button
 */
function rotateTextBy10Degrees() {
    if (!selectedText) return;

    // Get current rotation or default to 0
    const currentRotation = selectedText.data?.rotation || 0;

    // Calculate new rotation (add 10 degrees)
    const newRotation = (currentRotation + 10) % 360;

    // Apply the rotation to the text
    applyTextRotation(newRotation);
}

/**
 * Apply rotation to the selected text
 * @param {number} rotation - Rotation in degrees
 */
function applyTextRotation(rotation) {
    if (!selectedText) return;

    // Create updated HTML with rotation
    const updatedHTML = createTextMarkerHTML(
        selectedText.data.content,
        selectedText.data.styles,
        rotation,
        selectedText.data.backgroundColor,
        selectedText.data.transparentBg
    );

    // Update the marker with new rotation
    const updatedText = {
        ...selectedText,
        html: updatedHTML,
        data: {
            ...selectedText.data,
            rotation: rotation
        }
    };

    // Update marker in view
    markersPlugin.updateMarker(updatedText);

    // Update in storage
    updateTextInNode(getCurrentNodeId(), selectedText.id, {
        data: {
            ...selectedText.data,
            rotation: rotation
        }
    });

    // Update selected text reference
    selectedText = updatedText;
}

/**
 * Position the text controls near the cursor (deprecated - no longer used)
 * @param {MouseEvent} e - Mouse event
 */
function positionTextControls(e) {
    // This function is no longer used for following the cursor
    // Kept for compatibility but now redirects to the fixed positioning function
    if (selectedText) {
        positionControlsNearText(selectedText);
    }
}

/**
 * Handle the start of text interaction (drag or rotate)
 * @param {MouseEvent} e - Mouse event
 */
function handleTextInteractionStart(e) {
    // Skip if text mode is active, no text is selected, or no interaction mode is active
    if (isTextMode || !selectedText || (!isDraggingText && !isRotatingText)) return;

    // Stop any ongoing viewer animation to prevent conflicts
    viewer.stopAnimation();

    // Store initial mouse position for rotation calculations
    if (isRotatingText) {
        const rect = viewer.container.getBoundingClientRect();
        lastMousePosition = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    }

    // Prevent default viewer behavior (panorama movement)
    e.stopPropagation();
}

/**
 * Handle text interaction movement (drag or rotate)
 * @param {MouseEvent} e - Mouse event
 */
function handleTextInteraction(e) {
    if (!selectedText) return;

    if (isDraggingText) {
        // Handle text dragging when in drag mode
        handleTextDrag(e);
    } else if (isRotatingText) {
        // Handle text rotation when in rotate mode
        handleTextRotation(e);
    }
}

/**
 * Handle text dragging
 * @param {MouseEvent} e - Mouse event
 */
function handleTextDrag(e) {
    // Skip if not in dragging mode or no text is selected
    if (!isDraggingText || !selectedText) return;

    // Calculate new position based on mouse coordinates
    const rect = viewer.container.getBoundingClientRect();
    const size = viewer.getSize();

    // Convert mouse position to viewer coordinates
    const x = (e.clientX - rect.left) * size.width / rect.width;
    const y = (e.clientY - rect.top) * size.height / rect.height;

    // Convert viewer coordinates to spherical coordinates
    const newPosition = viewer.dataHelper.viewerCoordsToSphericalCoords({ x, y });

    if (!newPosition) return;

    // Create updated text marker with new position
    const updatedText = {
        ...selectedText,
        position: newPosition
    };

    // Update marker in view
    markersPlugin.updateMarker(updatedText);

    // Update in storage
    updateTextInNode(getCurrentNodeId(), selectedText.id, { position: newPosition });

    // Update selected text reference
    selectedText = updatedText;

    // Prevent panorama movement
    e.stopPropagation();
    e.preventDefault();
}

/**
 * Handle text rotation
 * @param {MouseEvent} e - Mouse event
 */
function handleTextRotation(e) {
    // Skip if not in rotation mode or no text is selected
    if (!isRotatingText || !selectedText) return;

    // Calculate rotation based on mouse movement relative to viewer center
    const rect = viewer.container.getBoundingClientRect();
    const currentPosition = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
    };

    // Calculate center of the viewer
    const viewerCenter = {
        x: rect.width / 2,
        y: rect.height / 2
    };

    // Get angle between initial position and center
    const initialAngle = Math.atan2(
        lastMousePosition.y - viewerCenter.y,
        lastMousePosition.x - viewerCenter.x
    );

    // Get angle between current position and center
    const currentAngle = Math.atan2(
        currentPosition.y - viewerCenter.y,
        currentPosition.x - viewerCenter.x
    );

    // Calculate rotation change in degrees
    const rotationChange = (currentAngle - initialAngle) * (180 / Math.PI);
    const newRotation = (initialRotation + rotationChange) % 360;

    // Apply the rotation
    applyTextRotation(newRotation);

    // Prevent panorama movement
    e.stopPropagation();
    e.preventDefault();
}

/**
 * Handle the end of text interaction
 */
function handleTextInteractionEnd() {
    if (!selectedText) return;

    // Reset interaction states
    isDraggingText = false;
    isRotatingText = false;

    // Reset cursor to default
    viewer.container.style.cursor = '';
}

/**
 * Toggle text placement mode
 */
function toggleTextMode() {
    isTextMode = !isTextMode;

    const addTextBtn = document.getElementById('addTextBtn');
    const textHelp = document.getElementById('textHelp');

    // Create text overlay if it doesn't exist
    if (!textOverlay && viewer && viewer.container) {
        console.log('Creating missing text overlay');
        textOverlay = document.createElement('div');
        textOverlay.id = 'textPlacementOverlay';
        textOverlay.className = 'text-overlay';
        textOverlay.style.position = 'absolute';
        textOverlay.style.top = '0';
        textOverlay.style.left = '0';
        textOverlay.style.width = '100%';
        textOverlay.style.height = '100%';
        textOverlay.style.zIndex = '10';
        textOverlay.style.pointerEvents = 'auto';
        viewer.container.parentNode.appendChild(textOverlay);
        textOverlay.addEventListener('click', handleTextPlacement);
    }

    if (isTextMode) {
        // Activate text mode
        if (addTextBtn) {
            addTextBtn.classList.remove('btn-primary');
            addTextBtn.classList.add('btn-warning');
            addTextBtn.innerHTML = '<i class="fas fa-times me-1"></i> Cancel Text';
        }

        // Show help overlay
        if (textHelp) {
            textHelp.style.display = 'block';
        }

        // Show text placement overlay
        if (textOverlay) {
            textOverlay.style.display = 'block';
            textOverlay.style.cursor = 'crosshair';
            console.log('Text overlay displayed');
        } else {
            console.error('Text overlay not found');
        }
    } else {
        // Deactivate text mode
        if (addTextBtn) {
            addTextBtn.classList.remove('btn-warning');
            addTextBtn.classList.add('btn-primary');
            addTextBtn.innerHTML = '<i class="fas fa-font me-1"></i> Add Text';
        }

        // Hide help overlay
        if (textHelp) {
            textHelp.style.display = 'none';
        }

        // Hide text placement overlay
        if (textOverlay) {
            textOverlay.style.display = 'none';
            console.log('Text overlay hidden');
        }
    }
}

/**
 * Handle click events to place text in the viewer
 * @param {Event} event - The click event
 */
function handleTextPlacement(event) {
    if (!isTextMode || !viewer || !markersPlugin) {
        console.log('Text placement click ignored: not in text mode or missing components');
        return;
    }

    console.log('Text placement click detected');

    // Get text from input
    const textInput = document.getElementById('textInput');
    if (!textInput || !textInput.value.trim()) {
        alert('Please enter some text first.');
        return;
    }

    // Get text content and styles
    const text = textInput.value.trim();
    const styles = getTextStyles();
    const backgroundColor = getBackgroundColor();
    const transparentBg = isBackgroundTransparent();

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

    console.log('Adding text at position:', position);

    // Add text marker
    addTextMarker(text, position, styles, 0, backgroundColor, transparentBg);

    // Exit text mode
    toggleTextMode();

    // Stop event propagation
    event.stopPropagation();
}

/**
 * Get current text styles from UI
 * @returns {Object} Object containing text styling properties
 */
function getTextStyles() {
    return {
        fontFamily: document.getElementById('fontFamily')?.value || 'Arial',
        fontSize: document.getElementById('fontSize')?.value || '16',
        fontWeight: document.getElementById('fontWeight')?.value || 'normal',
        color: document.getElementById('textColor')?.value || '#ffffff'
    };
}

/**
 * Get background color for text
 * @returns {string} Background color value
 */
function getBackgroundColor() {
    return document.getElementById('textBgColor')?.value || '#000000';
}

/**
 * Check if background should be transparent
 * @returns {boolean} True if background should be transparent
 */
function isBackgroundTransparent() {
    return document.getElementById('textBgTransparent')?.checked || true;
}

/**
 * Create HTML content for a text marker
 * @param {string} text - The text content
 * @param {Object} styles - Text styling properties
 * @param {number} rotation - Rotation angle in degrees
 * @param {string} backgroundColor - Background color
 * @param {boolean} transparentBg - Whether background is transparent
 * @returns {string} HTML content for the marker
 */
function createTextMarkerHTML(text, styles, rotation = 0, backgroundColor = '#000000', transparentBg = true) {
    // Calculate text width for background (rough estimate)
    const textLength = text.length;
    const fontSize = parseInt(styles.fontSize, 10);
    const estimatedWidth = textLength * (fontSize * 0.6) + 20; // Rough calculation
    const estimatedHeight = fontSize * 1.5;

    // Background opacity based on transparency setting
    const bgOpacity = transparentBg ? '0.5' : '1.0';

    // Create HTML content for text with rotation
    return `
        <svg width="${estimatedWidth}" height="${estimatedHeight}" xmlns="http://www.w3.org/2000/svg">
            <g transform="rotate(${rotation} ${estimatedWidth/2} ${estimatedHeight/2})">
                <rect
                    class="text-marker-background"
                    width="${estimatedWidth}"
                    height="${estimatedHeight}"
                    fill="${transparentBg ? 'rgba(0,0,0,0.5)' : backgroundColor + bgOpacity}"
                    rx="5"
                    ry="5"
                />
                <text
                    x="10"
                    y="${fontSize + 5}"
                    font-family="${styles.fontFamily}"
                    font-size="${styles.fontSize}px"
                    font-weight="${styles.fontWeight}"
                    fill="${styles.color}"
                >
                    ${text}
                </text>
            </g>
        </svg>
    `;
}

/**
 * Add a text marker to the viewer
 * @param {string} text - The text content
 * @param {Object} position - Position with yaw and pitch coordinates
 * @param {Object} styles - Text styling properties
 * @param {number} rotation - Rotation angle in degrees
 * @param {string} backgroundColor - Background color
 * @param {boolean} transparentBg - Whether background is transparent
 */
function addTextMarker(text, position, styles, rotation = 0, backgroundColor = '#000000', transparentBg = true) {
    const nodeId = getCurrentNodeId();
    if (!nodeId) return;

    // Ensure position has valid yaw and pitch values
    const validPosition = {
        yaw: position?.yaw || 0,
        pitch: position?.pitch || 0
    };

    const textId = `text-${generateUniqueId()}`;

    // Create HTML content for text
    const content = createTextMarkerHTML(text, styles, rotation, backgroundColor, transparentBg);

    // Create marker data
    const markerData = {
        id: textId,
        position: validPosition,  // Use validated position
        html: content,
        scale: [1, 1],
        tooltip: text,
        data: {
            type: 'text',
            content: text,
            styles: styles,
            rotation: rotation,
            backgroundColor: backgroundColor,
            transparentBg: transparentBg,
            createdAt: new Date().toISOString()
        }
    };

    // Log the marker data for debugging
    console.log('Adding text marker:', {
        id: textId,
        position: validPosition,
        hasPosition: true
    });

    // Add marker to view
    markersPlugin.addMarker(markerData);

    // Store text data
    addTextToNode(nodeId, markerData);

    // Clear text input
    const textInput = document.getElementById('textInput');
    if (textInput) textInput.value = '';
}

/**
 * Handle custom font upload
 * @param {Event} event - The change event from file input
 */
function handleCustomFontUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const fontName = file.name.split('.')[0];
    const fontUrl = URL.createObjectURL(file);

    // Create @font-face rule
    const fontFaceRule = `
        @font-face {
            font-family: "${fontName}";
            src: url("${fontUrl}") format("truetype");
        }
    `;

    // Add style element to head
    const styleEl = document.createElement('style');
    styleEl.textContent = fontFaceRule;
    document.head.appendChild(styleEl);

    // Store font for future use
    customFonts[fontName] = fontUrl;

    // Add to font family dropdown
    const fontFamily = document.getElementById('fontFamily');
    if (fontFamily) {
        const option = document.createElement('option');
        option.value = fontName;
        option.textContent = fontName + ' (Custom)';
        fontFamily.appendChild(option);
        fontFamily.value = fontName;
    }

    // Show preview
    showFontPreview(fontName);
}

/**
 * Show a preview of the uploaded font
 * @param {string} fontName - The name of the font to preview
 */
function showFontPreview(fontName) {
    // Create or get preview element
    let previewEl = document.querySelector('.custom-font-preview');
    if (!previewEl) {
        previewEl = document.createElement('div');
        previewEl.className = 'custom-font-preview fade-in';

        // Add after the custom font input
        const customFontInput = document.getElementById('customFont');
        if (customFontInput && customFontInput.parentNode) {
            customFontInput.parentNode.appendChild(previewEl);
        }
    }

    // Update preview text
    previewEl.textContent = 'The quick brown fox jumps over the lazy dog , مرحبا بك في العالم العربي';
    previewEl.style.fontFamily = fontName;
}

/**
 * Check if currently in text mode
 * @returns {boolean} True if in text mode
 */
function isInTextMode() {
    return isTextMode;
}

/**
 * Undo the last text action
 * @returns {boolean} True if a text action was undone
 */
function undoLastTextAction() {
    // This function is a placeholder for now
    // The actual undo functionality is handled in nodes-manager.js
    // This is just for future extensions specific to text mode
    return false;
}

/**
 * Update a text marker in the node data
 * @param {string} nodeId - ID of the node
 * @param {string} textId - ID of the text
 * @param {Object} updates - Object with properties to update
 */
function updateTextInNode(nodeId, textId, updates) {
    const node = window.getNodes().find(node => node.id === nodeId);
    if (!node || !node.texts) return;

    const textIndex = node.texts.findIndex(text => text.id === textId);
    if (textIndex === -1) return;

    // Update the text marker
    node.texts[textIndex] = {
        ...node.texts[textIndex],
        ...updates
    };

    // If updating nested properties like data, merge them
    if (updates.data) {
        node.texts[textIndex].data = {
            ...node.texts[textIndex].data,
            ...updates.data
        };
    }
}

export {
    initializeTextManager,
    toggleTextMode,
    addTextMarker,
    isInTextMode,
    undoLastTextAction,
    updateControlsPosition
};
