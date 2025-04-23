<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>360 Tour Studio - Create New Tour</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.2.3/css/bootstrap.min.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <!-- Photo Sphere Viewer CSS -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@photo-sphere-viewer/core@5/index.css">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@photo-sphere-viewer/markers-plugin@5/index.css">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@photo-sphere-viewer/virtual-tour-plugin@5/index.css">
    <link rel="stylesheet" href="{{ asset('360maker/styles.css') }}">
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
                    <h1><i class="fas fa-cube me-2"></i>360 Tour Studio</h1>
                    <div class="action-buttons">
                        <a href="{{ route('studio.index') }}" class="btn btn-outline-light me-2">
                            <i class="fas fa-list me-1"></i> All Tours
                        </a>
                        <button id="undoBtn" class="btn btn-outline-light" disabled title="Undo Last Action">
                            <i class="fas fa-undo"></i>
                        </button>
                        <button id="saveAllBtn" class="btn btn-primary">
                            <i class="fas fa-save me-1"></i> Save Tour
                        </button>
                    </div>
                </div>
            </div>
        </header>

        <div class="main-content">
            <!-- Sidebar with thumbnails and controls -->
            <div class="sidebar">
                <div class="accordion" id="controlsAccordion">
                    <!-- Tour Info Section -->
                    <div class="accordion-item">
                        <h2 class="accordion-header">
                            <button class="accordion-button" type="button" data-bs-toggle="collapse"
                                data-bs-target="#tourInfoPanel" aria-expanded="true">
                                <i class="fas fa-info-circle me-2"></i> Tour Info
                            </button>
                        </h2>
                        <div id="tourInfoPanel" class="accordion-collapse collapse show">
                            <div class="accordion-body">
                                <div class="mb-3">
                                    <label for="tourName" class="form-label">Tour Name</label>
                                    <input type="text" id="tourName" class="form-control" value="Untitled Tour">
                                </div>
                                <div class="mb-3">
                                    <label for="tourDescription" class="form-label">Description</label>
                                    <textarea id="tourDescription" class="form-control" rows="3"></textarea>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Upload Section -->
                    <div class="accordion-item">
                        <h2 class="accordion-header">
                            <button class="accordion-button" type="button" data-bs-toggle="collapse"
                                data-bs-target="#uploadPanel" aria-expanded="true">
                                <i class="fas fa-upload me-2"></i> Upload Images
                            </button>
                        </h2>
                        <div id="uploadPanel" class="accordion-collapse collapse show">
                            <div class="accordion-body">
                                <div class="upload-zone mb-3">
                                    <input type="file" id="imageInput" multiple accept="image/*" class="form-control mb-2">
                                    <button id="uploadBtn" class="btn btn-primary w-100">
                                        <i class="fas fa-cloud-upload-alt me-1"></i> Upload
                                    </button>
                                </div>
                                <div id="imageList" class="image-thumbnails">
                                    <!-- Thumbnails will be added here -->
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Node Linking Section -->
                    <div class="accordion-item">
                        <h2 class="accordion-header">
                            <button class="accordion-button" type="button" data-bs-toggle="collapse"
                                data-bs-target="#linkingPanel" aria-expanded="true">
                                <i class="fas fa-link me-2"></i> Node Linking
                            </button>
                        </h2>
                        <div id="linkingPanel" class="accordion-collapse collapse show">
                            <div class="accordion-body">
                                <button id="addLinkBtn" class="btn btn-primary w-100 mb-3">
                                    <i class="fas fa-plus me-1"></i> Add Link
                                </button>
                                <div id="linkDropdown" class="dropdown-menu p-3" style="display: none; position: relative; width: 100%;">
                                    <h6 class="dropdown-header">Select Target Node</h6>
                                    <select id="targetSelect" class="form-select mb-2">
                                        <!-- Options will be added dynamically -->
                                    </select>
                                    <div class="d-flex justify-content-between">
                                        <button id="cancelLinkBtn" class="btn btn-sm btn-outline-secondary">Cancel</button>
                                        <button id="confirmLinkBtn" class="btn btn-sm btn-primary">Confirm</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Drawing Tools Section -->
                    <div class="accordion-item">
                        <h2 class="accordion-header">
                            <button class="accordion-button" type="button" data-bs-toggle="collapse"
                                data-bs-target="#drawingPanel" aria-expanded="true">
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
                                        <label for="polygonColor" class="form-label">Color</label>
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
                                            </select>
                                        </div>
                                    </div>

                                    <div class="style-option mb-3">
                                        <label for="strokeWidth" class="form-label">Stroke Width</label>
                                        <div class="d-flex align-items-center">
                                            <input type="range" class="form-range me-2" id="strokeWidth" min="1" max="10" value="2" step="1">
                                            <span id="strokeWidthValue" class="badge bg-secondary">2px</span>
                                        </div>
                                    </div>

                                    <div class="style-option mb-3">
                                        <div class="form-check form-switch">
                                            <input class="form-check-input" type="checkbox" id="fillPolygons" checked>
                                            <label class="form-check-label" for="fillPolygons">
                                                Fill Polygons
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                <button id="clearAllBtn" class="btn btn-outline-danger w-100 mb-3">
                                    <i class="fas fa-trash-alt me-1"></i> Clear All
                                </button>

                                <div class="tool-group text-tools mb-3">
                                    <label class="tool-label">Text Insertion</label>
                                    <div class="mb-2">
                                        <button id="addTextBtn" class="btn btn-primary w-100">
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
                                        </div>
                                    </div>
                                </div>

                                <div class="style-group mb-3">
                                    <label class="style-label">Polygon Style</label>
                                    <div class="style-option mb-3">
                                        <label for="polygonColor" class="form-label">Color</label>
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
                                            </select>
                                        </div>
                                    </div>

                                    <div class="style-option mb-3">
                                        <label for="strokeWidth" class="form-label">Stroke Width</label>
                                        <div class="d-flex align-items-center">
                                            <input type="range" class="form-range me-2" id="strokeWidth" min="1" max="10" value="2" step="1">
                                            <span id="strokeWidthValue" class="badge bg-secondary">2px</span>
                                        </div>
                                    </div>

                                    <div class="style-option mb-3">
                                        <div class="form-check form-switch">
                                            <input class="form-check-input" type="checkbox" id="fillPolygons" checked>
                                            <label class="form-check-label" for="fillPolygons">
                                                Fill Polygons
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                <button id="clearAllBtn" class="btn btn-outline-danger w-100 mb-3">
                                    <i class="fas fa-trash-alt me-1"></i> Clear All
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

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
                <div id="linkHelp" class="viewer-overlay" style="display: none;">
                    <div class="alert alert-info">
                        <i class="fas fa-info-circle me-1"></i> Link Mode: Click where you want to place the link to another node.
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Bootstrap JS -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/js/bootstrap.bundle.min.js"></script>

    <!-- Initialize polygon colors -->
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
        ];
    </script>

    <!-- Import 360maker scripts with ES modules -->
    <script type="module">
        import { initApp, handleLinkConfirmed } from '{{ asset('360maker/app.js') }}';

        // Initialize the app when DOM is loaded
        document.addEventListener('DOMContentLoaded', function() {
            // Start the application
            initApp();

            // Link confirmation
            document.getElementById('confirmLinkBtn').addEventListener('click', function() {
                const targetSelect = document.getElementById('targetSelect');
                const targetNodeId = targetSelect.value;
                handleLinkConfirmed(targetNodeId);
            });

            // Link cancellation
            document.getElementById('cancelLinkBtn').addEventListener('click', function() {
                document.getElementById('linkDropdown').style.display = 'none';
            });
        });

        // Make handleLinkConfirmed available globally
        window.handleLinkConfirmed = handleLinkConfirmed;
    </script>
</body>

</html>
