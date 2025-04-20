<template>
  <div class="col-lg-10 col-md-9 col-sm-8 py-4 px-4">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2>Property Listings</h2>
      <button class="btn btn-primary" @click="openAddProperty">
        <i class="fas fa-plus me-2"></i> Add Property
      </button>
    </div>

    <div class="table-container mb-4">
      <table class="table table-hover properties-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Type</th>
            <th>Price</th>
            <th>Status</th>
            <th>Last Updated</th>
          </tr>
        </thead>
        <tbody>
          <property-row
            v-for="property in properties"
            :key="property.id"
            :property="property"
            @open-details="openPropertyDetails"
          />
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import PropertyRow from './PropertyRow.vue'

export default {
  name: 'PropertiesTable',
  components: {
    PropertyRow
  },
  props: {
    properties: {
      type: Array,
      required: true
    }
  },
  methods: {
    openPropertyDetails(propertyId) {
      this.$emit('open-details', propertyId)
    },
    openAddProperty() {
      this.$emit('add-property')
    }
  }
}
</script>
