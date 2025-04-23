<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>360 Tour Studio - Tours</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.2.3/css/bootstrap.min.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="{{ asset('360maker/styles.css') }}">
    <style>
        .tour-card {
            transition: all 0.3s ease;
            height: 100%;
        }

        .tour-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
        }

        .tour-thumbnail {
            height: 200px;
            background-color: #000;
            background-size: cover;
            background-position: center;
            border-radius: 8px 8px 0 0;
        }

        .tour-placeholder {
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100%;
            color: #fff;
            background-color: #333;
            font-size: 3rem;
        }
    </style>
</head>

<body class="modern-ui">
    <div class="app-container">
        <header class="app-header">
            <div class="container-fluid">
                <div class="header-content">
                    <h1><i class="fas fa-cube me-2"></i>360 Tour Studio</h1>
                    <div class="action-buttons">
                        <a href="{{ route('studio.create') }}" class="btn btn-primary">
                            <i class="fas fa-plus me-1"></i> Create New Tour
                        </a>
                    </div>
                </div>
            </div>
        </header>

        <div class="container-fluid py-4">
            <div class="row mb-4">
                <div class="col-12">
                    <div class="card bg-light border-0 shadow-sm">
                        <div class="card-body">
                            <h2 class="card-title">Your Virtual Tours</h2>
                            <p class="card-text">Here you can view, edit, and manage all your virtual tours.</p>
                        </div>
                    </div>
                </div>
            </div>

            <div class="row g-4">
                @forelse($tours as $tour)
                <div class="col-12 col-md-6 col-lg-4 col-xl-3">
                    <div class="card tour-card shadow-sm">
                        <div class="tour-thumbnail">
                            @if($tour->nodes->isNotEmpty() && $tour->nodes->first()->thumbnail_path)
                                <div class="tour-thumbnail" style="background-image: url('{{ Storage::url($tour->nodes->first()->thumbnail_path) }}')"></div>
                            @else
                                <div class="tour-placeholder">
                                    <i class="fas fa-cube"></i>
                                </div>
                            @endif
                        </div>
                        <div class="card-body">
                            <h5 class="card-title">{{ $tour->name }}</h5>
                            <p class="card-text text-muted">
                                <small>{{ $tour->nodes->count() }} nodes • {{ $tour->created_at->diffForHumans() }}</small>
                            </p>
                            <p class="card-text">{{ Str::limit($tour->description, 100) }}</p>
                        </div>
                        <div class="card-footer bg-transparent border-top-0 d-flex justify-content-between">
                            <a href="{{ route('studio.show', $tour->id) }}" class="btn btn-outline-primary btn-sm">
                                <i class="fas fa-eye me-1"></i> View
                            </a>
                            <div>
                                <a href="#" class="btn btn-outline-secondary btn-sm"
                                   onclick="event.preventDefault(); document.getElementById('delete-form-{{ $tour->id }}').submit();">
                                    <i class="fas fa-trash-alt"></i>
                                </a>
                                <form id="delete-form-{{ $tour->id }}" action="{{ route('studio.destroy', $tour->id) }}" method="POST" style="display: none;">
                                    @csrf
                                    @method('DELETE')
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
                @empty
                <div class="col-12">
                    <div class="alert alert-info text-center py-5">
                        <i class="fas fa-info-circle fa-3x mb-3"></i>
                        <h4>No Tours Yet</h4>
                        <p>You haven't created any virtual tours yet. Click the button above to create your first tour!</p>
                        <a href="{{ route('studio.create') }}" class="btn btn-primary mt-3">
                            <i class="fas fa-plus me-1"></i> Create New Tour
                        </a>
                    </div>
                </div>
                @endforelse
            </div>
        </div>
    </div>

    <!-- Bootstrap JS -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/js/bootstrap.bundle.min.js"></script>
</body>

</html>
