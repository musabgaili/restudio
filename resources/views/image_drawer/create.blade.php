<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Panorama Drawing Tool - Three.js + Fabric.js</title>
    <!-- Bootstrap CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">

    <style>
        body {
            height: 100vh;
            overflow: hidden;
            margin: 0;
            padding: 0;
        }

        .sidebar {
            height: 100vh;
            overflow-y: auto;
            background-color: #f8f9fa;
            padding: 1rem;
            z-index: 100;
        }

        .img-preview {
            max-width: 100%;
            height: auto;
            cursor: pointer;
            border: 2px solid transparent;
            margin-bottom: 0.5rem;
        }

        .img-preview.selected {
            border-color: #0d6efd;
        }

        #panorama-container {
            width: 100%;
            height: 100vh;
            position: relative;
            overflow: hidden;
            background-color: #000;
        }

        #drawing-canvas {
            position: absolute !important;
            top: 0;
            left: 0;
            width: 100% !important;
            height: 100% !important;
            z-index: 10;
        }

        .upper-canvas {
            pointer-events: none !important;
        }

        .drawing-active .upper-canvas {
            pointer-events: auto !important;
            cursor: crosshair !important;
        }

        .color-picker {
            width: 100%;
            margin-bottom: 10px;
        }

        #debug-info {
            position: absolute;
            bottom: 10px;
            left: 10px;
            color: white;
            background: rgba(0,0,0,0.7);
            padding: 10px;
            font-size: 12px;
            z-index: 100;
            width: 300px;
            max-height: 150px;
            overflow-y: auto;
        }
    </style>
</head>

