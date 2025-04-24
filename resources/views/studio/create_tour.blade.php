<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Photo Sphere Creator</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.2.3/css/bootstrap.min.css">
    <link rel="stylesheet" href="{{ asset('360scripts/styles.css') }}">
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

<body>
    <div class="container-fluid">
        <div class="row my-3">
            <div class="col-12">
                <h1>Photo Sphere Viewer</h1>
            </div>
        </div>

        <div class="row">
            <!-- Sidebar with thumbnails and controls -->
            <div class="col-md-3" style="overflow-y: auto; max-height: 80vh;">
                <div class="card mb-3">
                    <div class="card-header">Upload Images</div>
                    <div class="card-body">
                        <input type="file" id="imageInput" multiple accept="image/*" class="form-control mb-2">
                        <button id="uploadBtn" class="btn btn-primary">Upload</button>
                    </div>
                </div>

                <div class="card mb-3">
                    <div class="card-header">Images</div>
                    <div class="card-body" id="imageList">
                        <!-- Thumbnails will be added here -->
                    </div>
                </div>

                <div id="linkControls" class="card mb-3" style="display: none;">
                    <div class="card-header">Link Controls</div>
                    <div class="card-body">
                        <button id="addLinkBtn" class="btn btn-success w-100 mb-2">Add Link</button>

                        <div id="linkDropdown" class="mb-3" style="display: none;">
                            <select id="targetSelect" class="form-select mb-2">
                                <!-- Options will be added here -->
                            </select>
                            <button id="confirmLinkBtn" class="btn btn-sm btn-primary">Confirm & Click on Image</button>
                        </div>
                    </div>
                </div>

                <div id="saveAll" class="card mb-3" style="">
                    <div class="card-header">Save All</div>
                    <div class="card-body">
                        <button id="saveAllBtn" class="btn btn-success w-100 mb-2">Save Tours</button>
                    </div>
                </div>
            </div>

            <!-- Main viewer area -->
            <div class="col-md-9">
                <div id="viewer" class="viewer-container"></div>
            </div>
        </div>
    </div>

    <!-- Import scripts using ES modules -->
    <script>
        window.markerImageUrl = "{{ asset('360images/marker.png') }}";
    </script>
    <script type="module" src="{{ asset('360scripts/app.js') }}"></script>
</body>

</html>
