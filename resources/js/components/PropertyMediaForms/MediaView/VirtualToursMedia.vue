<template>
    <div class="mb-4">
        <!-- Virtual Tours List -->
        <div v-if="virtualTours && virtualTours.length" class="row g-3">
            <div v-for="tour in virtualTours" :key="tour.id" class="col-md-4">
                <div class="card h-100">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-start mb-2">
                            <h6 class="card-title mb-0">{{ tour.title || 'Virtual Tour' }}</h6>
                            <span class="badge bg-primary">
                                Virtual Tour
                            </span>
                        </div>
                        <div class="text-center">
                            <div v-if="tour.media && tour.media.length" class="p-3 bg-light rounded">
                                <a :href="tour.media[0].original_url" target="_blank" class="text-decoration-none">
                                    <i class="fas fa-video fa-3x text-primary"></i>
                                    <p class="mt-2 mb-0">{{ tour.media[0].file_name }}</p>
                                </a>
                            </div>
                            <div v-else class="p-3 bg-light rounded">
                                <i class="fas fa-video fa-3x text-muted"></i>
                                <p class="mt-2 mb-0">No tour file</p>
                            </div>
                        </div>
                    </div>
                    <div class="card-footer">
                        <button class="btn btn-sm btn-outline-danger" @click="deleteTour(tour)">
                            <i class="fas fa-trash me-1"></i>Delete
                        </button>
                    </div>
                </div>
            </div>
        </div>
        <div v-else class="alert alert-info">
            No virtual tours found
        </div>
    </div>
</template>

<script>
export default {
    name: 'VirtualToursMedia',
    props: {
        propertyId: {
            type: [Number, String],
            required: true
        },
        virtualTours: {
            type: Array,
            default: () => []
        }
    },
    emits: ['tour-deleted'],
    methods: {
        async deleteTour(tour) {
            if (confirm('Are you sure you want to delete this virtual tour?')) {
                try {
                    await axios.delete(`/api/properties/${this.propertyId}/media/${tour.id}`);
                    this.$emit('tour-deleted');
                } catch (error) {
                    console.error('Error deleting virtual tour:', error);
                }
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
</style>
