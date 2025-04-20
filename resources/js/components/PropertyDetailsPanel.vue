<template>
  <div>
    <div class="panel-overlay" v-show="isVisible" @click="close"></div>
    <div class="detail-panel" :class="{ 'show': isVisible }">
      <div class="panel-header">
        <div class="d-flex justify-content-between align-items-center">
          <h3 id="panel-title">{{ property ? property.name : 'Property Details' }}</h3>
          <button type="button" class="btn-close" @click="close"></button>
        </div>
      </div>
      <div class="panel-body">
        <div v-if="loading" class="text-center py-5">
          <div class="spinner-border" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>
        <div v-else-if="error" class="alert alert-danger">
          {{ error }}
        </div>
        <div v-else-if="property" id="property-details">
          <!-- Property Details Section -->
          <div class="mb-4">
            <!-- <div class="property-images mb-3">
              <img v-if="property.media && property.media.length"
                   :src="property.media[0].getUrl()"
                   :alt="property.name"
                   class="img-fluid rounded mb-3" />
              <img v-else src="https://placehold.co/600x400" :alt="property.name" class="img-fluid rounded mb-3" />
            </div> -->

            <div class=" mb-4">
              <!-- <div class="card-header bg-primary text-white">
                <h4 class="mb-0">{{ property.name }}</h4>
              </div> -->
              <div class="">
                <div class="row">
                  <div class="col-md-6 mb-3">
                    <div class="d-flex align-items-center mb-2">
                      <i class="fas fa-tag me-2 text-primary"></i>
                      <h5 class="mb-0">Price Information</h5>
                    </div>
                    <div class="ps-4">
                      <div class="mb-2">
                        <small class="text-muted">Total Price:</small>
                        <p class="mb-0 fw-bold">{{ property.price.toLocaleString() }} SAR</p>
                      </div>
                      <div class="mb-2">
                        <small class="text-muted">Price Per Meter:</small>
                        <p class="mb-0 fw-bold">{{ property.price_per_meter ? property.price_per_meter.toLocaleString() : 'N/A' }} SAR</p>
                      </div>
                      <div class="mb-2">
                        <small class="text-muted">Remaining Amount:</small>
                        <p class="mb-0 fw-bold">{{ property.remaining_amount ? property.remaining_amount.toLocaleString() : 'N/A' }} SAR</p>
                      </div>
                    </div>
                  </div>

                  <div class="col-md-6 mb-3">
                    <div class="d-flex align-items-center mb-2">
                      <i class="fas fa-home me-2 text-primary"></i>
                      <h5 class="mb-0">Property Type</h5>
                    </div>
                    <div class="ps-4">
                      <div class="mb-2">
                        <small class="text-muted">Basic Type:</small>
                        <p class="mb-0 fw-bold text-capitalize">{{ property.type }}</p>
                      </div>
                      <div class="mb-2">
                        <small class="text-muted">Detailed Type:</small>
                        <p class="mb-0 fw-bold">{{ property.property_type_detail || 'N/A' }}</p>
                      </div>
                      <div v-if="property.type === 'apartment'" class="mb-2">
                        <small class="text-muted">Bedrooms:</small>
                        <p class="mb-0 fw-bold">{{ property.bedrooms || 'N/A' }}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="row">
                  <div class="col-md-6 mb-3">
                    <div class="d-flex align-items-center mb-2">
                      <i class="fas fa-ruler-combined me-2 text-primary"></i>
                      <h5 class="mb-0">Dimensions</h5>
                    </div>
                    <div class="ps-4">
                      <div class="mb-2">
                        <small class="text-muted">Total Area:</small>
                        <p class="mb-0 fw-bold">{{ property.area }} m²</p>
                      </div>
                      <div class="mb-2">
                        <small class="text-muted">Front Width:</small>
                        <p class="mb-0 fw-bold">{{ property.front_width || 'N/A' }} m</p>
                      </div>
                      <div class="mb-2">
                        <small class="text-muted">Depth:</small>
                        <p class="mb-0 fw-bold">{{ property.depth || 'N/A' }} m</p>
                      </div>
                    </div>
                  </div>

                  <div class="col-md-6 mb-3">
                    <div class="d-flex align-items-center mb-2">
                      <i class="fas fa-map-marker-alt me-2 text-primary"></i>
                      <h5 class="mb-0">Location</h5>
                    </div>
                    <div class="ps-4">
                      <div class="mb-2">
                        <small class="text-muted">Block:</small>
                        <p class="mb-0 fw-bold">{{ property.block_id }}</p>
                      </div>
                      <div class="mb-2">
                        <small class="text-muted">Block Number:</small>
                        <p class="mb-0 fw-bold">{{ property.block_number || 'N/A' }}</p>
                      </div>
                      <div class="mb-2">
                        <small class="text-muted">Zone:</small>
                        <p class="mb-0 fw-bold">{{ property.zone || 'N/A' }}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="row">
                  <div class="col-md-6 mb-3">
                    <div class="d-flex align-items-center mb-2">
                      <i class="fas fa-road me-2 text-primary"></i>
                      <h5 class="mb-0">Street Details</h5>
                    </div>
                    <div class="ps-4">
                      <div class="mb-2">
                        <small class="text-muted">Street Width:</small>
                        <p class="mb-0 fw-bold">{{ property.street_width || 'N/A' }}</p>
                      </div>
                      <div class="mb-2">
                        <small class="text-muted">Orientation:</small>
                        <p class="mb-0 fw-bold">{{ property.orientation || 'N/A' }}</p>
                      </div>
                    </div>
                  </div>

                  <div class="col-md-6 mb-3">
                    <div class="d-flex align-items-center mb-2">
                      <i class="fas fa-info-circle me-2 text-primary"></i>
                      <h5 class="mb-0">Status</h5>
                    </div>
                    <div class="ps-4">
                      <div class="mb-2">
                        <small class="text-muted">Availability:</small>
                        <p class="mb-0">
                          <span class="badge" :class="{
                            'bg-success': property.status === 'available',
                            'bg-danger': property.status === 'n-a' || property.status === 'غير متاح',
                            'bg-warning text-dark': property.status === 'booked',
                            'bg-info': property.status === 'sold'
                          }">{{ property.status }}</span>
                        </p>
                      </div>
                      <div v-if="property.virtual_tour_link" class="mb-2">
                        <small class="text-muted">Virtual Tour:</small>
                        <p class="mb-0">
                          <a :href="property.virtual_tour_link" target="_blank" class="btn btn-sm btn-outline-primary">
                            <i class="fas fa-vr-cardboard me-1"></i>View Tour
                          </a>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div v-if="property.notes" class="row">
                  <div class="col-12">
                    <div class="d-flex align-items-center mb-2">
                      <i class="fas fa-sticky-note me-2 text-primary"></i>
                      <h5 class="mb-0">Notes</h5>
                    </div>
                    <div class="ps-4">
                      <p class="mb-0">{{ property.notes }}</p>
                    </div>
                  </div>
                </div>

                <!-- shape is not displayed as it's a geometry type for map visualization -->
              </div>
            </div>
          </div>

          <!-- Payments Section -->
          <PropertyPaymentForm
            :property-id="property.id"
            :payments="payments"
            @payment-added="refreshData"
          />

          <!-- Media Section -->
          <PropertyMediaUploadForm
            :property-id="property.id"
            :media="media"
            @media-added="refreshData"
            @media-deleted="refreshData"
          />

          <!-- Virtual Tours Section -->
          <PropertyVirtualTourForm
            :property-id="property.id"
            :virtual-tours="virtualTours"
            @tour-added="refreshData"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import PropertyPaymentForm from './PropertyMediaForms/PropertyPaymentForm.vue'
