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
    <link rel="stylesheet" href="{{ asset('360studio/viewTour/styles.css') }}">
</head>

<body>
    <!-- Bootstrap Navbar -->
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
        <div class="container-fluid">
            <a class="navbar-brand" href="#">360 Virtual Tou r</a>
            <div class="d-flex">
                <a href="{{ route('studio.draw', $tour->id) }}" class="btn btn-outline-light me-2" type="button">Draw</a>
                <a href="{{ route('studio.edit', $tour->id) }}" class="btn btn-primary" type="button">Edit</a>
            </div>
        </div>
    </nav>

    <div class="main-container">
        <div id="sidebar" class="d-flex flex-column align-items-center">
            <h5 id="tour-name" class="text-center fw-bold my-3"></h5>
            <div id="node-list" class="w-100 d-flex flex-column gap-3 px-2"></div>
        </div>
        <div id="viewer" data-tour-id="{{ $tour->id }}"></div>
    </div>

    <!-- Bootstrap JS -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.0/js/bootstrap.bundle.min.js"></script>

    <script>
        window.loaderImageUrl = "{{ asset('360images/loader.gif') }}";
        window.markerImageUrl = "{{ asset('360images/marker.png') }}";
    </script>
    <script type="module" src="{{ asset('360studio/viewTour/app.js') }}"></script>
</body>

</html>
