<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>360° Panorama Viewer</title>
    <!-- Bootstrap CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <!-- Photo Sphere Viewer CSS -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/photo-sphere-viewer@4.7.3/dist/photo-sphere-viewer.min.css">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/photo-sphere-viewer@4.7.3/dist/plugins/markers.min.css">
    <link rel="stylesheet" href="{{ asset('360-maker/new_style.css') }}">
</head>
<body>
    <!-- Navigation Bar -->
    <nav class="navbar navbar-expand-lg navbar-light bg-light mb-4">
        <div class="container-fluid">
            <a class="navbar-brand" href="#">Navbar</a>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarNav">
                <ul class="navbar-nav">
                    <!-- Empty navigation items -->
                </ul>
            </div>
        </div>
    </nav>

    <div class="container-fluid px-4">
        <div class="row">
            <!-- Sidebar -->
            <div class="col-md-3">
                <div class="card shadow-sm mb-4">
                    <div class="card-body">
                        <h3 class="card-title mb-4">360° Panorama Tour Creator</h3>

                        <div class="mb-4">
                            <label for="image-upload" class="form-label">Upload Images</label>
                            <input type="file" id="image-upload" class="form-control" accept="image/*" multiple>
                        </div>

                        <div class="mb-4">
                            <button id="link-button" class="btn btn-primary w-100">Create Link</button>
                        </div>

                        <h5 class="mt-4 mb-3">Uploaded Images</h5>
                        <ul id="image-list" class="list-group mb-4"></ul>
                    </div>
                </div>
            </div>

            <!-- Main Content -->
            {{-- <div class="col-md-9">
                <div class="card shadow-sm">
                    <div class="card-body p-0">
                        <div id="panorama-container" class="w-100 h-100"></div>
                    </div>
                </div>
            </div> --}}
            <div class="col-md-9 p-0">
                <div id="panorama-container"></div>
            </div>
        </div>
    </div>

    <!-- Image Selection Modal -->
    <div class="modal fade" id="linkModal" tabindex="-1" aria-labelledby="linkModalLabel" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="linkModalLabel">Select Target Image</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label for="target-image-select">Choose an image to link to:</label>
                        <select id="target-image-select" class="form-select mt-2">
                            <!-- Options will be populated dynamically -->
                        </select>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                    <button type="button" class="btn btn-primary" id="confirm-link">Confirm Link</button>
                </div>
            </div>
        </div>
    </div>

    <!-- Load JS libraries -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/three@0.137.0/build/three.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/uevent@2.0.0/browser.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/photo-sphere-viewer@4.7.3/dist/photo-sphere-viewer.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/photo-sphere-viewer@4.7.3/dist/plugins/markers.min.js"></script>

    {{-- <script src="new_script.js" type="module"></script> --}}
    <script src="{{ asset('360-maker/new_script.js') }}" type="module"></script>
    <!-- <script>
        document.addEventListener('DOMContentLoaded', () => {
            const imageUpload = document.getElementById('image-upload');
            const imageList = document.getElementById('image-list');
            const panoramaContainer = document.getElementById('panorama-container');
            const linkButton = document.getElementById('link-button');
            const targetImageSelect = document.getElementById('target-image-select');
            const confirmLinkButton = document.getElementById('confirm-link');

            // Bootstrap modal object
            const linkModal = new bootstrap.Modal(document.getElementById('linkModal'));

            let uploadedImages = {};
            let currentViewer = null;
            let currentImageName = null;
            let isLinking = false;
            let pendingHotspot = null;

            function renderImageList() {
                imageList.innerHTML = '';
                for (const name in uploadedImages) {
                    const listItem = document.createElement('li');
                    listItem.innerHTML = `
                        <img src="${uploadedImages[name].url}" alt="${name}">
                        <span class="image-name">${name}</span>
                    `;
                    listItem.addEventListener('click', () => {
                        loadImage(name);
                        document.querySelectorAll('#image-list li').forEach(li => li.classList.remove('selected'));
                        listItem.classList.add('selected');
                    });
                    if (name === currentImageName) {
                        listItem.classList.add('selected');
                    }
                    imageList.appendChild(listItem);
                }
            }

            function updateTargetImageDropdown() {
                targetImageSelect.innerHTML = '';

                // Create placeholder option
                const placeholderOption = document.createElement('option');
                placeholderOption.value = '';
                placeholderOption.textContent = '-- Select an image --';
                placeholderOption.selected = true;
                placeholderOption.disabled = true;
                targetImageSelect.appendChild(placeholderOption);

                // Add all uploaded images except current one
                for (const name in uploadedImages) {
                    if (name !== currentImageName) {
                        const option = document.createElement('option');
                        option.value = name;
                        option.textContent = name;
                        targetImageSelect.appendChild(option);
                    }
                }
            }

            function loadImage(name) {
                if (!uploadedImages[name]) return;

                currentImageName = name;

                if (currentViewer) {
                    currentViewer.destroy();
                    currentViewer = null;
                }

                try {
                    // Access the constructor correctly from the global namespace
                    const PSV = window.PhotoSphereViewer;

                    // Initialize with empty markers array first
                    const markersList = Array.isArray(uploadedImages[name].hotspots) ?
                                       uploadedImages[name].hotspots : [];

                    currentViewer = new PSV.Viewer({
                        container: panoramaContainer,
                        panorama: uploadedImages[name].url,
                        loadingTxt: 'Loading...',
                        navbar: 'autorotate zoom fullscreen',
                        plugins: [
                            [PSV.MarkersPlugin, {
                                markers: markersList
                            }]
                        ]
                    });

                    // Access the markers plugin
                    const markersPlugin = currentViewer.getPlugin(PSV.MarkersPlugin);

                    // Set up marker click event
                    if (markersPlugin) {
                        markersPlugin.on('select-marker', (e, marker) => {
                            if (marker && marker.data && marker.data.target) {
                                loadImage(marker.data.target);
                                document.querySelectorAll('#image-list li').forEach(li => li.classList.remove('selected'));
                                const targetName = marker.data.target;
                                const targetListItems = Array.from(imageList.children);
                                for (const item of targetListItems) {
                                    if (item.querySelector('.image-name').textContent === targetName) {
                                        item.classList.add('selected');
                                        break;
                                    }
                                }
                            }
                        });
                    }
                } catch (error) {
                    console.error("Error initializing PhotoSphereViewer:", error);
                }
            }

            imageUpload.addEventListener('change', (event) => {
                const files = event.target.files;
                for (const file of files) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        const imageName = file.name;
                        uploadedImages[imageName] = {
                            url: e.target.result,
                            hotspots: [] // Initialize with empty array
                        };
                        renderImageList();
                        if (Object.keys(uploadedImages).length === 1) {
                            loadImage(imageName);
                            if (imageList.firstChild) {
                                imageList.firstChild.classList.add('selected');
                            }
                        }
                    };
                    reader.readAsDataURL(file);
                }
                imageUpload.value = '';
            });

            linkButton.addEventListener('click', () => {
                if (!currentImageName || !currentViewer) {
                    alert("Please upload and select an image first.");
                    return;
                }
                isLinking = true;
                alert("Click on the panorama to place a hotspot on the current image.");
            });

            panoramaContainer.addEventListener('click', (event) => {
                if (isLinking && currentViewer && currentImageName) {
                    const PSV = window.PhotoSphereViewer;
                    const markersPlugin = currentViewer.getPlugin(PSV.MarkersPlugin);

                    if (markersPlugin) {
                        // Get the clicked position on the panorama
                        const position = currentViewer.getPosition();

                        const hotspotId = `hotspot-${Date.now()}`;
                        const newHotspot = {
                            id: hotspotId,
                            longitude: position.longitude,
                            latitude: position.latitude,
                            html: '<div class="hotspot"></div>',
                            tooltip: 'Link',
                            data: { target: null }
                        };

                        // Ensure hotspots array exists
                        if (!uploadedImages[currentImageName].hotspots) {
                            uploadedImages[currentImageName].hotspots = [];
                        }

                        // Add the hotspot to storage and to the viewer
                        uploadedImages[currentImageName].hotspots.push(newHotspot);
                        markersPlugin.addMarker(newHotspot);

                        isLinking = false;
                        pendingHotspot = newHotspot;

                        // Show modal with dropdown for target selection
                        updateTargetImageDropdown();
                        linkModal.show();
                    }
                }
            });

            // Handle confirm link button in modal
            confirmLinkButton.addEventListener('click', () => {
                const targetImageName = targetImageSelect.value;

                if (pendingHotspot && targetImageName && uploadedImages[targetImageName]) {
                    const PSV = window.PhotoSphereViewer;
                    const markersPlugin = currentViewer.getPlugin(PSV.MarkersPlugin);

                    // Update the hotspot with target information
                    pendingHotspot.data.target = targetImageName;
                    pendingHotspot.tooltip = `Go to ${targetImageName}`;

                    if (markersPlugin) {
                        markersPlugin.updateMarker(pendingHotspot);
                    }

                    pendingHotspot = null;
                    linkModal.hide();
                } else {
                    alert("Please select a valid target image.");

                    // If no valid selection, remove the pending hotspot
                    if (pendingHotspot) {
                        const PSV = window.PhotoSphereViewer;
                        const markersPlugin = currentViewer.getPlugin(PSV.MarkersPlugin);

                        if (markersPlugin) {
                            markersPlugin.removeMarker(pendingHotspot.id);
                        }

                        // Remove from storage
                        if (uploadedImages[currentImageName].hotspots) {
                            const index = uploadedImages[currentImageName].hotspots.findIndex(h => h.id === pendingHotspot.id);
                            if (index !== -1) {
                                uploadedImages[currentImageName].hotspots.splice(index, 1);
                            }
                        }

                        pendingHotspot = null;
                    }
                }
            });

            // Handle modal close/cancel
            document.getElementById('linkModal').addEventListener('hidden.bs.modal', () => {
                if (pendingHotspot) {
                    const PSV = window.PhotoSphereViewer;
                    const markersPlugin = currentViewer.getPlugin(PSV.MarkersPlugin);

                    if (markersPlugin) {
                        markersPlugin.removeMarker(pendingHotspot.id);
                    }

                    // Remove from storage
                    if (uploadedImages[currentImageName].hotspots) {
                        const index = uploadedImages[currentImageName].hotspots.findIndex(h => h.id === pendingHotspot.id);
                        if (index !== -1) {
                            uploadedImages[currentImageName].hotspots.splice(index, 1);
                        }
                    }

                    pendingHotspot = null;
                }
            });
        });
    </script> -->
</body>
</html>