import PropertyMediaUploadForm from './PropertyMediaForms/PropertyMediaUploadForm.vue'
import PropertyVirtualTourForm from './PropertyMediaForms/PropertyVirtualTourForm.vue'

export default {
  name: 'PropertyDetailsPanel',
  components: {
    PropertyPaymentForm,
    PropertyMediaUploadForm,
    PropertyVirtualTourForm
  },
  data() {
    return {
      isVisible: false,
      loading: false,
      error: null,
      property: null,
      payments: [],
      media: [],
      virtualTours: []
    }
  },
  methods: {
    async open(propertyId) {
      this.isVisible = true
      this.loading = true
      this.error = null

      try {
        await this.refreshData(propertyId)
      } catch (err) {
        this.error = 'Failed to load property details'
        console.error(err)
      } finally {
        this.loading = false
      }
    },
    async refreshData(propertyId) {
      const response = await axios.get(`/api/properties/${propertyId}/details`)
      this.property = response.data.property
      this.payments = response.data.payments
      this.media = response.data.media
      this.virtualTours = response.data.virtual_tours
    },
    close() {
      this.isVisible = false
      this.property = null
      this.payments = []
      this.media = []
      this.virtualTours = []
    },
    viewProperty() {
      window.open(`/properties/${this.property.id}`, '_blank')
    }
  }
}
</script>
<style src="../../css/side_panel.css"></style>
<!--
<style scoped>
</style> -->
