<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Three.js Panorama Viewer with Drawing</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: Arial, sans-serif;
            display: flex;
            height: 100vh;
            overflow: hidden;
        }

        #sidebar {
            width: 250px;
            background-color: #f0f0f0;
            padding: 10px;
            overflow-y: auto;
            border-right: 1px solid #ccc;
            z-index: 20;
        }

        #viewer {
            flex: 1;
            position: relative;
        }

        #canvas {
            width: 100%;
            height: 100%;
            position: relative;
        }

        #drawing-canvas {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 10;
            pointer-events: none;
        }

        .drawing-active .upper-canvas {
            pointer-events: auto !important;
            cursor: crosshair !important;
        }

        .thumbnail {
            width: 100%;
            height: auto;
            margin-bottom: 10px;
            cursor: pointer;
            border: 2px solid transparent;
            border-radius: 4px;
        }

        .thumbnail.active {
            border-color: #0066ff;
        }

        .btn {
            width: 100%;
            padding: 8px;
            margin-bottom: 10px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-weight: bold;
        }

        .upload-btn {
            background-color: #4CAF50;
            color: white;
        }

        .upload-btn:hover {
            background-color: #45a049;
        }

        .draw-btn {
            background-color: #2196F3;
            color: white;
        }

        .draw-btn.active {
            background-color: #ff9800;
        }

        .clear-btn {
            background-color: #f44336;
            color: white;
        }

        .control-group {
            margin-bottom: 15px;
            border-bottom: 1px solid #ddd;
            padding-bottom: 15px;
        }

        .control-group h3 {
            margin-top: 0;
            margin-bottom: 10px;
            font-size: 16px;
        }

        .color-picker {
            width: 100%;
            height: 40px;
            margin-bottom: 10px;
        }

        label {
            display: block;
            margin-bottom: 5px;
            font-weight: bold;
        }

        #debug-info {
            position: absolute;
            bottom: 10px;
            left: 10px;
            color: white;
            background: rgba(0,0,0,0.7);
            padding: 5px 10px;
            font-size: 12px;
            z-index: 30;
            border-radius: 4px;
            max-width: 300px;
            max-height: 80px;
            overflow-y: auto;
            pointer-events: none;
        }
    </style>
