<template>
    <div class="mb-4">
        <!-- <div class="d-flex justify-content-between align-items-center mb-3">
            <h5 class="mb-0">Property Media</h5>
        </div> -->

        <!-- Media List -->
        <div v-if="media && media.length" class="row g-3">
            <div v-for="item in media" :key="item.id" class="col-md-4">
                <div class="card h-100">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-start mb-2">
                            <h6 class="card-title mb-0">{{ item.title }}</h6>
                            <span class="badge" :class="getMediaTypeBadgeClass(item.media_type)">
                                {{ item.media_type }}
                            </span>
                        </div>
                        <div class="text-center">
                            <img v-if="item.media_type === 'image' && item.media && item.media.length"
                                :src="item.media[0].original_url" class="img-fluid rounded cursor-pointer" alt="Media"
                                @click="openMediaViewer(item)">
                            <video v-else-if="item.media_type === 'video' && item.media && item.media.length" controls
                                class="w-100">
                                <source :src="item.media[0].original_url" :type="item.media[0].mime_type">
                            </video>
                            <div v-else-if="item.media && item.media.length" class="p-3 bg-light rounded">
                                <a :href="item.media[0].original_url" target="_blank" class="text-decoration-none">
                                    <i class="fas fa-file fa-3x text-muted"></i>
                                    <p class="mt-2 mb-0">{{ item.media[0].file_name }}</p>
                                </a>
                            </div>
                            <div v-else class="p-3 bg-light rounded">
                                <i class="fas fa-file fa-3x text-muted"></i>
                                <p class="mt-2 mb-0">No file</p>
                            </div>
                        </div>
                    </div>
                    <div class="card-footer">
                        <button class="btn btn-sm btn-outline-danger" @click="deleteMedia(item)">
                            <i class="fas fa-trash me-1"></i>Delete
                        </button>
                    </div>
                </div>
            </div>
        </div>
        <div v-else class="alert alert-info">
            No media found
        </div>
    </div>

    <!-- Media Viewer Modal - Moved outside component root to prevent DOM updates affecting it -->
    <Teleport to="body">
        <div class="modal fade" id="mediaViewerModal" tabindex="-1" aria-labelledby="mediaViewerModalLabel"
            aria-hidden="true" ref="modalElement">
            <div class="modal-dialog modal-xl modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="mediaViewerModalLabel">{{ currentMedia ? currentMedia.title : '' }}
                        </h5>
                        <button type="button" class="btn-close" @click="closeModal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body text-center position-relative p-1">
                        <div class="media-container">
                            <img v-if="currentMedia && currentMedia.media && currentMedia.media.length"
                                :src="currentMedia.media[0].original_url" class="img-large" alt="Media">
                        </div>
                        <button v-if="currentIndex > 0"
                            class="btn btn-dark position-absolute top-50 start-0 translate-middle-y ms-2"
                            @click="navigateMedia(-1)">
                            <i class="fas fa-chevron-left"></i>
                        </button>
                        <button v-if="currentIndex < media.length - 1"
                            class="btn btn-dark position-absolute top-50 end-0 translate-middle-y me-2"
                            @click="navigateMedia(1)">
                            <i class="fas fa-chevron-right"></i>
                        </button>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" @click="closeModal">Close</button>
                    </div>
                </div>
            </div>
        </div>
    </Teleport>
</template>

