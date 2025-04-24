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


const tourId = document.getElementById('viewer').dataset.tourId;


// Fetch tour data from the server
fetch(`/api/virtual-tours/${tourId}`)
    .then(response => response.json())
    .then(data => {
        console.log('Tour data received:', data);
        // Enhanced Code #
        const nodes = data.nodes.map(node => {
            const panoramaMedia = node.media.find(media => media.collection_name === 'panoramas');
            const thumbnailMedia = node.media.find(media => media.collection_name === 'thumbnails') || node.media.find(media => media.collection_name === 'panoramas');

            return {
                id: node.id,
                panorama: panoramaMedia ? panoramaMedia.original_url : null,
                thumbnail: thumbnailMedia ? thumbnailMedia.original_url : null,
                name: node.name,
                caption: node.caption,
                links: node.links.map(link => ({
                    nodeId: link.to_node_id
                })),
                markers: node.markers.map(marker => {
                    // Parse the position JSON string to an object
                    const position = JSON.parse(marker.position);

                    // Add debug logging for markers
                    console.log('Marker created with position:', position);

                    const markerObject = {
                        id: `marker-${marker.id}`,
                        position: position, // Use the parsed position object

                        // Use HTML instead of image for marker content
                        html: `<div class="tour-marker"></div>`,

                        // Additional properties
                        tooltip: `Link to ${marker.target_node_id ? `Node ${marker.target_node_id}` : 'another view'}`,
                        size: { width: 32, height: 32 },
                        anchor: 'bottom center',

                        // Store the target node for navigation
                        data: {
                            targetNodeId: marker.target_node_id
                        }
                    };

                    console.log('Complete marker object:', markerObject);
                    return markerObject;
                }),
                gps: node.gps,
                sphereCorrection: node.sphere_correction,
                start_node: node.start_node, // أضف هذا الحقل لتستخدمه في `startNodeId`
            };
        });
        // end of Enhanced code

        const viewer = new Viewer({
            container: 'viewer',
            // loadingImg: '{{ asset('360images/loader.gif') }}',
            loadingImg: window.loaderImageUrl,
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
                    positionMode: 'manual',
                    renderMode: '3d',
                    nodes: nodes,
                    startNodeId: nodes.find(node => node.start_node === 1)?.id ?? nodes[0].id,
                }],
            ],
        });

        console.log('Viewer initialized with plugins');

        // Get plugin references
        const tour = viewer.getPlugin(VirtualTourPlugin);
        const markersPlugin = viewer.getPlugin(MarkersPlugin);

        console.log('Tour plugin:', tour);
        console.log('Markers plugin:', markersPlugin);

        /// Sidebar
        // اسم الجولة في الأعلى
        document.getElementById('tour-name').innerText = data.tourName ?? 'Virtual Tour';


        // قائمة الصور المصغرة
        const sidebar = document.getElementById('node-list');
        nodes.forEach(node => {
            const container = document.createElement('div');
            container.className = 'node-card';

            const img = document.createElement('img');
            img.src = node.thumbnail;
            img.alt = node.name;
            img.className = 'node-img';

            const caption = document.createElement('div');
            caption.className = 'node-caption';
            caption.innerText = node.name;

            container.appendChild(img);
            container.appendChild(caption);

            sidebar.appendChild(container);
        });

        // Add click event listeners to the sidebar image containers
        sidebar.querySelectorAll('.node-card').forEach((container, index) => {
            container.addEventListener('click', () => {
                tour.setCurrentNode(nodes[index].id);
            });
        });

        // Add event listener for marker click
        markersPlugin.addEventListener('select-marker', (event) => {
            if (event.marker && event.marker.data && event.marker.data.targetNodeId) {
                const targetNodeId = event.marker.data.targetNodeId;
                console.log(`Navigating to node: ${targetNodeId}`);
                tour.setCurrentNode(targetNodeId);
            }
        });

    })
    .catch(error => {
        console.error('Error loading virtual tour:', error);
        document.getElementById('viewer').innerHTML = `
            <div class="alert alert-danger m-5">
                <h4>Error Loading Tour</h4>
                <p>An error occurred while loading the virtual tour. Please try again later.</p>
                <small>${error.message}</small>
            </div>
        `;
    });