<body>
    <div class="container-fluid">
        <div class="row">
            <!-- Sidebar -->
            <div class="col-md-3 sidebar">
                <h5 class="mb-3">Upload Panoramas</h5>
                <input type="file" class="form-control mb-3" id="image-input" accept="image/*">
                <div id="image-list" class="mb-4"></div>

                <h5 class="mb-3">Drawing Tools</h5>
                <button id="draw-line-btn" class="btn btn-primary w-100 mb-2">Draw Line</button>
                <button id="clear-btn" class="btn btn-danger w-100 mb-3">Clear All</button>

                <div class="mt-3">
                    <label for="color-picker">Line Color:</label>
                    <input type="color" id="color-picker" class="color-picker" value="#ffffff">
                </div>

                <div class="mt-3">
                    <label for="line-width">Line Width:</label>
                    <input type="range" id="line-width" class="form-range" min="1" max="20" value="5">
                </div>
            </div>

            <!-- Viewer -->
            <div class="col-md-9 p-0">
                <div id="panorama-container">
                    <!-- Three.js panorama renderer will go here -->
                    <canvas id="drawing-canvas"></canvas>
                    <div id="debug-info"></div>
                </div>
            </div>
        </div>
    </div>

    <!-- Load JS libraries -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/three@0.149.0/build/three.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/fabric@5.3.0/dist/fabric.min.js"></script>
    <script>
        // Main variables
        let scene, camera, renderer;
        let isUserInteracting = false;
        let onPointerDownMouseX = 0, onPointerDownMouseY = 0;
        let lon = 0, onPointerDownLon = 0;
        let lat = 0, onPointerDownLat = 0;
        let phi = 0, theta = 0;
        let panoramaMesh = null;

        // Fabric.js canvas
        let canvas;
        let drawingMode = false;
        let lineColor = '#ffffff';
        let lineWidth = 5;
        let startPoint = null;
        let activeLine = null;

        // Logging function
        function logDebug(message) {
            console.log(message);

            const debugInfo = document.getElementById('debug-info');
            const time = new Date().toLocaleTimeString();
            debugInfo.innerHTML += `<div>[${time}] ${message}</div>`;
            debugInfo.scrollTop = debugInfo.scrollHeight;
        }

        // DOM elements
        const panoramaContainer = document.getElementById('panorama-container');
        const imageInput = document.getElementById('image-input');
        const imageList = document.getElementById('image-list');
        const drawLineBtn = document.getElementById('draw-line-btn');
        const clearBtn = document.getElementById('clear-btn');
        const colorPicker = document.getElementById('color-picker');
        const lineWidthInput = document.getElementById('line-width');

        // Initialize the Three.js panorama viewer
        function initPanoramaViewer() {
            logDebug("Initializing Three.js viewer");

            try {
                // Create scene
                scene = new THREE.Scene();
                logDebug("Scene created");

                // Create camera
                camera = new THREE.PerspectiveCamera(
                    75,
                    panoramaContainer.clientWidth / panoramaContainer.clientHeight,
                    0.1,
                    1000
                );
                camera.position.z = 0.01;
                logDebug(`Camera created: aspect ${camera.aspect}, fov ${camera.fov}`);

                // Create renderer
                renderer = new THREE.WebGLRenderer({ antialias: true });
                renderer.setPixelRatio(window.devicePixelRatio);
                renderer.setSize(panoramaContainer.clientWidth, panoramaContainer.clientHeight);
                renderer.setClearColor(0x000000);
                logDebug(`Renderer created: ${renderer.domElement.width}x${renderer.domElement.height}`);

                // Add renderer to DOM
                panoramaContainer.appendChild(renderer.domElement);

                // Initialize Fabric.js
                initDrawingCanvas();

                // Add event listeners
                panoramaContainer.addEventListener('mousedown', onDocumentMouseDown);
                panoramaContainer.addEventListener('mousemove', onDocumentMouseMove);
                panoramaContainer.addEventListener('mouseup', onDocumentMouseUp);
                panoramaContainer.addEventListener('wheel', onDocumentMouseWheel);
                window.addEventListener('resize', onWindowResize);

                // Start animation loop
                animate();

                logDebug("THREE.js initialization complete");
            } catch (error) {
                logDebug(`Error initializing Three.js: ${error.message}`);
                console.error(error);
            }
        }

        // Load panorama image
        function loadPanorama(imageUrl) {
            logDebug(`Loading panorama image: ${imageUrl.substring(0, 30)}...`);

            try {
                // Create sphere geometry for the panorama
                const geometry = new THREE.SphereGeometry(500, 60, 40);
                geometry.scale(-1, 1, 1); // Inside out
                logDebug("Sphere geometry created");

                // Load texture
                const loader = new THREE.TextureLoader();
                logDebug("Created texture loader");

                loader.load(
                    imageUrl,

                    // On successful load
                    function(texture) {
                        logDebug("✅ Texture loaded successfully");
                        console.log("Texture:", texture);

                        // Create material with texture
                        const material = new THREE.MeshBasicMaterial({
                            map: texture,
                            side: THREE.BackSide // Required for inside view
                        });
                        logDebug("Material created with texture");

                        // Remove existing panorama
                        if (panoramaMesh) {
                            scene.remove(panoramaMesh);
                            logDebug("Removed existing panorama mesh");
                        }

                        // Create new mesh
                        panoramaMesh = new THREE.Mesh(geometry, material);
                        scene.add(panoramaMesh);
                        logDebug("Added panorama mesh to scene");

                        // Reset view
                        lon = 0;
                        lat = 0;

                        // Log scene contents
                        console.log("Scene contents:", scene);

                        // Force render
                        updateCamera();
                        renderer.render(scene, camera);
                        logDebug("Forced initial render");
                    },

                    // On progress
                    function(xhr) {
                        const percent = Math.round(xhr.loaded / xhr.total * 100);
                        logDebug(`Loading progress: ${percent}%`);
                    },

                    // On error
                    function(error) {
                        logDebug(`❌ Error loading texture: ${error.message}`);
                        console.error("Texture loading error:", error);
                    }
                );
            } catch (error) {
                logDebug(`❌ Error in loadPanorama: ${error.message}`);
                console.error("LoadPanorama error:", error);
            }
        }

        // Handle mouse wheel zoom
        function onDocumentMouseWheel(event) {
            try {
                const fov = camera.fov + event.deltaY * 0.05;
                camera.fov = THREE.MathUtils.clamp(fov, 30, 90);
                camera.updateProjectionMatrix();
                logDebug(`Zoom changed: FOV = ${camera.fov.toFixed(1)}`);
            } catch (error) {
                logDebug(`Error during zoom: ${error.message}`);
            }
        }

        // Handle mouse down
        function onDocumentMouseDown(event) {
            try {
                event.preventDefault();

                // Don't process panorama movement if we're in drawing mode
                if (drawingMode) {
                    logDebug("Mouse down in drawing mode");
                    handleDrawingMouseDown(event);
                    return;
                }

                // Process panorama movement
                isUserInteracting = true;
                onPointerDownMouseX = event.clientX;
                onPointerDownMouseY = event.clientY;
                onPointerDownLon = lon;
                onPointerDownLat = lat;

                logDebug("Panorama drag started");
            } catch (error) {
                logDebug(`Error on mouse down: ${error.message}`);
            }
        }

        // Handle drawing-specific mouse down
        function handleDrawingMouseDown(event) {
            try {
                const canvasRect = canvas.getElement().getBoundingClientRect();
                const x = event.clientX - canvasRect.left;
                const y = event.clientY - canvasRect.top;

                logDebug(`Drawing click at (${x}, ${y})`);

                if (!startPoint) {
                    // Start new line
                    startPoint = new fabric.Point(x, y);
                    logDebug("Start point set");

                    // Create line
                    activeLine = new fabric.Line([x, y, x, y], {
                        stroke: lineColor,
                        strokeWidth: lineWidth,
                        selectable: true,
                        evented: true
                    });

                    canvas.add(activeLine);
                    canvas.renderAll();
                    logDebug("New line started");
                    console.log("Active line:", activeLine);
                } else {
                    // Complete the line
                    activeLine.set({
                        x2: x,
                        y2: y
                    });

                    canvas.renderAll();
                    logDebug(`Line completed: (${activeLine.x1}, ${activeLine.y1}) to (${x}, ${y})`);

                    // Reset for next line
                    startPoint = null;
                    activeLine = null;
                }
            } catch (error) {
                logDebug(`❌ Error in drawing: ${error.message}`);
                console.error("Drawing error:", error);
            }
        }

        // Handle mouse move
        function onDocumentMouseMove(event) {
            try {
                if (isUserInteracting && !drawingMode) {
                    // Update panorama view
                    lon = (onPointerDownMouseX - event.clientX) * 0.2 + onPointerDownLon;
                    lat = (event.clientY - onPointerDownMouseY) * 0.2 + onPointerDownLat;
                    updateCamera();
                } else if (drawingMode && startPoint && activeLine) {
                    // Update line preview
                    const canvasRect = canvas.getElement().getBoundingClientRect();
                    const x = event.clientX - canvasRect.left;
                    const y = event.clientY - canvasRect.top;

                    activeLine.set({
                        x2: x,
                        y2: y
                    });

                    canvas.renderAll();
                }
            } catch (error) {
                logDebug(`Error on mouse move: ${error.message}`);
            }
        }

        // Handle mouse up
        function onDocumentMouseUp() {
            isUserInteracting = false;
        }

        // Update camera position
        function updateCamera() {
            try {
                lat = Math.max(-85, Math.min(85, lat));
                phi = THREE.MathUtils.degToRad(90 - lat);
                theta = THREE.MathUtils.degToRad(lon);

                const x = 500 * Math.sin(phi) * Math.cos(theta);
                const y = 500 * Math.cos(phi);
                const z = 500 * Math.sin(phi) * Math.sin(theta);

                camera.lookAt(x, y, z);
            } catch (error) {
                logDebug(`Error updating camera: ${error.message}`);
            }
        }

        // Handle window resize
        function onWindowResize() {
            try {
                camera.aspect = panoramaContainer.clientWidth / panoramaContainer.clientHeight;
                camera.updateProjectionMatrix();

                renderer.setSize(panoramaContainer.clientWidth, panoramaContainer.clientHeight);

                // Update Fabric.js canvas size
                canvas.setWidth(panoramaContainer.clientWidth);
                canvas.setHeight(panoramaContainer.clientHeight);
                canvas.renderAll();

                logDebug(`Window resized: ${panoramaContainer.clientWidth}x${panoramaContainer.clientHeight}`);
            } catch (error) {
                logDebug(`Error on resize: ${error.message}`);
            }
        }

        // Animation loop
        function animate() {
            try {
                requestAnimationFrame(animate);

                // Very slight auto-rotation
                if (!isUserInteracting && !drawingMode) {
                    lon += 0.05;
                    updateCamera();
                }

                // Render the scene
                renderer.render(scene, camera);
            } catch (error) {
                logDebug(`Error in animation loop: ${error.message}`);
            }
        }

        // Initialize Fabric.js canvas for drawing
        function initDrawingCanvas() {
            logDebug("Initializing Fabric.js canvas");

            try {
                const canvasEl = document.getElementById('drawing-canvas');

                // Check if canvas element exists
                if (!canvasEl) {
                    logDebug("❌ Canvas element not found");
                    return;
                }

                // Create Fabric.js canvas
                canvas = new fabric.Canvas('drawing-canvas', {
                    selection: false,
                    width: panoramaContainer.clientWidth,
                    height: panoramaContainer.clientHeight
                });

                logDebug(`Fabric canvas created: ${canvas.width}x${canvas.height}`);
                console.log("Fabric canvas:", canvas);

                // Test drawing - draw a simple line to verify canvas is working
                const testLine = new fabric.Line([50, 50, 200, 200], {
                    stroke: 'red',
                    strokeWidth: 5
                });

                canvas.add(testLine);
                canvas.renderAll();
                logDebug("Added test line to verify canvas");

            } catch (error) {
                logDebug(`❌ Error initializing Fabric.js: ${error.message}`);
                console.error("Fabric init error:", error);
            }
        }

        // Toggle drawing mode
        function toggleDrawingMode(enable) {
            try {
                drawingMode = enable;

                if (enable) {
                    drawLineBtn.textContent = 'Cancel Drawing';
                    drawLineBtn.classList.replace('btn-primary', 'btn-warning');
                    panoramaContainer.classList.add('drawing-active');
                    logDebug("Drawing mode ENABLED");
                } else {
                    drawLineBtn.textContent = 'Draw Line';
                    drawLineBtn.classList.replace('btn-warning', 'btn-primary');
                    panoramaContainer.classList.remove('drawing-active');

                    // Reset drawing state
                    startPoint = null;
                    if (activeLine) {
                        canvas.remove(activeLine);
                        activeLine = null;
                    }
                    logDebug("Drawing mode DISABLED");
                }
            } catch (error) {
                logDebug(`Error toggling drawing mode: ${error.message}`);
            }
        }

        // Clear all drawings
        function clearAllDrawings() {
            try {
                canvas.clear();
                logDebug("Canvas cleared");

                // Draw a test line to check if canvas is working
                const testLine = new fabric.Line([50, 50, 200, 200], {
                    stroke: 'green',
                    strokeWidth: 5
                });

                canvas.add(testLine);
                canvas.renderAll();
                logDebug("Test line added after clear");
            } catch (error) {
                logDebug(`Error clearing drawings: ${error.message}`);
            }
        }

        // Event listeners
        document.addEventListener('DOMContentLoaded', function() {
            logDebug("DOMContentLoaded event fired");

            try {
                // Initialize Three.js viewer
                initPanoramaViewer();

                // Handle image upload
                imageInput.addEventListener('change', function(e) {
                    const file = e.target.files[0];
                    if (!file) {
                        logDebug("No file selected");
                        return;
                    }

                    logDebug(`File selected: ${file.name} (${file.type}, ${Math.round(file.size/1024)} KB)`);

                    const reader = new FileReader();

                    reader.onload = function(e) {
                        logDebug("File read complete");

                        // Show image preview
                        const imgEl = document.createElement('img');
                        imgEl.src = e.target.result;
                        imgEl.classList.add('img-preview', 'selected');

                        // Add click handler
                        imgEl.addEventListener('click', function() {
                            logDebug(`Selected image: ${file.name}`);
                            document.querySelectorAll('.img-preview').forEach(el => {
                                el.classList.remove('selected');
                            });
                            imgEl.classList.add('selected');
                            loadPanorama(e.target.result);
                        });

                        // Update UI
                        imageList.innerHTML = '';
                        imageList.appendChild(imgEl);

                        // Load panorama
                        loadPanorama(e.target.result);
                    };

                    reader.onerror = function(e) {
                        logDebug(`❌ Error reading file: ${e.target.error}`);
                    };

                    reader.readAsDataURL(file);
                });

                // Toggle drawing mode
                drawLineBtn.addEventListener('click', function() {
                    toggleDrawingMode(!drawingMode);
                });

                // Clear drawings
                clearBtn.addEventListener('click', function() {
                    clearAllDrawings();
                });

                // Change line color
                colorPicker.addEventListener('change', function(e) {
                    lineColor = e.target.value;
                    logDebug(`Line color changed: ${lineColor}`);

                    if (activeLine) {
                        activeLine.set({ stroke: lineColor });
                        canvas.renderAll();
                    }
                });

                // Change line width
                lineWidthInput.addEventListener('input', function(e) {
                    lineWidth = parseInt(e.target.value);
                    logDebug(`Line width changed: ${lineWidth}`);

                    if (activeLine) {
                        activeLine.set({ strokeWidth: lineWidth });
                        canvas.renderAll();
                    }
                });

                logDebug("All event listeners attached");
            } catch (error) {
                logDebug(`❌ Error in initialization: ${error.message}`);
                console.error("Initialization error:", error);
            }
        });
    </script>
</body>

</html>