<script>
export default {
    name: 'PropertyMedia',
    props: {
        propertyId: {
            type: [Number, String],
            required: true
        },
        media: {
            type: Array,
            default: () => []
        }
    },
    emits: ['media-deleted'],
    data() {
        return {
            currentMedia: null,
            currentIndex: -1,
            modalInstance: null
        }
    },
    mounted() {
        // Ensure all previous modal artifacts are cleaned up
        this.cleanupModal();

        // Add a small delay to ensure DOM is ready
        setTimeout(() => {
            this.initModal();
        }, 100);
    },
    beforeUnmount() {
        // Clean up when component is destroyed
        this.cleanupModal();
    },
    methods: {
        cleanupModal() {
            // First dispose any existing modal instance
            if (this.modalInstance) {
                try {
                    this.modalInstance.dispose();
                } catch (e) {
                    console.warn('Error disposing modal:', e);
                }
                this.modalInstance = null;
            }

            // Remove any stuck backdrops
            document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
                backdrop.remove();
            });

            // Fix body styling
            document.body.classList.remove('modal-open');
            document.body.style.overflow = '';
            document.body.style.paddingRight = '';
        },

        initModal() {
            // Check if bootstrap is available
            if (typeof bootstrap === 'undefined') {
                console.error('Bootstrap is not available');
                return;
            }

            // Use a direct DOM query rather than getElementById to be safer
            const modalElement = document.querySelector('#mediaViewerModal');

            if (!modalElement) {
                console.error('Modal element not found');
                return;
            }

            try {
                // Create a fresh instance of Bootstrap Modal
                this.modalInstance = new bootstrap.Modal(modalElement, {
                    backdrop: 'static', // Prevent closing when clicking outside
                    keyboard: true,      // Allow ESC key to close
                    focus: true          // Focus the modal when opened
                });

                // Add event listener for modal hidden event
                modalElement.addEventListener('hidden.bs.modal', () => {
                    this.currentMedia = null;
                    this.currentIndex = -1;
                });

            } catch (e) {
                console.error('Modal initialization error:', e);
            }
        },

        async deleteMedia(media) {
            if (confirm('Are you sure you want to delete this media?')) {
                try {
                    await axios.delete(`/api/properties/${this.propertyId}/media/${media.id}`);
                    this.$emit('media-deleted');
                } catch (error) {
                    console.error('Error deleting media:', error);
                }
            }
        },

        getMediaTypeBadgeClass(type) {
            switch (type) {
                case 'image':
                    return 'bg-success';
                case 'video':
                    return 'bg-primary';
                case 'document':
                    return 'bg-secondary';
                default:
                    return 'bg-light text-dark';
            }
        },

        openMediaViewer(item) {
            // Set media details first
            this.currentIndex = this.media.findIndex(m => m.id === item.id);
            this.currentMedia = item;

            // Make sure modal is initialized
            if (!this.modalInstance) {
                this.cleanupModal();
                this.initModal();
            }

            // Small timeout to ensure DOM is ready
            setTimeout(() => {
                try {
                    if (this.modalInstance) {
                        this.modalInstance.show();
                    } else {
                        console.error('Modal is not initialized');
                    }
                } catch (e) {
                    console.error('Error showing modal:', e);

                    // Try to recover
                    this.cleanupModal();
                    this.initModal();

                    setTimeout(() => {
                        if (this.modalInstance) {
                            try {
                                this.modalInstance.show();
                            } catch (e2) {
                                console.error('Failed to recover modal:', e2);
                                alert('Could not open image viewer. Please try again.');
                            }
                        }
                    }, 100);
                }
            }, 50);
        },

        closeModal() {
            try {
                if (this.modalInstance) {
                    this.modalInstance.hide();
                }
            } catch (e) {
                console.error('Error hiding modal:', e);
                this.cleanupModal();
            }
        },

        navigateMedia(direction) {
            this.currentIndex += direction;
            if (this.currentIndex >= 0 && this.currentIndex < this.media.length) {
                this.currentMedia = this.media[this.currentIndex];
            }
        }
    }
}
</script>

<style scoped>
.cursor-pointer {
    cursor: pointer;
}

.media-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 400px;
    max-height: 80vh;
    overflow: hidden;
}

.img-large {
    max-width: 100%;
    max-height: 70vh;
    object-fit: contain;
}

.btn-dark {
    opacity: 0.7;
}

.btn-dark:hover {
    opacity: 1;
}
</style>