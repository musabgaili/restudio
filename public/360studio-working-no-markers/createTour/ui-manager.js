// ui-manager.js - Managing UI interactions and elements
import { setPendingLinkTarget } from './markers-manager.js';

// Initialize UI event handlers
function initializeUIHandlers({ onImagesUploaded, onImageSelected, onAddLinkRequest, onConfirmLink }) {
    // Image upload button
    const uploadBtn = document.getElementById('uploadBtn');
    const imageInput = document.getElementById('imageInput');

    uploadBtn.onclick = () => {
        const files = Array.from(imageInput.files);
        if (!files.length) return;

        const images = files.map((file, i) => ({
            id: (i + 1).toString(),
            file,
            url: URL.createObjectURL(file),
            name: file.name,
        }));

        renderThumbnails(images, onImageSelected);
        updateDropdown(images);
        onImagesUploaded(images);
    };

    // Link creation controls
    const addLinkBtn = document.getElementById('addLinkBtn');
    const confirmLinkBtn = document.getElementById('confirmLinkBtn');

    addLinkBtn.onclick = () => {
        onAddLinkRequest();
    };

    confirmLinkBtn.onclick = () => {
        const targetSelect = document.getElementById('targetSelect');
        const targetNodeId = targetSelect.value;
        setPendingLinkTarget(targetNodeId);
        onConfirmLink(targetNodeId);
    };
}

// Render image thumbnails
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

// Update target node dropdown
function updateDropdown(images) {
    const targetSelect = document.getElementById('targetSelect');
    targetSelect.innerHTML = '';

    images.forEach(img => {
        const opt = document.createElement('option');
        opt.value = img.id;
        opt.textContent = img.name;
        targetSelect.appendChild(opt);
    });
}

// Highlight the selected thumbnail
function highlightSelectedThumbnail(nodeId) {
    document.querySelectorAll('.thumb').forEach(el => el.classList.remove('selected'));
    const selectedThumb = document.getElementById(`thumb-${nodeId}`);
    if (selectedThumb) selectedThumb.classList.add('selected');
}

export {
    initializeUIHandlers,
    renderThumbnails,
    updateDropdown,
    highlightSelectedThumbnail
};
