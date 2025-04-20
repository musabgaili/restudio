@extends('layouts.sales')

@section('content')

{{-- {{$properties}} --}}
<!-- Main Content -->
<div class="col-lg-10 col-md-9 col-sm-8 py-4 px-4">
    <div class="d-flex justify-content-between align-items-center mb-4">
        <h2>Property Listings</h2>
        <button class="btn btn-primary">
            <i class="fas fa-plus me-2"></i> Add Property
        </button>
    </div>

    <div class="table-container mb-4">
        <table class="table table-hover properties-table">
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Location</th>
                    <th>Type</th>
                    <th>Price</th>
                    <th>Status</th>
                    <th>Last Updated</th>
                </tr>
            </thead>
            <tbody>
                @foreach ($properties as $property)
                <tr data-id="{{ $property->id }}">
                    <td>{{ $property->name }}</td>
                    <td>{{ $property->type }}</td>
                    <td>{{ $property->price }}</td>
                    <td><span class="badge bg-success">{{ $property->status }}</span></td>
                    <td>{{ $property->created_at->format('Y-m-d') }}</td>
                </tr>
                @endforeach
            </tbody>
        </table>
    </div>
</div>
</div>
</div>

<!-- Detail Panel -->
<div class="panel-overlay"></div>
<div class="detail-panel">
    <div class="panel-header">
        <div class="d-flex justify-content-between align-items-center">
            <h3 id="panel-title">Property Details</h3>
            <button type="button" class="btn-close" id="close-panel"></button>
        </div>
    </div>
    <div class="panel-body">
        <div id="property-details">
            <!-- Details will be populated here by JavaScript -->
        </div>
    </div>
</div>

