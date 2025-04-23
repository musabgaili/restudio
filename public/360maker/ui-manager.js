// ui-manager.js - Managing UI interactions and elements for polygon editor

/**
 * Initialize UI event handlers
 * @param {Object} options - Configuration options
 * @param {Function} options.onImagesUploaded - Handler for when images are uploaded
 * @param {Function} options.onImageSelected - Handler for when an image is selected
 * @param {Function} options.onAddLinkRequest - Handler for when add link is requested
 * @param {Function} options.onPolygonDrawingRequested - Handler for when polygon drawing is requested
 * @param {Function} options.onTextAdditionRequested - Handler for when text addition is requested
 * @param {Function} options.onClearAllRequested - Handler for when clearing all is requested
 * @param {Function} options.onSaveRequested - Handler for when saving data is requested
 * @param {Function} options.onUndoRequested - Handler for when undo is requested
 */
function initializeUIHandlers({
    onImagesUploaded,
    onImageSelected,
    onAddLinkRequest,
    onPolygonDrawingRequested,
    onTextAdditionRequested,
    onClearAllRequested,
    onSaveRequested,
    onUndoRequested
}) {
    // Image upload button
    const uploadBtn = document.getElementById('uploadBtn');
    const imageInput = document.getElementById('imageInput');

    if (uploadBtn && imageInput) {
        uploadBtn.onclick = () => {
            const files = Array.from(imageInput.files);
            if (!files.length) {
                showNotification('Please select image files first', 'warning');
                return;
            }

            const images = files.map((file, i) => ({
                id: (i + 1).toString(),
                file,
                url: URL.createObjectURL(file),
                name: file.name,
            }));

            renderThumbnails(images, onImageSelected);
            onImagesUploaded(images);
        };
    }

    // Add Link button
    const addLinkBtn = document.getElementById('addLinkBtn');
    if (addLinkBtn) {
        addLinkBtn.onclick = () => {
            onAddLinkRequest();
        };
    }

    // Draw Polygon button
    const drawPolygonBtn = document.getElementById('drawPolygonBtn');
    if (drawPolygonBtn) {
        drawPolygonBtn.onclick = () => {
            onPolygonDrawingRequested();
        };
    }

    // Add Text button
    const addTextBtn = document.getElementById('addTextBtn');
    if (addTextBtn) {
        addTextBtn.onclick = () => {
            onTextAdditionRequested();
        };
    }

    // Clear All button
    const clearAllBtn = document.getElementById('clearAllBtn');
    if (clearAllBtn) {
        clearAllBtn.onclick = () => {
            onClearAllRequested();
        };
    }

    // Save All button
    const saveAllBtn = document.getElementById('saveAllBtn');
    if (saveAllBtn) {
        saveAllBtn.onclick = () => {
            onSaveRequested();
        };
    }

    // Undo button
    const undoBtn = document.getElementById('undoBtn');
    if (undoBtn) {
        undoBtn.onclick = () => {
            onUndoRequested();
        };
    }

    // Color selection change
    setupColorSelector();

    // Stroke width slider
    setupStrokeWidthSlider();
}

/**
 * Set up the color selector for polygons
 */
function setupColorSelector() {
    const colorSelect = document.getElementById('polygonColor');
    const colorPreview = document.getElementById('currentColorPreview');

    if (colorSelect && colorPreview) {
        // Update color preview on change
        colorSelect.addEventListener('change', () => {
            const selectedIndex = parseInt(colorSelect.value, 10);
            const selectedColor = window.polygonColors[selectedIndex];
            colorPreview.style.backgroundColor = selectedColor;
        });

        // Set initial color preview
        const initialIndex = parseInt(colorSelect.value, 10);
        const initialColor = window.polygonColors[initialIndex];
        colorPreview.style.backgroundColor = initialColor;
    }
}

/**
 * Set up the stroke width slider
 */
function setupStrokeWidthSlider() {
    const strokeWidthSlider = document.getElementById('strokeWidth');
    const strokeWidthValue = document.getElementById('strokeWidthValue');

    if (strokeWidthSlider && strokeWidthValue) {
        // Update displayed value on change
        strokeWidthSlider.addEventListener('input', () => {
            const width = strokeWidthSlider.value;
            strokeWidthValue.textContent = `${width}px`;
        });

        // Set initial displayed value
        strokeWidthValue.textContent = `${strokeWidthSlider.value}px`;
    }
}

/**
 * Get the current selected stroke width
 * @returns {number} The current stroke width value
 */
function getSelectedStrokeWidth() {
    const strokeWidthSlider = document.getElementById('strokeWidth');
    return strokeWidthSlider ? parseInt(strokeWidthSlider.value, 10) : 2;
}

/**
 * Render image thumbnails in the sidebar
 * @param {Array} images - Array of image objects
 * @param {Function} onImageSelected - Handler for when an image is selected
 */
function renderThumbnails(images, onImageSelected) {
    const imageList = document.getElementById('imageList');
    imageList.innerHTML = '';

    images.forEach((img) => {
        const div = document.createElement('div');
        div.classList.add('mb-2');

        const thumb = document.createElement('img');
        thumb.src = img.url;
        thumb.classList.add('thumb', 'img-thumbnail');
        thumb.onclick = () => onImageSelected(img.id);
        thumb.id = `thumb-${img.id}`;

        const label = document.createElement('div');
        label.classList.add('thumb-label');
        label.textContent = img.name;

        div.appendChild(thumb);
        div.appendChild(label);
        imageList.appendChild(div);
    });
}

/**
 * Highlight the selected thumbnail
 * @param {string} nodeId - ID of the selected node
 */
function highlightSelectedThumbnail(nodeId) {
    document.querySelectorAll('.thumb').forEach(el => el.classList.remove('selected'));
    const selectedThumb = document.getElementById(`thumb-${nodeId}`);
    if (selectedThumb) selectedThumb.classList.add('selected');
}

/**
 * Show a notification message
 * @param {string} message - Message to display
 * @param {string} type - Message type (success, error, info)
 */
function showNotification(message, type = 'info') {
    const notifications = document.createElement('div');
    notifications.className = `alert alert-${type} alert-dismissible fade show position-fixed top-0 end-0 m-3`;
    notifications.style.zIndex = '9999';
    notifications.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    document.body.appendChild(notifications);

    // Remove after 3 seconds
    setTimeout(() => {
        notifications.remove();
    }, 3000);
}

export {
    initializeUIHandlers,
    renderThumbnails,
    highlightSelectedThumbnail,
    showNotification,
    getSelectedStrokeWidth
};
