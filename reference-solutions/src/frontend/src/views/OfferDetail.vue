<template>
  <div v-if="offer" class="offer-detail-container" style="padding-top: 80px;">
    <nav aria-label="breadcrumb" class="mb-4">
      <ol class="breadcrumb">
        <li class="breadcrumb-item"><router-link to="/offers">Offers</router-link></li>
        <li class="breadcrumb-item active">Offer Details</li>
      </ol>
    </nav>

    <div class="row">
      <!-- Offer Header -->
      <div class="col-12 mb-4">
        <div class="card shadow-sm border-0">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-start">
              <div>
                <h2 class="mb-2">{{ offer.lender.name }}</h2>
                <div class="mb-2">
                  <i class="bi bi-star-fill text-warning"></i>
                  <span class="text-muted ms-2">{{ offer.lender.description }}</span>
                </div>
              </div>
              <span
                class="badge fs-6"
                :class="statusBadgeClass(offer.status)"
              >
                {{ offer.status.toUpperCase() }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Offer Info -->
      <div class="col-md-8">
        <!-- Loan Details -->
        <div class="card shadow-sm mb-4">
          <div class="card-header bg-white">
            <h5 class="mb-0">Loan Details</h5>
          </div>
          <div class="card-body">
            <div class="row g-4">
              <div class="col-6">
                <h6 class="text-muted">Loan Amount</h6>
                <h3 class="text-primary mb-0">{{ formatAmount(offer.loan_amount) }}</h3>
              </div>
              <div class="col-6">
                <h6 class="text-muted">Interest Rate (APR)</h6>
                <h3 class="text-success mb-0">{{ offer.interest_rate }}%</h3>
              </div>
              <div class="col-6">
                <h6 class="text-muted">Loan Term</h6>
                <h3 class="mb-0">{{ offer.term_months }} months</h3>
              </div>
              <div class="col-6">
                <h6 class="text-muted">Monthly Payment</h6>
                <h3 class="mb-0">{{ formatAmount(offer.monthly_payment) }}</h3>
              </div>
            </div>
          </div>
        </div>

        <!-- Repayment Summary Panel -->
        <div class="card shadow-sm mb-4" style="border-left: 4px solid #0d6efd;">
          <div class="card-header bg-light">
            <h5 class="mb-0">
              <i class="bi bi-calculator me-2"></i>Repayment Summary
            </h5>
          </div>
          <div class="card-body">
            <div class="row g-4">
              <div class="col-md-12">
                <div class="d-flex justify-content-between align-items-center mb-3">
                  <div>
                    <h6 class="text-muted mb-0">Monthly Payment</h6>
                    <p class="mb-0 text-secondary">Estimated payment per month</p>
                  </div>
                  <div class="text-end">
                    <h3 class="text-primary">{{ formatAmount(offer.value?.monthly_payment || calculateMonthlyPayment) }}</h3>
                  </div>
                </div>
                <hr>
                <div class="row">
                  <div class="col-md-6 mb-3">
                    <div class="d-flex align-items-start">
                      <i class="bi bi-cash me-2 text-success"></i>
                      <div>
                        <h6 class="text-muted mb-1">Total Repayment</h6>
                        <p class="mb-0 text-secondary">Amount you'll pay back over the term</p>
                      </div>
                    </div>
                    <h4 class="text-primary mt-2">{{ formatAmount(offer.total_repayment || calculateTotalRepayment) }}</h4>
                  </div>
                  <div class="col-md-6 mb-3">
                    <div class="d-flex align-items-start">
                      <i class="bi bi-percent me-2 text-warning"></i>
                      <div>
                        <h6 class="text-muted mb-1">Total Interest</h6>
                        <p class="mb-0 text-secondary">Total interest paid over the loan term</p>
                      </div>
                    </div>
                    <h4 class="text-danger mt-2">{{ formatAmount(offer.total_repayment ? (offer.total_repayment - offer.loan_amount) : (calculateTotalRepayment - offer.loan_amount)) }}</h4>
                  </div>
                </div>
                <!-- Progress bar for total payment breakdown -->
                <div class="mt-4">
                  <small class="text-muted">Payment Breakdown</small>
                  <div class="progress" style="height: 8px;">
                    <div
                      class="progress-bar bg-success"
                      role="progressbar"
                      :style="{ width: (offer.loan_amount / (offer.total_repayment || calculateTotalRepayment)) * 100 + '%' }"
                      :aria-valuenow="(offer.loan_amount / (offer.total_repayment || calculateTotalRepayment)) * 100"
                      aria-valuemin="0"
                      aria-valuemax="100"
                      title="Principal"
                    ></div>
                    <div
                      class="progress-bar bg-warning"
                      role="progressbar"
                      :style="{ width: ((offer.total_repayment || calculateTotalRepayment - offer.loan_amount) / (offer.total_repayment || calculateTotalRepayment)) * 100 + '%' }"
                      :aria-valuenow="((offer.total_repayment || calculateTotalRepayment - offer.loan_amount) / (offer.total_repayment || calculateTotalRepayment)) * 100"
                      aria-valuemin="0"
                      aria-valuemax="100"
                      title="Interest"
                    ></div>
                  </div>
                  <div class="d-flex justify-content-between mt-2 small">
                    <span><i class="bi bi-circle-fill text-success"></i> Principal: {{ formatAmount(offer.loan_amount) }}</span>
                    <span><i class="bi bi-circle-fill text-warning"></i> Interest: {{ formatAmount(offer.total_repayment ? (offer.total_repayment - offer.loan_amount) : (calculateTotalRepayment - offer.loan_amount)) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Terms & Conditions -->
        <div class="card shadow-sm mb-4">
          <div class="card-header bg-white">
            <h5 class="mb-0">Terms & Conditions</h5>
          </div>
          <div class="card-body">
            <ul class="list-unstyled">
              <li class="mb-3">
                <strong><i class="bi bi-check-circle-fill text-success"></i> Origination Fee: </strong>
                <p class="d-inline">{{ formatAmount(offer.origination_fee) }}</p>
              </li>
              <li class="mb-3">
                <strong><i class="bi bi-check-circle-fill text-success"></i> Status: </strong>
                <p class="d-inline">{{ offer.status }}</p>
              </li>
              <li class="mb-3">
                <strong><i class="bi bi-calendar-check-fill text-success"></i> Expiry Date: </strong>
                <p class="d-inline">{{ formatDate(offer.expiry_date) }}</p>
              </li>
              <li class="mb-3">
                <strong><i class="bi bi-exclamation-triangle-fill text-warning"></i> Lender Notes: </strong>
                <p class="d-inline">{{ offer.lender_notes || 'No notes' }}</p>
              </li>
            </ul>
          </div>
        </div>

        <!-- Offer Metadata -->
        <div class="card shadow-sm mb-4">
          <div class="card-header bg-white">
            <h5 class="mb-0">Offer Details</h5>
          </div>
          <div class="card-body">
            <div class="row g-3">
              <div class="col-md-6">
                <div>
                  <strong>Offer ID: </strong>
                  <p class="d-inline">{{ offer.id }}</p>
                </div>
              </div>
              <div class="col-md-6">
                <div>
                  <strong>Created: </strong>
                  <p class="d-inline">{{ formatDate(offer.created_at) }}</p>
                </div>
              </div>
              <div class="col-md-6">
                <div>
                  <strong>Expires: </strong>
                  <p class="d-inline">{{ formatDate(offer.expiry_date) }}</p>
                </div>
              </div>
              <div class="col-md-6">
                <div>
                  <strong>Last Updated: </strong>
                  <p class="d-inline">{{ formatDate(offer.updated_at) }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Sidebar -->
      <div class="col-md-4">
        <!-- Action Buttons -->
        <div class="card shadow-sm mb-4">
          <div class="card-body">
            <div class="d-grid gap-2">
              <button
                class="btn btn-primary btn-lg"
                :disabled="offer.status === 'expired'"
                @click="acceptOffer"
              >
                <i class="bi bi-check-circle me-2"></i>
                Accept Offer
              </button>
              <button
                class="btn btn-outline-danger btn-lg"
                @click="declineOffer"
              >
                <i class="bi bi-x-circle me-2"></i>
                Decline Offer
              </button>
              <button class="btn btn-outline-secondary btn-lg" @click="viewContract">
                <i class="bi bi-file-earmark-pdf me-2"></i>
                View Contract
              </button>
            </div>
          </div>
        </div>

        <!-- Share Options -->
        <div class="card shadow-sm">
          <div class="card-header bg-white">
            <h5 class="mb-0">Share Offer</h5>
          </div>
          <div class="card-body">
            <div class="d-grid gap-2">
              <button class="btn btn-outline-primary" @click="shareOffer('email')">
                <i class="bi bi-envelope me-2"></i>
                Email
              </button>
              <button class="btn btn-outline-info" @click="shareOffer('sms')">
                <i class="bi bi-whatsapp me-2"></i>
                SMS
              </button>
              <button class="btn btn-outline-secondary" @click="shareOffer('link')">
                <i class="bi bi-link-45deg me-2"></i>
                Copy Link
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div v-else class="text-center py-5">
    <div class="spinner-border text-primary" style="width: 3rem; height: 3rem;">
      <span class="visually-hidden">Loading...</span>
    </div>
    <p class="text-muted mt-3">Loading offer details...</p>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { api } from '@/api'

const route = useRoute()
const router = useRouter()

const offer = ref(null)

onMounted(() => {
  fetchOfferDetail()
})

const fetchOfferDetail = async () => {
  console.log('\n=== Fetching offer detail for ID:', route.params.id, '===')
  try {
    offer.value = await api.offers.getById(route.params.id)
    console.log('Offer data:', offer.value)
  } catch (err) {
    console.error('Error fetching offer:', err)
  }
}

const calculateMonthlyPayment = computed(() => {
  if (!offer.value || !offer.value.loan_amount || !offer.value.interest_rate || !offer.value.term_months) {
    return 0
  }
  const principal = offer.value.loan_amount
  const monthlyRate = (offer.value.interest_rate / 100) / 12
  const numPayments = offer.value.term_months
  
  if (monthlyRate === 0) {
    return principal / numPayments
  }
  
  // Monthly payment formula: P * r * (1 + r)^n / ((1 + r)^n - 1)
  const monthlyPayment = principal * monthlyRate * Math.pow(1 + monthlyRate, numPayments) / (Math.pow(1 + monthlyRate, numPayments) - 1)
  return Math.round(monthlyPayment)
})

const calculateTotalRepayment = computed(() => {
  if (!offer.value) return 0
  const monthlyPayment = offer.value.monthly_payment || calculateMonthlyPayment.value
  return monthlyPayment * offer.value.term_months
})

const formatAmount = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const statusBadgeClass = (status) => {
  const classes = {
    new: 'bg-success',
    accepted: 'bg-info',
    expired: 'bg-secondary',
    pending: 'bg-warning'
  }
  return classes[status] || 'bg-secondary'
}

const acceptOffer = () => {
  if (confirm('Are you sure you want to accept this offer?')) {
    api.offers.accept(offer.value.id)
      .then(() => router.push('/offers'))
      .catch(err => console.error('Accept error:', err))
  }
}

const declineOffer = () => {
  if (confirm('Are you sure you want to decline this offer?')) {
    api.offers.decline(offer.value.id, { reason: 'Not interested' })
      .then(() => router.push('/offers'))
      .catch(err => console.error('Decline error:', err))
  }
}

const viewContract = () => {
  // API call to generate/view contract
  alert('Contract generation coming soon!')
}

const shareOffer = (type) => {
  alert(`Share via {type} functionality coming soon!`)
}
</script>

<style scoped>
.card {
  border-radius: 10px;
}

.text-primary {
  font-weight: 600;
}

.badge.fs-6 {
  padding: 0.5em 1em;
}
</style>
