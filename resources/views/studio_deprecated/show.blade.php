<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>{{ $tour->name }} - 360 Tour Studio</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.2.3/css/bootstrap.min.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
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
    <style>
        .viewer-wrapper {
            height: calc(100vh - 130px);
        }

        .tour-info {
            background-color: rgba(0, 0, 0, 0.7);
            color: white;
            padding: 10px 15px;
            border-radius: 8px;
            position: absolute;
            bottom: 20px;
            left: 20px;
            max-width: 300px;
            z-index: 1000;
            pointer-events: none;
        }

        .node-list {
            max-height: calc(100vh - 250px);
            overflow-y: auto;
        }

        .node-card {
            transition: all 0.2s ease;
            cursor: pointer;
            border-left: 3px solid transparent;
        }

        .node-card:hover {
            transform: translateX(3px);
        }

        .node-card.active {
            border-left-color: #0d6efd;
            background-color: rgba(13, 110, 253, 0.1);
        }
    </style>
</head>

<body class="modern-ui">
    <div class="app-container">
        <header class="app-header">
            <div class="container-fluid">
                <div class="header-content">
                    <h1>
                        <i class="fas fa-cube me-2"></i>{{ $tour->name }}
                    </h1>
                    <div class="action-buttons">
                        <a href="{{ route('studio.index') }}" class="btn btn-outline-light me-2">
                            <i class="fas fa-arrow-left me-1"></i> Back to Tours
                        </a>
                        <button id="toggleSidebarBtn" class="btn btn-outline-light" title="Toggle Sidebar">
                            <i class="fas fa-bars"></i>
                        </button>
                    </div>
                </div>
            </div>
        </header>

        <div class="main-content">
            <!-- Sidebar with nodes list -->
            <div class="sidebar" id="sidebar">
                <div class="p-3">
                    <h5>Tour Information</h5>
                    <p class="text-muted">{{ $tour->description }}</p>
                    <hr>
                    <h5>Nodes</h5>
                    <div class="node-list mt-3">
                        @foreach($tour->nodes as $node)
                        <div class="card node-card mb-2" data-node-id="{{ $node->id }}" id="node-card-{{ $node->id }}">
                            <div class="card-body py-2 px-3">
                                <div class="d-flex align-items-center">
                                    @if($node->thumbnail_path)
                                    <img src="{{ Storage::url($node->thumbnail_path) }}" alt="{{ $node->name }}" class="me-3" style="width: 40px; height: 40px; object-fit: cover; border-radius: 4px;">
                                    @else
                                    <div class="me-3 d-flex align-items-center justify-content-center" style="width: 40px; height: 40px; background-color: #333; border-radius: 4px;">
                                        <i class="fas fa-image text-light"></i>
                                    </div>
                                    @endif
                                    <div>
                                        <h6 class="card-title mb-1">{{ $node->name }}</h6>
                                        <p class="card-text text-muted small mb-0">
                                            @if($node->start_node)
                                            <span class="badge bg-success me-1">Start</span>
                                            @endif
                                            <span class="badge bg-primary me-1">{{ $node->markers->count() }} Markers</span>
                                            <span class="badge bg-info me-1">{{ $node->polygons->count() }} Polygons</span>
                                            <span class="badge bg-warning">{{ $node->texts->count() }} Texts</span>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        @endforeach
                    </div>
                </div>
            </div>

            <!-- Main viewer area -->
            <div class="viewer-wrapper">
                <div id="viewer" class="viewer-container"></div>
                <div class="tour-info">
                    <h5 id="currentNodeName">Loading...</h5>
                    <p id="currentNodeDescription" class="mb-0 small"></p>
                </div>
            </div>
        </div>
    </div>

    <!-- Hidden data for JavaScript to use -->
    <div id="tourData" data-tour-id="{{ $tour->id }}" style="display: none;"></div>
    <div id="viewerMode" data-value="true" style="display: none;"></div>

    <!-- Bootstrap JS -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/js/bootstrap.bundle.min.js"></script>

    <!-- Import scripts using ES modules -->
    <script type="module" src="{{ asset('360maker/app.js') }}"></script>
    <script type="module">
        import { loadTour } from '{{ asset('360maker/app.js') }}';

        document.addEventListener('DOMContentLoaded', function() {
            // Toggle sidebar
            document.getElementById('toggleSidebarBtn').addEventListener('click', function() {
                document.getElementById('sidebar').classList.toggle('collapsed');
                document.querySelector('.viewer-wrapper').classList.toggle('expanded');
            });

            // Node selection
            document.querySelectorAll('.node-card').forEach(card => {
                card.addEventListener('click', function() {
                    const nodeId = this.dataset.nodeId;

                    // Find the current node in tour data
                    window.setCurrentNode && window.setCurrentNode(nodeId);

                    // Update the active node card
                    document.querySelectorAll('.node-card').forEach(c => c.classList.remove('active'));
                    this.classList.add('active');
                });
            });

            // Get the tour ID from the hidden element
            const tourId = document.getElementById('tourData').dataset.tourId;

            // Load the tour data when the page loads
            loadTour(tourId);
        });

        // Update node information when node changes
        window.updateNodeInfo = function(node) {
            document.getElementById('currentNodeName').textContent = node.name;
            document.getElementById('currentNodeDescription').textContent = node.caption || '';

            // Update active state in the sidebar
            document.querySelectorAll('.node-card').forEach(card => {
                card.classList.remove('active');
            });

            const activeCard = document.getElementById('node-card-' + node.id);
            if (activeCard) {
                activeCard.classList.add('active');

                // Scroll to the active card
                activeCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        };
    </script>
</body>

</html>
