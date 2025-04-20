<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8" />
    <title>360 Image Link Test</title>
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

    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">

    <style>
        @import 'https://cdn.jsdelivr.net/npm/@photo-sphere-viewer/core@5/index.css';
        @import 'https://cdn.jsdelivr.net/npm/@photo-sphere-viewer/virtual-tour-plugin@5/index.css';
        @import 'https://cdn.jsdelivr.net/npm/@photo-sphere-viewer/markers-plugin@5/index.css';

        html,
        body {
            height: 100%;
            margin: 0;
            overflow: hidden;
            font-family: sans-serif;
        }

        #sidebar {
            width: 300px;
            background: #f8f9fa;
            padding: 15px;
            overflow-y: auto;
            border-right: 1px solid #ddd;
        }

        #viewer {
            flex: 1;
            height: 100%;
        }

        .thumb {
            width: 100%;
            aspect-ratio: 1/1;
            object-fit: cover;
            border: 2px solid transparent;
            cursor: pointer;
        }

        .thumb.selected {
            border-color: #0d6efd;
        }

        .thumb-label {
            font-size: 12px;
            text-align: center;
            margin-top: 5px;
        }
    </style>
</head>

<body class="d-flex">
    <div id="sidebar" class="d-flex flex-column">
        <h5>Upload 360 Images</h5>
        <input type="file" id="imageInput" class="form-control mb-2" multiple accept="image/*" />
        <button id="uploadBtn" class="btn btn-primary mb-3">Upload</button>
        <div id="imageList" class="mb-3"></div>

        <div id="linkControls" style="display:none;">
            <button id="addLinkBtn" class="btn btn-success mb-2">Link to another image</button>
            <div id="linkDropdown" style="display:none;" class="input-group mb-2">
                <select id="targetSelect" class="form-select"></select>
                <button id="confirmLinkBtn" class="btn btn-outline-primary">Select area</button>
            </div>
        </div>
    </div>

    <div id="viewer"></div>

    <script type="module">
        import {
            Viewer
        } from '@photo-sphere-viewer/core';
        import {
            VirtualTourPlugin
        } from '@photo-sphere-viewer/virtual-tour-plugin';
        import {
            MarkersPlugin
        } from '@photo-sphere-viewer/markers-plugin';

        let images = [];
        let nodes = [];
        let viewer, tour, markersPlugin;
        let currentNodeId = null;
        let pendingLinkTarget = null;

        const viewerEl = document.getElementById('viewer');
        const imageInput = document.getElementById('imageInput');
        const uploadBtn = document.getElementById('uploadBtn');
        const imageList = document.getElementById('imageList');
        const linkControls = document.getElementById('linkControls');
        const addLinkBtn = document.getElementById('addLinkBtn');
        const linkDropdown = document.getElementById('linkDropdown');
        const targetSelect = document.getElementById('targetSelect');
        const confirmLinkBtn = document.getElementById('confirmLinkBtn');

        uploadBtn.onclick = () => {
            const files = Array.from(imageInput.files);
            if (!files.length) return;

            images = files.map((file, i) => ({
                id: (i + 1).toString(),
                file,
                url: URL.createObjectURL(file),
                name: file.name,
            }));

            renderThumbnails();
            setupViewer(); // recreate with new images
        };

        function renderThumbnails() {
            imageList.innerHTML = '';
            images.forEach((img) => {
                const div = document.createElement('div');
                div.classList.add('mb-2');

                const thumb = document.createElement('img');
                thumb.src = img.url;
                thumb.classList.add('thumb', 'img-thumbnail');
                thumb.onclick = () => selectImage(img.id);
                thumb.id = `thumb-${img.id}`;

                const label = document.createElement('div');
                label.classList.add('thumb-label');
                label.textContent = img.name;

                div.appendChild(thumb);
                div.appendChild(label);
                imageList.appendChild(div);
            });

            updateDropdown();
        }

        function updateDropdown() {
            targetSelect.innerHTML = '';
            images.forEach(img => {
                const opt = document.createElement('option');
                opt.value = img.id;
                opt.textContent = img.name;
                targetSelect.appendChild(opt);
            });
        }

        // ==== FIX: Clean setupViewer and prevent getCurrentNode() null ====
        function setupViewer() {
            if (viewer) {
                viewer.destroy();
                viewer = null;
            }

            // Clear and recreate nodes
            nodes = images.map((img, index) => ({
                id: img.id,
                panorama: img.url,
                name: img.name,
                // links: [], // clean
                // links: index < images.length - 1
                //     ? [{ nodeId: images[index + 1].id }]
                //     : [],
                links: index < images.length - 1 ? [{
                    nodeId: images[index + 1].id,
                    position: {
                        yaw: 0,
                        pitch: 0
                    } // placeholder center of image
                }] : [],

                markers: [],
            }));

            viewer = new Viewer({
                container: viewerEl,
                plugins: [
                    MarkersPlugin,
                    [VirtualTourPlugin, {
                        nodes: nodes,
                        startNodeId: images[0]?.id, // safe
                    }],
                ],
            });

            markersPlugin = viewer.getPlugin(MarkersPlugin);
            tour = viewer.getPlugin(VirtualTourPlugin);

            viewer.addEventListener('ready', () => {
                currentNodeId = tour.getCurrentNode()?.id;
                linkControls.style.display = 'block';
                setupClickToPlaceMarker();
                selectImage(currentNodeId); // highlight
            });

            tour.addEventListener('node-changed', (e) => {
                currentNodeId = e.node.id;
                document.querySelectorAll('.thumb').forEach(el => el.classList.remove('selected'));
                const selectedThumb = document.getElementById(`thumb-${currentNodeId}`);
                if (selectedThumb) selectedThumb.classList.add('selected');
            });
        }
        // ==== END FIX ====

        function selectImage(id) {
            if (tour) tour.setCurrentNode(id);
        }

        // ==== FIX: click to place link icon ====
        function setupClickToPlaceMarker() {
            viewer.container.addEventListener('click', (event) => {
                if (!pendingLinkTarget) return;

                // 🧠 Convert mouse click to spherical position
                // const position = viewer.getPositionFromMouseEvent(event);
                // const position = tour.getPositionFromMouseEvent(event);
                // const position = viewer.dataHelper.viewerCoordsToSphericalCoords({
                //     x: event.clientX,
                //     y: event.clientY,
                // });
                const rect = viewer.container.getBoundingClientRect();
                // const size = viewer.getViewerSize();
                const size = viewer.getSize();  // Changed from getViewerSize() to getSize()


                const x = (event.clientX - rect.left) * size.width / rect.width;
                const y = (event.clientY - rect.top) * size.height / rect.height;

                const position = viewer.dataHelper.viewerCoordsToSphericalCoords({
                    x,
                    y
                });

                if (!position) {
                    console.warn('⚠️ No position found from mouse event!');
                    return;
                }

                const markerId = 'marker-' + Date.now();

                console.log('🟢 Clicked position:', position);

                markersPlugin.addMarker({
                    id: markerId,
                    position,
                    // image: '{{ asset('360images/marker.png') }}',
                    image: window.markerImageUrl,
                    size: {
                        width: 32,
                        height: 32
                    },
                    anchor: 'bottom center',
                    tooltip: 'Go to image',
                    data: {
                        targetNodeId: pendingLinkTarget
                    },
                });

                const node = nodes.find(node => node.id === currentNodeId);
                node.links.push({
                    nodeId: pendingLinkTarget,
                    position
                });

                pendingLinkTarget = null;
                linkDropdown.style.display = 'none';
            });
        }


        // ==== END FIX ====

        addLinkBtn.onclick = () => {
            linkDropdown.style.display = 'flex';
        };

        confirmLinkBtn.onclick = () => {
            pendingLinkTarget = targetSelect.value;
        };
    </script>
</body>

</html>
