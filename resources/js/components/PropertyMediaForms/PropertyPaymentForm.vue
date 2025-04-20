<template>
  <div class="mb-4">
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h5 class="mb-0">Payments</h5>
      <button class="btn btn-sm btn-primary" @click="showForm = !showForm">
        <i class="fas fa-plus me-1"></i>Add Payment
      </button>
    </div>

    <!-- Payment Form -->
    <div v-if="showForm" class="card mb-3">
      <div class="card-body">
        <form @submit.prevent="submitPayment">
          <div class="row g-3">
            <div class="col-md-6">
              <label class="form-label">Payment Type</label>
              <select v-model="form.payment_type" class="form-select" required>
                <option value="down_payment">Down Payment</option>
                <option value="installment">Installment</option>
              </select>
            </div>
            <div class="col-md-6">
              <label class="form-label">Deposit Date</label>
              <input type="date" v-model="form.deposit_date" class="form-control" required>
            </div>
            <div class="col-md-6">
              <label class="form-label">Deposit Type</label>
              <select v-model="form.deposit_type" class="form-select" required>
                <option value="cheque">Cheque</option>
                <option value="bank_transfer">Bank Transfer</option>
              </select>
            </div>
            <div class="col-md-6">
              <label class="form-label">Amount</label>
              <input type="number" v-model="form.amount" class="form-control" required>
            </div>
            <div class="col-12">
              <label class="form-label">Receipt File</label>
              <div class="input-group">
                <input type="file" ref="fileInput" class="form-control" @change="handleFileUpload" accept=".pdf,.jpg,.jpeg,.png">
                <button class="btn btn-outline-secondary" type="button" @click="triggerFileUpload">
                  <i class="fas fa-upload me-1"></i>Upload
                </button>
              </div>
            </div>
            <div class="col-12">
              <button type="submit" class="btn btn-primary" :disabled="loading">
                <span v-if="loading" class="spinner-border spinner-border-sm me-1"></span>
                Submit Payment
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>

    <!-- Payments List -->
    <div v-if="payments && payments.length" class="list-group">
      <div v-for="payment in payments" :key="payment.id" class="list-group-item">
        <div class="d-flex justify-content-between align-items-center">
          <div>
            <h6 class="mb-1">${{ payment.amount }}</h6>
            <small class="text-muted">{{ payment.created_at }}</small>
          </div>
          <button class="btn btn-sm btn-outline-primary" @click="viewPayment(payment)">
            <i class="fas fa-file-invoice me-1"></i>View Receipt
          </button>
        </div>
      </div>
    </div>
    <div v-else class="alert alert-info">
      No payments found
    </div>
  </div>
</template>

<script>
export default {
  name: 'PropertyPaymentForm',
  props: {
    propertyId: {
      type: [Number, String],
      required: true
    },
    payments: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      showForm: false,
      loading: false,
      form: {
        payment_type: 'down_payment',
        deposit_date: '',
        deposit_type: 'cheque',
        amount: '',
        file: null
      }
    }
  },
  methods: {
    triggerFileUpload() {
      this.$refs.fileInput.click()
    },
    handleFileUpload(event) {
      this.form.file = event.target.files[0]
    },
    async submitPayment() {
      this.loading = true
      try {
        const formData = new FormData()
        formData.append('property_id', this.propertyId)
        formData.append('payment_type', this.form.payment_type)
        formData.append('deposit_date', this.form.deposit_date)
        formData.append('deposit_type', this.form.deposit_type)
        formData.append('amount', this.form.amount)
        if (this.form.file) {
          formData.append('file', this.form.file)
        }

        await axios.post(`/api/properties/${this.propertyId}/add-media/payment`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })

        this.$emit('payment-added')
        this.resetForm()
      } catch (error) {
        console.error('Error submitting payment:', error)
      } finally {
        this.loading = false
      }
    },
    resetForm() {
      this.form = {
        payment_type: 'down_payment',
        deposit_date: '',
        deposit_type: 'cheque',
        amount: '',
        file: null
      }
      this.showForm = false
    },
    viewPayment(payment) {
      if (payment.media && payment.media.length) {
        window.open(payment.media[0].getUrl(), '_blank')
      }
    }
  }
}
</script>
