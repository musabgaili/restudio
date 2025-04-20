<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>360 Virtual Tour with Sidebar</title>
    <!-- Bootstrap CSS -->
    <link href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.0/css/bootstrap.min.css" rel="stylesheet">
    <script type="importmap">
    {
      "imports": {
        "three": "https://cdn.jsdelivr.net/npm/three/build/three.module.js",
        "@photo-sphere-viewer/core": "https://cdn.jsdelivr.net/npm/@photo-sphere-viewer/core@5/index.module.js",
        "@photo-sphere-viewer/virtual-tour-plugin": "https://cdn.jsdelivr.net/npm/@photo-sphere-viewer/virtual-tour-plugin@5/index.module.js",
        "@photo-sphere-viewer/gallery-plugin": "https://cdn.jsdelivr.net/npm/@photo-sphere-viewer/gallery-plugin@5/index.module.js",
        "@photo-sphere-viewer/markers-plugin": "https://cdn.jsdelivr.net/npm/@photo-sphere-viewer/markers-plugin@5/index.module.js"
      }
    }
  </script>
    <style>
        @import 'https://cdn.jsdelivr.net/npm/@photo-sphere-viewer/core@5/index.css';
        @import 'https://cdn.jsdelivr.net/npm/@photo-sphere-viewer/virtual-tour-plugin@5/index.css';
        @import 'https://cdn.jsdelivr.net/npm/@photo-sphere-viewer/gallery-plugin@5/index.css';
        @import 'https://cdn.jsdelivr.net/npm/@photo-sphere-viewer/markers-plugin@5/index.css';

        html,
        body {
            width: 100%;
            height: 100%;
            margin: 0;
            font-family: sans-serif;
        }

        .main-container {
            display: flex;
            height: calc(100% - 56px);
            /* Subtract navbar height */
        }

        #sidebar {
            width: 120px;
            background: #f0f0f0;
            overflow-y: auto;
            padding: 10px;
            box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
        }

        #sidebar img {
            width: 100px;
            margin-bottom: 10px;
            cursor: pointer;
            border: 2px solid transparent;
        }

        #sidebar img:hover {
            border-color: #007bff;
        }

        #viewer {
            flex: 1;
            height: 100%;
        }
    </style>
</head>

<body>
    <!-- Bootstrap Navbar -->
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
        <div class="container-fluid">
            <a class="navbar-brand" href="#">360 Virtual Tour</a>
            <div class="d-flex">
                <button class="btn btn-outline-light me-2" type="button">Help</button>
                <button class="btn btn-primary" type="button">Contact</button>
            </div>
        </div>
    </nav>

    <div class="main-container">
        <div id="sidebar"></div>
        <div id="viewer"></div>
    </div>

    <!-- Bootstrap JS -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.0/js/bootstrap.bundle.min.js"></script>

    <script type="module">
        import {
            Viewer
        } from '@photo-sphere-viewer/core';
        import {
            VirtualTourPlugin
        } from '@photo-sphere-viewer/virtual-tour-plugin';
        import {
            GalleryPlugin
        } from '@photo-sphere-viewer/gallery-plugin';
        import {
            MarkersPlugin
        } from '@photo-sphere-viewer/markers-plugin';

        const caption = 'Project Name';

        const markerExample = {
            id: 'marker-1',
            image: 'pin.png', // place this in same folder
            tooltip: 'Example Marker',
            size: {
                width: 32,
                height: 32
            },
            anchor: 'bottom center',
            gps: [-80.155973, 25.666601, 32],
        };

        const nodes = [{
                id: '1',
                panorama: '{{ asset('360images/img1.jpg') }}',
                thumbnail: '{{ asset('360images/img1.jpg') }}',
                name: 'One',
                caption: `[1] ${caption}`,
                links: [{
                    nodeId: '2'
                }],
                markers: [markerExample],
                gps: [-80.156479, 25.666725, 3],
                sphereCorrection: {
                    pan: '33deg'
                },
            },
            {
                id: '2',
                panorama: '{{ asset('360images/img2.jpg') }}',
                thumbnail: '{{ asset('360images/img2.jpg') }}',
                name: 'Two',
                caption: `[2] ${caption}`,
                links: [{
                    nodeId: '3',
                    position: {
                        // textureX: 1500,
                        // textureY: 780
                        yaw: 1.1366795992713647,
                        pitch: 0.22164594951785554
                    }
                }, {
                    nodeId: '1',
                    position: {
                        // textureX: 1500,
                        // textureY: 780
                        yaw: 1.1366795992713647,
                        pitch: 0.22164594951785554
                    }
                }],
                markers: [markerExample],
                gps: [-80.156168, 25.666623, 3],
                sphereCorrection: {
                    pan: '42deg'
                },
            },
            {
                id: '3',
                panorama: '{{ asset('360images/img3.jpg') }}',
                thumbnail: '{{ asset('360images/img3.jpg') }}',
                name: 'Three',
                caption: `[3] ${caption}`,
                links: [{
                    nodeId: '1',
                    position: {
                        // textureX: 1500,
                        // textureY: 780
                        yaw: 1.1366795992713647,
                        pitch: 0.22164594951785554
                    }
                }],
                gps: [-80.155932, 25.666498, 5],

                sphereCorrection: {
                    pan: '50deg'
                },
            },
        ];

        const viewer = new Viewer({
            container: 'viewer',
            loadingImg: '{{ asset('360images/loader.gif') }}', // optional
            touchmoveTwoFingers: true,
            mousewheelCtrlKey: true,
            defaultYaw: '130deg',
            navbar: 'zoom move gallery caption fullscreen',

            plugins: [
                MarkersPlugin,
                [GalleryPlugin, {
                    thumbnailSize: {
                        width: 100,
                        height: 100
                    },
                }],
                [VirtualTourPlugin, {
                    positionMode: 'gps',
                    renderMode: '3d',
                    nodes: nodes,
                    startNodeId: '1',
                }],
            ],
        });

        const tour = viewer.getPlugin(VirtualTourPlugin);

        // Sidebar navigation
        const sidebar = document.getElementById('sidebar');
        nodes.forEach(node => {
            const img = document.createElement('img');
            img.src = node.thumbnail;
            img.alt = node.name;
            img.addEventListener('click', () => {
                tour.setCurrentNode(node.id);
            });
            sidebar.appendChild(img);
        });
    </script>
</body>

</html>
