<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>Photo Sphere Polygon Editor</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.2.3/css/bootstrap.min.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="{{ asset('360scripts/styles.css') }}">
    <link rel="stylesheet" href="{{ asset('360studio/drawInTour/styles.css') }}">
    <script type="importmap">
        {
          "imports": {
            "three": "https://cdn.jsdelivr.net/npm/three/build/three.module.js",
            "@photo-sphere-viewer/core": "https://cdn.jsdelivr.net/npm/@photo-sphere-viewer/core@5/index.module.js",
            "@photo-sphere-viewer/virtual-tour-plugin": "https://cdn.jsdelivr.net/npm/@photo-sphere-viewer/virtual-tour-plugin@5/index.module.js",
            "@photo-sphere-viewer/markers-plugin": "https://cdn.jsdelivr.net/npm/@photo-sphere-viewer/markers-plugin@5/index.module.js"
          }
        }
      </script>
</head>

<body class="modern-ui">
    <div class="app-container">
        <header class="app-header">
            <div class="container-fluid">
                <div class="header-content">
                    <h1><i class="fas fa-cube me-2"></i>Photo Sphere Editor</h1>
                    <div class="action-buttons">
                        <button id="undoBtn" class="btn btn-outline-light" disabled title="Undo Last Action">
                            <i class="fas fa-undo"></i>
                        </button>
                        <button id="saveAllBtn" class="btn btn-primary">
                            <i class="fas fa-save me-1"></i> Save Project
                        </button>
                    </div>
                </div>
            </div>
        </header>

        <div class="main-content">
            <!-- Sidebar with thumbnails and controls -->
            <div class="sidebar">
                <div class="accordion" id="controlsAccordion">
                    <!-- Tour Images Section -->
                    <div class="accordion-item">
                        <h2 class="accordion-header">
                            <button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#imagesPanel" aria-expanded="true">
                                <i class="fas fa-images me-2"></i> Tour Images
                            </button>
                        </h2>
                        <div id="imagesPanel" class="accordion-collapse collapse show">
                            <div class="accordion-body">
                                <div id="tourImageList" class="image-thumbnails">
                                    <!-- Thumbnails will be added here dynamically from API data -->
                                    <div class="loading-indicator text-center py-3">
                                        <div class="spinner-border text-primary" role="status">
                                            <span class="visually-hidden">Loading...</span>
                                        </div>
                                        <p class="mt-2">Loading tour images...</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Drawing Tools Section -->
                    <div class="accordion-item">
                        <h2 class="accordion-header">
                            <button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#drawingPanel" aria-expanded="true">
                                <i class="fas fa-pen me-2"></i> Drawing Tools
                            </button>
                        </h2>
                        <div id="drawingPanel" class="accordion-collapse collapse show">
                            <div class="accordion-body">
                                <div class="tool-group polygon-tools mb-3">
                                    <label class="tool-label">Polygon Drawing</label>
                                    <div class="btn-group w-100 mb-2" role="group">
                                        <button id="drawPolygonBtn" class="btn btn-primary">
                                            <i class="fas fa-draw-polygon me-1"></i> Draw
                                        </button>
                                        <button id="finishPolygonBtn" class="btn btn-success" disabled>
                                            <i class="fas fa-check me-1"></i> Finish
                                        </button>
                                    </div>
                                    <div class="form-text mb-2">Click to add points (min 3)</div>
                                    <div id="pointsCount" class="badge bg-info w-100">Points: 0</div>

                                </div>
                                <div class="style-group mb-3">
                                    <label class="style-label">Polygon Style</label>

                                    <div class="style-option mb-3">
                                        <label for="polygonColor" class="form-label" style="color: white">Color</label>
                                        <div class="d-flex align-items-center">
                                            <div id="currentColorPreview" class="color-preview me-2"></div>
                                            <select id="polygonColor" class="form-select">
                                                <option value="0">Red</option>
                                                <option value="1">Green</option>
                                                <option value="2">Blue</option>
                                                <option value="3">Yellow</option>
                                                <option value="4">Magenta</option>
                                                <option value="5">Cyan</option>
                                                <option value="6">Orange</option>
                                                <option value="7">Purple</option>
                                                <option value="8">Dark Green</option>
                                                <option value="9">Olive</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div class="style-option mb-3">
                                        <label for="strokeWidth" class="form-label" style="color: white">Stroke Width</label>
                                        <div class="d-flex align-items-center">
                                            <input type="range" class="form-range me-2" id="strokeWidth" min="1" max="10" value="2" step="1">
                                            <span id="strokeWidthValue" class="badge bg-secondary">2px</span>
                                        </div>
                                    </div>

                                    <div class="style-option mb-3">
                                        <div class="form-check form-switch">
                                            <input class="form-check-input" type="checkbox" id="fillPolygons" checked>
                                            <label class="form-check-label" for="fillPolygons" style="color: white">
                                                Fill Polygons
                                            </label>
                                        </div>
                                    </div>
                                </div>


                                <div class="tool-group text-tools mb-3">
                                    <label class="tool-label">Text Insertion</label>
                                    <div class="btn-group w-100 mb-2" role="group">
                                        <button id="addTextBtn" class="btn btn-primary">
                                            <i class="fas fa-font me-1"></i> Add Text
                                        </button>
                                    </div>
                                    <div class="text-input-group">
                                        <input type="text" id="textInput" class="form-control mb-2" placeholder="Enter text...">
                                        <div class="text-properties">
                                            <div class="row g-2 mb-2">
                                                <div class="col-6">
                                                    <label for="fontFamily" class="form-label">Font</label>
                                                    <select id="fontFamily" class="form-select">
                                                        <option value="Arial">Arial</option>
                                                        <option value="Helvetica">Helvetica</option>
                                                        <option value="Verdana">Verdana</option>
                                                        <option value="Poppins">Poppins</option>
                                                        <option value="Times New Roman">Times New Roman</option>
                                                        <option value="Georgia">Georgia</option>
                                                        <option value="Courier New">Courier New</option>
                                                    </select>
                                                </div>
                                                <div class="col-6">
                                                    <label for="fontSize" class="form-label">Size</label>
                                                    <input type="number" id="fontSize" class="form-control" value="16" min="8" max="72">
                                                </div>
                                            </div>
                                            <div class="row g-2 mb-2">
                                                <div class="col-6">
                                                    <label for="fontWeight" class="form-label">Weight</label>
                                                    <select id="fontWeight" class="form-select">
                                                        <option value="normal">Normal</option>
                                                        <option value="bold">Bold</option>
                                                        <option value="lighter">Light</option>
                                                    </select>
                                                </div>
                                                <div class="col-6">
                                                    <label for="textColor" class="form-label">Color</label>
                                                    <input type="color" id="textColor" class="form-control form-control-color w-100" value="#ffffff">
                                                </div>
                                            </div>
                                            <div class="row g-2">
                                                <div class="col-12">
                                                    <label for="customFont" class="form-label">Upload Font</label>
                                                    <input type="file" id="customFont" class="form-control" accept=".ttf,.otf,.woff,.woff2">
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>



                                <button id="clearPolygonsBtn" class="btn btn-outline-danger w-100 mb-3">
                                    <i class="fas fa-trash-alt me-1"></i> Clear All
                                </button>
                            </div>
                        </div>
                    </div>


                </div>
            </div>
        <div id="shit" data-tour-id="{{ $tour->id }}"></div>


            <!-- Main viewer area -->
            <div class="viewer-wrapper">
                <div id="viewer" class="viewer-container"></div>
                <div id="drawingHelp" class="viewer-overlay" style="display: none;">
                    <div class="alert alert-info">
                        <i class="fas fa-info-circle me-1"></i> Drawing Mode: Click to add points. Minimum 3 points required.
                    </div>
                </div>
                <div id="textHelp" class="viewer-overlay" style="display: none;">
                    <div class="alert alert-info">
                        <i class="fas fa-info-circle me-1"></i> Text Mode: Click where you want to place your text.
                    </div>
                </div>
            </div>
        </div>

    </div>

    <!-- Bootstrap JS -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/js/bootstrap.bundle.min.js"></script>

    <!-- Import scripts using ES modules -->
    <script>
        window.polygonColors = [
            'rgba(255, 0, 0, 0.5)',    // Red
            'rgba(0, 255, 0, 0.5)',    // Green
            'rgba(0, 0, 255, 0.5)',    // Blue
            'rgba(255, 255, 0, 0.5)',  // Yellow
            'rgba(255, 0, 255, 0.5)',  // Magenta
            'rgba(0, 255, 255, 0.5)',  // Cyan
            'rgba(255, 165, 0, 0.5)',  // Orange
            'rgba(128, 0, 128, 0.5)',  // Purple
            'rgba(0, 128, 0, 0.5)',    // Dark Green
            'rgba(128, 128, 0, 0.5)'   // Olive
        ];
    </script>
    <script type="module" src="{{ asset('360studio/drawInTour/app.js') }}"></script>
    <script type="module">
        import { initApp, handleSaveTours, getCurrentNodeId, changeNodeImage } from '{{ asset('360studio/drawInTour/app.js') }}';

        // Populate image list with thumbnails
        function populateImageList(nodes) {
            const imageListContainer = document.getElementById('tourImageList');
            if (!imageListContainer) return;

            // Clear loading indicator
            imageListContainer.innerHTML = '';

            if (!nodes || nodes.length === 0) {
                imageListContainer.innerHTML = '<div class="alert alert-info">No images found in this tour.</div>';
                return;
            }

            // Create thumbnails for each node
            nodes.forEach(node => {
                const thumbnailUrl = node.media && node.media.length > 0 && node.media[0].original_url ?
                    node.media[0].original_url :
                    `/storage/${node.thumbnail_path || node.panorama_path}`;

                const isActive = node.start_node ? 'active' : '';

                const thumbnailElement = document.createElement('div');
                thumbnailElement.className = `image-thumbnail ${isActive}`;
                thumbnailElement.dataset.id = node.id;
                thumbnailElement.innerHTML = `
                    <img src="${thumbnailUrl}" alt="${node.name}" class="thumbnail-img">
                    <div class="thumbnail-name">${node.name}</div>
                `;

                // Add click event to change panorama
                thumbnailElement.addEventListener('click', () => {
                    // Set all thumbnails to inactive
                    document.querySelectorAll('.image-thumbnail').forEach(thumb => {
                        thumb.classList.remove('active');
                    });

                    // Set clicked thumbnail to active
                    thumbnailElement.classList.add('active');

                    console.log('Changing to node ID:', node.id);
                    // Change the panorama in the viewer
                    changeNodeImage(node.id);
                });

                imageListContainer.appendChild(thumbnailElement);
            });
        }

        // Fetch tour data from API
        async function fetchTourData(tourId) {
            try {
                const response = await fetch(`/api/studio/tours/${tourId}/data`);
                if (!response.ok) {
                    throw new Error('Failed to fetch tour data');
                }
                const data = await response.json();
                console.log('Tour data:', data);

                // Process the tour data
                if (data && data.nodes && data.nodes.length > 0) {
                    // Ensure nodes have necessary data
                    data.nodes.forEach(node => {
                        if (!node.media || node.media.length === 0) {
                            console.warn('Node without media data:', node);
                            // Add empty media array if missing
                            node.media = [];
                        }
                    });

                    // Initialize the app with nodes data
                    initApp(data.nodes);

                    // Populate image list with thumbnails
                    populateImageList(data.nodes);
                } else {
                    console.error('No nodes data found in API response');
                    document.getElementById('tourImageList').innerHTML = '<div class="alert alert-warning">No images found in this tour.</div>';
                    initApp([]);
                }
            } catch (error) {
                console.error('Error fetching tour data:', error);
                document.getElementById('tourImageList').innerHTML = '<div class="alert alert-danger">Failed to load tour data. Please try again.</div>';
                initApp([]);
            }
        }

        // Add event listener to the save button
        document.addEventListener('DOMContentLoaded', function() {
            const tourIdElement = document.getElementById('shit');
            if (tourIdElement) {
                const tourId = tourIdElement.dataset.tourId;
                console.log('tourId', tourId);
                if (tourId) {
                    fetchTourData(tourId);
                } else {
                    console.error('No tour ID found in the element');
                    initApp([]);
                    document.getElementById('tourImageList').innerHTML = '<div class="alert alert-danger">No tour ID provided.</div>';
                }
            } else {
                console.error('Tour ID element not found');
                initApp([]);
                document.getElementById('tourImageList').innerHTML = '<div class="alert alert-danger">Missing tour ID element.</div>';
            }

            document.getElementById('saveAllBtn').addEventListener('click', function() {
                console.log('Save button clicked');
                handleSaveTours();
            });
        });
    </script>
</body>

</html>
