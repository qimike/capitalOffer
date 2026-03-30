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

        <!-- Terms & Conditions -->
        <div class="card shadow-sm mb-4">
          <div class="card-header bg-white">
            <h5 class="mb-0">Terms & Conditions</h5>
          </div>
          <div class="card-body">
            <ul class="list-unstyled">
              <!-- Eligibility Label -->
              <li class="mb-3">
                <strong><i class="bi bi-heart-fill text-danger"></i> Eligibility:</strong>
                <span
                  class="badge ms-2"
                  :class="eligibilityBadgeClass(offer.eligibility_label)"
                >
                  {{ offer.eligibility_label || 'Loading...' }}
                </span>
              </li>
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
                :disabled="offer.status === 'expired' || offer.status === 'accepted' || offer.status === 'declined'"
                @click="acceptOffer"
              >
                <i class="bi bi-check-circle me-2"></i>
                Accept Offer
              </button>
              <button
                class="btn btn-outline-danger btn-lg"
                :disabled="offer.status === 'expired' || offer.status === 'accepted' || offer.status === 'declined'"
                @click="showDeclineModal"
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

        <!-- Action Status Alert -->
        <div v-if="offer.status === 'accepted'" class="alert alert-success alert-dismissible fade show mb-4" role="alert">
          <i class="bi bi-check-circle me-2"></i>
          <strong>Offer Accepted!</strong> Congratulations!
          <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>

        <div v-if="offer.status === 'declined'" class="alert alert-danger alert-dismissible fade show mb-4" role="alert">
          <i class="bi bi-x-circle me-2"></i>
          <strong>Offer Declined!</strong> Your decision has been recorded.
          <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
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

    <!-- Decline Modal -->
    <div v-if="showDeclineReasonModal" class="modal d-block" style="background: rgba(0,0,0,0.5);">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Decline Offer</h5>
            <button type="button" class="btn-close" @click="closeDeclineModal"></button>
          </div>
          <div class="modal-body">
            <div class="mb-3">
              <label for="declineReason" class="form-label">Reason for declining (optional):</label>
              <textarea
                id="declineReason"
                class="form-control"
                rows="3"
                v-model="declineReason"
                placeholder="Enter your reason..."
              ></textarea>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="closeDeclineModal">Cancel</button>
            <button type="button" class="btn btn-danger" @click="confirmDecline">Decline</button>
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
const showDeclineReasonModal = ref(false)
const declineReason = ref('')

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

const eligibilityBadgeClass = (label) => {
  if (label === 'Good Fit') {
    return 'bg-success'
  } else if (label === 'Possible') {
    return 'bg-warning text-dark'
  } else if (label === 'Unlikely') {
    return 'bg-secondary'
  }
  return 'bg-secondary'
}

const closeDeclineModal = () => {
  showDeclineReasonModal.value = false
  declineReason.value = ''
}

const showDeclineModal = () => {
  showDeclineReasonModal.value = true
}

const acceptOffer = async () => {
  if (confirm('Are you sure you want to accept this offer?')) {
    try {
      await api.offers.accept(offer.value.id)
      
      // Refresh the offer data
      await fetchOfferDetail()
      
      // Update local state
      if (offer.value) {
        offer.value.status = 'accepted'
      }
      
      alert('Offer accepted successfully!')
      setTimeout(() => {
        router.push('/offers')
      }, 1000)
    } catch (err) {
      console.error('Accept error:', err)
      alert('Failed to accept offer. Please try again.')
    }
  }
}

const confirmDecline = async () => {
  try {
    await api.offers.decline(offer.value.id, { reason: declineReason.value || 'Not specified' })
    
    // Refresh the offer data
    await fetchOfferDetail()
    
    // Update local state
    if (offer.value) {
      offer.value.status = 'declined'
    }
    
    showDeclineReasonModal.value = false
    alert('Offer declined successfully!')
    setTimeout(() => {
      router.push('/offers')
    }, 1000)
  } catch (err) {
    console.error('Decline error:', err)
    alert('Failed to decline offer. Please try again.')
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
