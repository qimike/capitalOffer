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
                  <span class="text-success">{{ offer.lender.rating }}/5.0</span>
                  <span class="text-muted ms-2">({{ offer.lender.reviews }} reviews)</span>
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
                <h3 class="text-primary mb-0">${{ formatAmount(offer.amount) }}</h3>
              </div>
              <div class="col-6">
                <h6 class="text-muted">Interest Rate (APR)</h6>
                <h3 class="text-success mb-0">{{ offer.rate }}%</h3>
              </div>
              <div class="col-6">
                <h6 class="text-muted">Loan Term</h6>
                <h3 class="mb-0">{{ offer.term }} months</h3>
              </div>
              <div class="col-6">
                <h6 class="text-muted">Monthly Payment</h6>
                <h3 class="mb-0">${{ formatAmount(offer.monthlyPayment) }}</h3>
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
                <strong><i class="bi bi-check-circle-fill text-success"></i> Early Repayment:</strong>
                <p class="d-inline">{{ offer.terms.earlyRepayment }}</p>
              </li>
              <li class="mb-3">
                <strong><i class="bi bi-check-circle-fill text-success"></i> Prepayment Penalties:</strong>
                <p class="d-inline">{{ offer.terms.prepaymentPenalty }}</p>
              </li>
              <li class="mb-3">
                <strong><i class="bi bi-check-circle-fill text-success"></i> Grace Period:</strong>
                <p class="d-inline">{{ offer.terms.gracePeriod }}</p>
              </li>
              <li class="mb-3">
                <strong><i class="bi bi-exclamation-triangle-fill text-warning"></i> Late Payment:</strong>
                <p class="d-inline">{{ offer.terms.lateFee }}</p>
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
                  <strong>Offer ID:</strong>
                  <p class="d-inline">{{ offer.id }}</p>
                </div>
              </div>
              <div class="col-md-6">
                <div>
                  <strong>Created:</strong>
                  <p class="d-inline">{{ formatDate(offer.createdAt) }}</p>
                </div>
              </div>
              <div class="col-md-6">
                <div>
                  <strong>Expires:</strong>
                  <p class="d-inline">{{ formatDate(offer.expiryDate) }}</p>
                </div>
              </div>
              <div class="col-md-6">
                <div>
                  <strong>Last Updated:</strong>
                  <p class="d-inline">{{ formatDate(offer.updatedAt) }}</p>
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
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { api } from '@/api'

const route = useRoute()
const router = useRouter()

const offer = ref(null)

onMounted(() => {
  fetchOfferDetail()
})

const fetchOfferDetail = async () => {
  try {
    offer.value = await api.offers.getById(route.params.id)
  } catch (err) {
    console.error('Error fetching offer:', err)
  }
}

const formatAmount = (amount) => {
  return (amount / 100).toFixed(0)
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
  alert(`Share via ${type} functionality coming soon!`)
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
