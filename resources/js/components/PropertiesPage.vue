<template>
  <div>
    <properties-table
      :properties="properties"
      @open-details="openPropertyDetails"
      @add-property="openAddProperty"
    />
    <property-details-panel
      ref="propertyDetailsPanel"
    />
  </div>
</template>

<script>
import PropertiesTable from './PropertiesTable.vue'
import PropertyDetailsPanel from './PropertyDetailsPanel.vue'

export default {
  name: 'PropertiesPage',
  components: {
    PropertiesTable,
    PropertyDetailsPanel
  },
  data() {
    return {
      properties: []
    }
  },
  async created() {
    await this.fetchProperties()
  },
  methods: {
    async fetchProperties() {
      try {
        const response = await axios.get('/api/properties')
        this.properties = response.data
      } catch (error) {
        console.error('Error fetching properties:', error)
      }
    },
    openPropertyDetails(propertyId) {
      this.$refs.propertyDetailsPanel.open(propertyId)
    },
    openAddProperty() {
      // Implement add property functionality
      window.location.href = '/properties/create'
    }
  }
}
</script>
