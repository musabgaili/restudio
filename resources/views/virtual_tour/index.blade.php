<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Tours list</title>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.0/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="{{ asset('360maker/styles.css') }}">

</head>
<body>
    <div class="app-container">
        <header class="app-header">
            <div class="container-fluid">
                <div class="header-content">
                    <h1><i class="fas fa-cube me-2"></i>360 Virtual Tours</h1>
                    <div class="action-buttons">
                        <a href="{{ url('/virtual-tours/create') }}" class="btn btn-primary">
                            <i class="fas fa-plus me-1"></i> Create New Tour
                        </a>
                    </div>
                </div>
            </div>
        </header>

        <div class="container mt-4">
            <div class="row">
                @foreach ($tours as $tour)
                    <div class="col-md-4 mb-4">
                        <div class="card h-100 shadow-sm">
                            <div class="card-body">
                                <h5 class="card-title">{{ $tour->name }}</h5>
                                <p class="card-text text-muted">
                                    {{ $tour->description ?? 'No description available' }}
                                </p>
                            </div>
                            <div class="card-footer bg-transparent border-top-0">
                                <a href="{{ route('virtual_tour_view', ['id' => $tour->id]) }}" class="btn btn-outline-primary w-100">
                                    <i class="fas fa-eye me-1"></i> View Tour
                                </a>
                            </div>
                        </div>
                    </div>
                @endforeach

                @if(count($tours) == 0)
                    <div class="col-12 text-center py-5">
                        <div class="empty-state">
                            <i class="fas fa-cube fa-3x mb-3 text-muted"></i>
                            <h3>No tours available</h3>
                            <p class="text-muted">Create your first virtual tour to get started</p>
                            <a href="{{ url('/virtual-tours/create') }}" class="btn btn-primary mt-3">
                                <i class="fas fa-plus me-1"></i> Create New Tour
                            </a>
                        </div>
                    </div>
                @endif
            </div>
        </div>
    </div>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.0/js/bootstrap.bundle.min.js"></script>
</body>
</html>