<script src="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.0/js/bootstrap.bundle.min.js"></script>
<script>
    document.addEventListener('DOMContentLoaded', function() {
        const tableRows = document.querySelectorAll('.properties-table tbody tr');
        const detailPanel = document.querySelector('.detail-panel');
        const panelOverlay = document.querySelector('.panel-overlay');
        const closePanel = document.getElementById('close-panel');
        const panelTitle = document.getElementById('panel-title');
        const propertyDetails = document.getElementById('property-details');

        // Sample property details for demonstration
        const propertyData = {
            1: {
                name: "Lakefront Villa",
                description: "A stunning lakefront villa with panoramic views and luxurious amenities. This 5-bedroom, 4.5-bathroom property features an open floor plan, gourmet kitchen, and private dock.",
                address: "123 Lake Shore Drive, Miami, FL 33139",
                price: "$1,250,000",
                sqft: "4,200",
                yearBuilt: "2018",
                features: ["Swimming Pool", "Private Dock", "Smart Home System", "Home Theater",
                    "Wine Cellar"
                ],
                agent: {
                    name: "Jennifer Wilson",
                    phone: "(305) 555-1234",
                    email: "jennifer.wilson@example.com"
                }
            },
            2: {
                name: "Downtown Apartment",
                description: "Modern downtown apartment in the heart of New York City. This 2-bedroom luxury apartment offers stunning city views, high-end finishes, and exclusive building amenities.",
                address: "456 Park Avenue, New York, NY 10022",
                price: "$850,000",
                sqft: "1,150",
                yearBuilt: "2020",
                features: ["Concierge Service", "Fitness Center", "Rooftop Terrace",
                    "Floor-to-ceiling Windows", "Pet Friendly"
                ],
                agent: {
                    name: "Michael Chen",
                    phone: "(212) 555-5678",
                    email: "michael.chen@example.com"
                }
            },
            3: {
                name: "Commercial Building",
                description: "Prime commercial real estate opportunity in downtown Chicago. This 5-story building offers versatile office spaces with modern amenities and excellent location.",
                address: "789 Michigan Avenue, Chicago, IL 60611",
                price: "$3,500,000",
                sqft: "12,000",
                yearBuilt: "2015",
                features: ["Elevator Access", "Underground Parking", "Conference Rooms", "Security System",
                    "Kitchen Facilities"
                ],
                agent: {
                    name: "Robert Johnson",
                    phone: "(312) 555-9012",
                    email: "robert.johnson@example.com"
                }
            },
            4: {
                name: "Mountain Cabin",
                description: "Charming mountain retreat with breathtaking views. This 3-bedroom cabin combines rustic charm with modern comfort, perfect for year-round enjoyment.",
                address: "101 Pine Tree Road, Aspen, CO 81611",
                price: "$975,000",
                sqft: "2,300",
                yearBuilt: "2019",
                features: ["Fireplace", "Hot Tub", "Wraparound Deck", "Ski Storage", "Game Room"],
                agent: {
                    name: "Sarah Miller",
                    phone: "(970) 555-3456",
                    email: "sarah.miller@example.com"
                }
            },
            5: {
                name: "Beachfront Condo",
                description: "Luxurious beachfront condo with unobstructed ocean views. This 3-bedroom, 2-bathroom unit features high-end finishes and resort-style amenities.",
                address: "202 Oceanview Drive, San Diego, CA 92109",
                price: "$1,450,000",
                sqft: "1,800",
                yearBuilt: "2017",
                features: ["Private Balcony", "Pool & Spa", "Fitness Center", "Direct Beach Access",
                    "Gated Community"
                ],
                agent: {
                    name: "David Garcia",
                    phone: "(619) 555-7890",
                    email: "david.garcia@example.com"
                }
            },
            6: {
                name: "Office Space",
                description: "Modern office space in Seattle's thriving business district. This open-concept space offers flexibility for growing businesses with state-of-the-art facilities.",
                address: "303 Tech Boulevard, Seattle, WA 98101",
                price: "$2,100,000",
                sqft: "5,500",
                yearBuilt: "2021",
                features: ["Open Floor Plan", "Meeting Rooms", "Kitchenette", "Bike Storage",
                    "Rooftop Access"
                ],
                agent: {
                    name: "Lisa Thompson",
                    phone: "(206) 555-2345",
                    email: "lisa.thompson@example.com"
                }
            },
            7: {
                name: "Suburban House",
                description: "Comfortable family home in a quiet suburban neighborhood. This 4-bedroom, 3-bathroom house features a spacious backyard and updated interiors.",
                address: "404 Maple Street, Austin, TX 78701",
                price: "$650,000",
                sqft: "2,500",
                yearBuilt: "2010",
                features: ["Fenced Yard", "Updated Kitchen", "Home Office", "Two-car Garage", "Patio"],
                agent: {
                    name: "James Wilson",
                    phone: "(512) 555-6789",
                    email: "james.wilson@example.com"
                }
            }
        };

        // Function to open detail panel with property info
        function openPropertyDetails(propertyId) {
            const property = propertyData[propertyId];

            if (property) {
                panelTitle.textContent = property.name;

                // Build property details HTML
                let detailsHTML = `
                <div class="mb-4">
                    <img src="/api/placeholder/600/400" alt="${property.name}" class="img-fluid rounded mb-3" />
                    <h4 class="mb-3">$${property.price.replace('$', '')}</h4>
                    <p class="text-muted">${property.address}</p>
                    <div class="d-flex flex-wrap mb-3">
                        <div class="me-4">
                            <small class="text-muted">Square Feet</small>
                            <p class="mb-0"><strong>${property.sqft}</strong></p>
                        </div>
                        <div class="me-4">
                            <small class="text-muted">Year Built</small>
                            <p class="mb-0"><strong>${property.yearBuilt}</strong></p>
                        </div>
                    </div>
                    <hr>
                    <h5>Description</h5>
                    <p>${property.description}</p>
                    <hr>
                    <h5>Features</h5>
                    <ul class="list-group list-group-flush mb-4">
                        ${property.features.map(feature => `<li class="list-group-item"><i class="fas fa-check-circle text-success me-2"></i>${feature}</li>`).join('')}
                    </ul>
                    <hr>
                    <h5>Listing Agent</h5>
                    <div class="d-flex align-items-center mb-2">
                        <div class="bg-secondary text-white rounded-circle me-3 d-flex align-items-center justify-content-center" style="width: 50px; height: 50px;">
                            <i class="fas fa-user"></i>
                        </div>
                        <div>
                            <h6 class="mb-0">${property.agent.name}</h6>
                            <p class="text-muted mb-0">Property Specialist</p>
                        </div>
                    </div>
                    <div class="mt-2">
                        <p class="mb-1"><i class="fas fa-phone me-2"></i>${property.agent.phone}</p>
                        <p class="mb-0"><i class="fas fa-envelope me-2"></i>${property.agent.email}</p>
                    </div>
                </div>
                <div class="d-grid gap-2 d-md-flex justify-content-md-end">
                    <button class="btn btn-outline-secondary me-md-2">Schedule Viewing</button>
                    <button class="btn btn-primary">Contact Agent</button>
                </div>
            `;

                propertyDetails.innerHTML = detailsHTML;

                // Show panel and overlay
                detailPanel.classList.add('show');
                panelOverlay.style.display = 'block';
                document.body.style.overflow = 'hidden';
            }
        }

        // Add click event to table rows
        tableRows.forEach(row => {
            row.addEventListener('click', function() {
                const propertyId = this.getAttribute('data-id');
                openPropertyDetails(propertyId);
            });
        });

        // Close panel function
        function closeDetailPanel() {
            detailPanel.classList.remove('show');
            panelOverlay.style.display = 'none';
            document.body.style.overflow = '';
        }

        // Close panel events
        closePanel.addEventListener('click', closeDetailPanel);
        panelOverlay.addEventListener('click', closeDetailPanel);
    });
</script>
@endsection