<template>
  <tr @click="openDetails" style="cursor: pointer;">
    <td>{{ property.name }}</td>
    <td>{{ property.type }}</td>
    <td>{{ property.price }}</td>
    <td>
      <span :class="statusBadgeClass">{{ property.status }}</span>
    </td>
    <td>{{ formattedDate }}</td>
  </tr>
</template>

<script>
export default {
  name: 'PropertyRow',
  props: {
    property: {
      type: Object,
      required: true
    }
  },
  computed: {
    formattedDate() {
      return new Date(this.property.created_at).toLocaleDateString()
    },
    statusBadgeClass() {
      return {
        'badge': true,
        'bg-success': this.property.status === 'available',
        'bg-warning': this.property.status === 'pending',
        'bg-danger': this.property.status === 'sold',
        'bg-info': this.property.status === 'reserved'
      }
    }
  },
  methods: {
    openDetails() {
      this.$emit('open-details', this.property.id)
    }
  }
}
</script>