</head>
<body>
    <div id="sidebar">
        <div class="control-group">
            <h3>Images</h3>
            <input type="file" id="fileInput" accept="image/*" multiple style="display: none;">
            <button class="btn upload-btn" id="uploadBtn">Upload Images</button>
            <div id="thumbnails"></div>
        </div>

        <div class="control-group">
            <h3>Drawing Tools</h3>
            <button class="btn draw-btn" id="drawBtn">Draw Line</button>
            <button class="btn clear-btn" id="clearBtn">Clear Drawing</button>

            <div style="margin-top: 15px;">
                <label for="colorPicker">Line Color:</label>
                <input type="color" id="colorPicker" class="color-picker" value="#ffffff">

                <label for="lineWidth">Line Width:</label>
                <input type="range" id="lineWidth" min="1" max="20" value="5" style="width: 100%;">
                <span id="widthValue">5px</span>
            </div>
        </div>
    </div>

    <div id="viewer">
        <div id="canvas"></div>
        <canvas id="drawing-canvas"></canvas>
        <div id="debug-info"></div>
    </div>

    <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/fabric.js/5.3.0/fabric.min.js"></script>
    <script>
        // Initialize variables
        let camera, scene, renderer;
        let isUserInteracting = false;
        let onPointerDownMouseX = 0, onPointerDownMouseY = 0;
        let lon = 0, onPointerDownLon = 0;
        let lat = 0, onPointerDownLat = 0;
        let phi = 0, theta = 0;
        let panoramaMesh;
        let uploadedImages = [];

        // Drawing variables
        let canvas;
        let drawingMode = false;
        let startPoint = null;
        let activeLine = null;
        let lineColor = '#ffffff';
        let lineWidth = 5;

        // DOM elements
        const fileInput = document.getElementById('fileInput');
        const uploadBtn = document.getElementById('uploadBtn');
        const thumbnailsContainer = document.getElementById('thumbnails');
        const drawBtn = document.getElementById('drawBtn');
        const clearBtn = document.getElementById('clearBtn');
        const colorPicker = document.getElementById('colorPicker');
        const lineWidthInput = document.getElementById('lineWidth');
        const widthValue = document.getElementById('widthValue');
        const viewerElement = document.getElementById('viewer');
        const debugInfo = document.getElementById('debug-info');

        // Initialize Three.js scene
        init();

        // Initialize Fabric.js canvas
        initDrawingCanvas();

        // Start animation
        animate();

        // Event listeners
        uploadBtn.addEventListener('click', () => fileInput.click());
        fileInput.addEventListener('change', handleFileSelect);
        drawBtn.addEventListener('click', toggleDrawingMode);
        clearBtn.addEventListener('click', clearDrawing);
        colorPicker.addEventListener('change', updateColor);
        lineWidthInput.addEventListener('input', updateLineWidth);

        function log(message) {
            console.log(message);
            debugInfo.textContent = message;
            // Clear after 3 seconds
            setTimeout(() => {
                if (debugInfo.textContent === message) {
                    debugInfo.textContent = '';
                }
            }, 3000);
        }

        function init() {
            try {
                // Create camera
                camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1100);
                camera.position.z = 0.1;

                // Create scene
                scene = new THREE.Scene();

                // Create renderer
                renderer = new THREE.WebGLRenderer();
                renderer.setPixelRatio(window.devicePixelRatio);
                renderer.setSize(window.innerWidth - 250, window.innerHeight);
                document.getElementById('canvas').appendChild(renderer.domElement);

                // Event listeners for pan control
                document.getElementById('canvas').addEventListener('mousedown', onPointerDown);
                document.getElementById('canvas').addEventListener('mousemove', onPointerMove);
                document.getElementById('canvas').addEventListener('mouseup', onPointerUp);
                document.getElementById('canvas').addEventListener('wheel', onDocumentWheel);

                // Handle window resize
                window.addEventListener('resize', onWindowResize);

                log("Three.js initialized");
            } catch (error) {
                log("Error initializing Three.js: " + error.message);
                console.error(error);
            }
        }

        function initDrawingCanvas() {
            try {
                // Create Fabric.js canvas
                canvas = new fabric.Canvas('drawing-canvas', {
                    selection: false,
                    width: window.innerWidth - 250,
                    height: window.innerHeight
                });

                // Test drawing to verify canvas works
                const testLine = new fabric.Line([50, 50, 100, 100], {
                    stroke: 'red',
                    strokeWidth: 3,
                    selectable: false
                });

                canvas.add(testLine);
                canvas.renderAll();

                // Remove test line after 1 second
                setTimeout(() => {
                    canvas.remove(testLine);
                    canvas.renderAll();
                }, 1000);

                log("Drawing canvas initialized");
            } catch (error) {
                log("Error initializing Fabric.js: " + error.message);
                console.error(error);
            }
        }

        function handleFileSelect(event) {
            const files = event.target.files;

            if (files.length === 0) return;

            uploadedImages = [];
            thumbnailsContainer.innerHTML = '';

            // Process each file
            Array.from(files).forEach((file, index) => {
                if (!file.type.match('image.*')) return;

                const reader = new FileReader();

                // Load the image and create thumbnail
                reader.onload = function(e) {
                    const imageUrl = e.target.result;
                    uploadedImages.push(imageUrl);

                    // Create thumbnail
                    const thumbnail = document.createElement('img');
                    thumbnail.src = imageUrl;
                    thumbnail.className = 'thumbnail';
                    thumbnail.dataset.index = index;
                    thumbnail.addEventListener('click', () => loadPanorama(index));
                    thumbnailsContainer.appendChild(thumbnail);

                    // Load the first image automatically
                    if (index === 0) {
                        loadPanorama(0);
                    }
                };

                reader.readAsDataURL(file);
            });
        }

        function loadPanorama(index) {
            try {
                // Mark thumbnail as active
                document.querySelectorAll('.thumbnail').forEach(thumb => thumb.classList.remove('active'));
                document.querySelector(`.thumbnail[data-index="${index}"]`).classList.add('active');

                const imageUrl = uploadedImages[index];

                // Remove existing panorama mesh if any
                if (panoramaMesh) {
                    scene.remove(panoramaMesh);
                }

                // Create new texture and mesh
                const texture = new THREE.TextureLoader().load(imageUrl);
                texture.mapping = THREE.EquirectangularReflectionMapping;

                const geometry = new THREE.SphereGeometry(500, 60, 40);
                // Flip the geometry inside out
                geometry.scale(-1, 1, 1);

                const material = new THREE.MeshBasicMaterial({
                    map: texture
                });

                panoramaMesh = new THREE.Mesh(geometry, material);
                scene.add(panoramaMesh);

                log("Panorama loaded successfully");
            } catch (error) {
                log("Error loading panorama: " + error.message);
                console.error(error);
            }
        }

        function toggleDrawingMode() {
            drawingMode = !drawingMode;

            if (drawingMode) {
                drawBtn.classList.add('active');
                drawBtn.textContent = 'Cancel Drawing';
                viewerElement.classList.add('drawing-active');
                log("Drawing mode activated");
            } else {
                drawBtn.classList.remove('active');
                drawBtn.textContent = 'Draw Line';
                viewerElement.classList.remove('drawing-active');

                // Reset drawing state
                startPoint = null;
                if (activeLine) {
                    canvas.remove(activeLine);
                    activeLine = null;
                }
                log("Drawing mode deactivated");
            }
        }

        function clearDrawing() {
            canvas.clear();
            log("Drawing cleared");
        }

        function updateColor(e) {
            lineColor = e.target.value;

            if (activeLine) {
                activeLine.set({ stroke: lineColor });
                canvas.renderAll();
            }
        }

        function updateLineWidth(e) {
            lineWidth = parseInt(e.target.value);
            widthValue.textContent = lineWidth + 'px';

            if (activeLine) {
                activeLine.set({ strokeWidth: lineWidth });
                canvas.renderAll();
            }
        }

        function onWindowResize() {
            camera.aspect = (window.innerWidth - 250) / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth - 250, window.innerHeight);

            // Resize drawing canvas
            canvas.setWidth(window.innerWidth - 250);
            canvas.setHeight(window.innerHeight);
            canvas.renderAll();
        }

        function onPointerDown(event) {
            // Handle drawing if in drawing mode
            if (drawingMode) {
                handleDrawingMouseDown(event);
                return;
            }

            // Handle panorama navigation
            isUserInteracting = true;

            onPointerDownMouseX = event.clientX;
            onPointerDownMouseY = event.clientY;

            onPointerDownLon = lon;
            onPointerDownLat = lat;
        }

        function handleDrawingMouseDown(event) {
            try {
                // Calculate position relative to canvas
                const rect = canvas.getElement().getBoundingClientRect();
                const x = event.clientX - rect.left;
                const y = event.clientY - rect.top;

                if (!startPoint) {
                    // First click - start a line
                    startPoint = new fabric.Point(x, y);

                    // Create a line
                    activeLine = new fabric.Line([x, y, x, y], {
                        stroke: lineColor,
                        strokeWidth: lineWidth,
                        selectable: false
                    });

                    canvas.add(activeLine);
                    canvas.renderAll();
                } else {
                    // Second click - complete the line
                    activeLine.set({
                        x2: x,
                        y2: y
                    });

                    canvas.renderAll();

                    // Reset for next line
                    startPoint = null;
                    activeLine = null;
                }
            } catch (error) {
                log("Error in drawing: " + error.message);
                console.error(error);
            }
        }

        function onPointerMove(event) {
            if (drawingMode && startPoint && activeLine) {
                // Update line end point
                const rect = canvas.getElement().getBoundingClientRect();
                const x = event.clientX - rect.left;
                const y = event.clientY - rect.top;

                activeLine.set({
                    x2: x,
                    y2: y
                });

                canvas.renderAll();
                return;
            }

            if (isUserInteracting) {
                lon = (onPointerDownMouseX - event.clientX) * 0.1 + onPointerDownLon;
                lat = (event.clientY - onPointerDownMouseY) * 0.1 + onPointerDownLat;
            }
        }

        function onPointerUp() {
            isUserInteracting = false;
        }

        function onDocumentWheel(event) {
            const fov = camera.fov + event.deltaY * 0.05;
            camera.fov = THREE.MathUtils.clamp(fov, 10, 75);
            camera.updateProjectionMatrix();
        }

        function animate() {
            requestAnimationFrame(animate);
            update();
        }

        function update() {
            if (!isUserInteracting && !drawingMode) {
                lon += 0.05;
            }

            lat = Math.max(-85, Math.min(85, lat));
            phi = THREE.MathUtils.degToRad(90 - lat);
            theta = THREE.MathUtils.degToRad(lon);

            camera.position.x = 100 * Math.sin(phi) * Math.cos(theta);
            camera.position.y = 100 * Math.cos(phi);
            camera.position.z = 100 * Math.sin(phi) * Math.sin(theta);

            camera.lookAt(0, 0, 0);

            renderer.render(scene, camera);
        }
    </script>
</body>
</html>