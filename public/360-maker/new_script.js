
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
            const PSV = window.PhotoSphereViewer;
            const markersList = Array.isArray(uploadedImages[name].hotspots) ?
                uploadedImages[name].hotspots : [];

            currentViewer = new PSV.Viewer({
                container: panoramaContainer,
                panorama: uploadedImages[name].url,
                loadingTxt: 'Loading...',
                navbar: 'autorotate zoom fullscreen',
                plugins: [
                    [PSV.MarkersPlugin, {
                        // markers: markersList
                        markers: [
                            {
                                // image marker that opens the panel when clicked
                                id: 'image',
                                position: { yaw: 0.32, pitch: 0.11 },
                                image: 'https://placehold.com/16x16',
                                size: { width: 32, height: 32 },
                                anchor: 'bottom center',
                                zoomLvl: 100,
                                tooltip: 'A image marker. <b>Click me!</b>',
                                content: document.getElementById('lorem-content').innerHTML,
                            },
                            {
                                // image marker rendered in the 3D scene
                                id: 'imageLayer',
                                imageLayer: 'https://placehold.com/16x16',
                                size: { width: 120, height: 94 },
                                position: { yaw: -0.45, pitch: -0.1 },
                                tooltip: 'Image embedded in the scene',
                            },
                            {
                                // html marker with custom style
                                id: 'text',
                                position: { yaw: 0, pitch: 0 },
                                html: 'HTML <b>marker</b> &hearts;',
                                anchor: 'bottom right',
                                scale: [0.5, 1.5],
                                style: {
                                    maxWidth: '100px',
                                    color: 'white',
                                    fontSize: '20px',
                                    fontFamily: 'Helvetica, sans-serif',
                                    textAlign: 'center',
                                },
                                tooltip: {
                                    content: 'An HTML marker',
                                    position: 'right',
                                },
                            },
                            {
                                // polygon marker
                                id: 'polygon',
                                polygon: [
                                    [6.2208, 0.0906], [0.0443, 0.1028], [0.2322, 0.0849], [0.4531, 0.0387],
                                    [0.5022, -0.0056], [0.4587, -0.0396], [0.252, -0.0453], [0.0434, -0.0575],
                                    [6.1302, -0.0623], [6.0094, -0.0169], [6.0471, 0.0320], [6.2208, 0.0906],
                                ],
                                svgStyle: {
                                    fill: 'rgba(200, 0, 0, 0.2)',
                                    stroke: 'rgba(200, 0, 50, 0.8)',
                                    strokeWidth: '2px',
                                },
                                tooltip: {
                                    content: 'A dynamic polygon marker',
                                    position: 'bottom right',
                                },
                            },
                            {
                                // polyline marker
                                id: 'polyline',
                                polylinePixels: [
                                    [2478, 1635], [2184, 1747], [1674, 1953], [1166, 1852],
                                    [709, 1669], [301, 1519], [94, 1399], [34, 1356],
                                ],
                                svgStyle: {
                                    stroke: 'rgba(140, 190, 10, 0.8)',
                                    strokeLinecap: 'round',
                                    strokeLinejoin: 'round',
                                    strokeWidth: '10px',
                                },
                                tooltip: 'A dynamic polyline marker',
                            },
                            {
                                // circle marker
                                id: 'circle',
                                circle: 20,
                                position: { textureX: 2500, textureY: 1200 },
                                tooltip: 'A circle marker',
                            },
                        ],
                    }]
                ]
            });

            // Access the markers plugin AFTER the viewer is ready
            currentViewer.once('ready', () => {
                const markersPlugin = currentViewer.getPlugin(PSV.MarkersPlugin);

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
            });
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

// Comments based on the URL:
// 1. Ensure that the PhotoSphereViewer and MarkersPlugin are correctly imported and initialized.
// 2. Verify that the markers are being added with the correct properties such as id, longitude, latitude, and html.
// 3. Check that the event listeners for 'select-marker' are correctly set up to handle marker selection.
// 4. Confirm that the markers are being updated and removed properly using the MarkersPlugin methods.
// 5. Ensure that the viewer is correctly destroyed and re-initialized when loading new images.