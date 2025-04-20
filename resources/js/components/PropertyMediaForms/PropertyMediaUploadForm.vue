<template>
  <div class="mb-4">
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h5 class="mb-0">Property Media</h5>
      <button class="btn btn-sm btn-primary" @click="showForm = !showForm">
        <i class="fas fa-plus me-1"></i>Add Media
      </button>
    </div>

    <!-- Media Upload Form -->
    <div v-if="showForm" class="card mb-3">
      <div class="card-body">
        <form @submit.prevent="submitMedia">
          <div class="row g-3">
            <!-- <div class="col-md-6">
              <label class="form-label">Media Type</label>
              <select v-model="form.media_type" class="form-select" required>
                <option value="image">Image</option>
                <option value="video">Video</option>
                <option value="document">Document</option>
              </select>
            </div>
            <div class="col-md-6">
              <label class="form-label">Title</label>
              <input type="text" v-model="form.title" class="form-control" required>
            </div> -->
            <div class="col-12">
              <label class="form-label">File</label>
              <div class="input-group">
                <input type="file" ref="fileInput" class="form-control" @change="handleFileUpload" :accept="fileAccept" multiple>
                <button class="btn btn-outline-secondary" type="button" @click="triggerFileUpload">
                  <i class="fas fa-upload me-1"></i>
                  Upload
                </button>
              </div>
            </div>
            <div class="col-12">
              <button type="submit" class="btn btn-primary" :disabled="loading">
                <span v-if="loading" class="spinner-border spinner-border-sm me-1"></span>
                Submit Media
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>

    <!-- Media List -->
    <PropertyMedia
      :propertyId="propertyId"
      :media="media"
      @media-deleted="$emit('media-deleted')"
    />
  </div>
</template>

<script>
import PropertyMedia from './MediaView/PropertyMedia.vue';

export default {
  name: 'PropertyMediaUploadForm',
  components: {
    PropertyMedia
  },
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
  data() {
    return {
      showForm: false,
      loading: false,
      form: {
        media_type: 'image',
        title: '',
        file: null
      }
    }
  },
  computed: {
    fileAccept() {
      switch (this.form.media_type) {
        case 'image':
          return 'image/*'
        case 'video':
          return 'video/*'
        case 'document':
          return '.pdf,.doc,.docx,.xls,.xlsx'
        default:
          return '*'
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
    async submitMedia() {
      this.loading = true
      try {
        const formData = new FormData()
        formData.append('property_id', this.propertyId)
        formData.append('media_type', this.form.media_type)
        formData.append('title', this.form.title)
        if (this.form.file) {
          for (let i = 0; i < this.form.file.length; i++) {
            formData.append('file[]', this.form.file[i])
          }
        }

        await axios.post(`/api/properties/${this.propertyId}/add-media/media`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })

        this.$emit('media-added')
        this.resetForm()
      } catch (error) {
        console.error('Error submitting media:', error)
      } finally {
        this.loading = false
      }
    },
    resetForm() {
      this.form = {
        media_type: 'image',
        title: '',
        file: null
      }
      this.showForm = false
    }
  }
}
</script>
