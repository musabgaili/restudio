<template>
    <div class="mb-4">
        <div class="d-flex justify-content-between align-items-center mb-3">
            <h5 class="mb-0">Virtual Tours</h5>
            <button class="btn btn-sm btn-primary" @click="showForm = !showForm">
                <i class="fas fa-plus me-1"></i>Add Virtual Tour
            </button>
        </div>

        <!-- Virtual Tour Form -->
        <div v-if="showForm" class="card mb-3">
            <div class="card-body">
                <form @submit.prevent="submitVirtualTour">
                    <div class="row g-3">
                        <!-- <div class="col-md-6">
                            <label class="form-label">Tour Title</label>
                            <input type="text" v-model="form.title" class="form-control" required>
                        </div> -->
                        <div class="col-12">
                            <label class="form-label">Tour File</label>
                            <div class="input-group">
                                <input type="file" ref="fileInput" class="form-control" @change="handleFileUpload"
                                    accept=".mp4,.webm,.mov,.png,.jpg,.jpeg,.gif" multiple>

                                <button class="btn btn-outline-secondary" type="button" @click="triggerFileUpload">
                                    <i class="fas fa-upload me-1"></i>Upload
                                </button>
                            </div>
                        </div>
                        <div class="col-12">
                            <button type="submit" class="btn btn-primary" :disabled="loading">
                                <span v-if="loading" class="spinner-border spinner-border-sm me-1"></span>
                                Submit Tour
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>

        <!-- Virtual Tours List -->
        <VirtualToursMedia
            :propertyId="propertyId"
            :virtualTours="virtualTours"
            @tour-deleted="$emit('tour-deleted')"
        />
    </div>
</template>

<script>
import VirtualToursMedia from './MediaView/VirtualToursMedia.vue';

export default {
    name: 'PropertyVirtualTourForm',
    components: {
        VirtualToursMedia
    },
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
    emits: ['tour-deleted', 'tour-added'],
    data() {
        return {
            showForm: false,
            loading: false,
            form: {
                title: '',
                file: null
            }
        }
    },
    methods: {
        triggerFileUpload() {
            this.$refs.fileInput.click()
        },
        handleFileUpload(event) {
            this.form.file = event.target.files
        },
        async submitVirtualTour() {
            this.loading = true
            try {
                const formData = new FormData()
                formData.append('property_id', this.propertyId)
                formData.append('title', this.form.title)

                if (this.form.file && this.form.file.length > 0) {
                    for (let i = 0; i < this.form.file.length; i++) {
                        formData.append('file[]', this.form.file[i])
                    }
                }

                await axios.post(`/api/properties/${this.propertyId}/add-media/virtual-tour`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                })
                this.$emit('tour-added')
                this.resetForm()
            } catch (error) {
                console.error('Error submitting virtual tour:', error)
            } finally {
                this.loading = false
            }
        },
        resetForm() {
            this.form = {
                title: '',
                file: null
            }
            this.showForm = false
        }
    }
}
</script>
