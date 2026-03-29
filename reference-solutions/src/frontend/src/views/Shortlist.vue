<template>
  <div class="shortlist-container" style="padding-top: 80px;">
    <!-- Header -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2>
        <i class="bi bi-heart me-2"></i>Shortlist
      </h2>
      <router-link to="/offers" class="btn btn-outline-primary">
        <i class="bi bi-arrow-left me-2"></i>Back to Offers
      </router-link>
    </div>

    <div class="row">
      <!-- Loading State -->
      <div v-if="loading" class="col-12 text-center py-5">
        <div class="spinner-border text-primary" role="status" style="width: 3rem; height: 3rem;">
          <span class="visually-hidden">Loading...</span>
        </div>
        <p class="text-muted mt-3">Loading shortlisted offers...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="col-12 text-center py-5">
        <div class="alert alert-danger" role="alert">
          <i class="bi bi-exclamation-circle me-2"></i>
          {{ error }}
        </div>
      </div>

      <!-- Empty State -->
      <div v-else-if="shortlistedOffers.length === 0" class="col-12 text-center py-5">
        <i class="bi bi-heart display-1 text-muted"></i>
        <p class="text-muted mt-3">No shortlisted offers yet</p>
        <p class="text-muted">Browse offers and click the bookmark icon to save them here</p>
        <router-link to="/offers" class="btn btn-primary">
          <i class="bi bi-wallet2 me-2"></i>Browse Offers
        </router-link>
      </div>

      <!-- Offers Grid -->
      <div v-else class="col-12">
        <p class="text-muted mb-4">
          Showing {{ shortlistedOffers.length }} shortlisted offer{{ shortlistedOffers.length > 1 ? 's' : '' }}
        </p>

        <div class="row">
          <div
            v-for="item in shortlistedOffers"
            :key="item.id"
            class="col-md-4 mb-4"
          >
            <div class="card h-100 shadow-sm">
              <div class="card-body">
                <div class="d-flex justify-content-between align-items-start mb-3">
                  <h5 class="card-title mb-0">{{ item.offer.lender.name }}</h5>
                  <button
                    class="btn btn-sm btn-outline-danger"
                    @click="removeFromShortlist(item.id)"
                  >
                    <i class="bi bi-bookmark-x"></i>
                  </button>
                </div>

                <div class="mb-3">
                  <h2 class="text-primary mb-1">${{ (item.offer.loan_amount / 1000).toFixed(0) }}k</h2>
                  <p class="text-muted mb-0">
                    {{ item.offer.term_months }} months @ {{ item.offer.interest_rate }}% APR
                  </p>
                </div>

                <div class="progress mb-2" style="height: 6px;">
                  <div
                    class="progress-bar"
                    role="progressbar"
                    :style="{ width: (item.offer.term_months / 60) * 100 + '%' }"
                  ></div>
                </div>
                <small class="text-muted">{{ item.offer.term_months }} months</small>

                <div class="mt-3">
                  <span
                    class="badge"
                    :class="statusBadgeClass(item.offer.status)"
                  >
                    {{ item.offer.status.toUpperCase() }}
                  </span>
                </div>
              </div>

              <div class="card-footer border-0 py-3">
                <div class="d-grid">
                  <router-link
                    :to="'/offers/' + item.offer.id"
                    class="btn btn-outline-primary"
                  >
                    View Details
                  </router-link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { api } from '@/api'

const shortlistedOffers = ref([])
const loading = ref(true)
const error = ref(null)

onMounted(async () => {
  fetchShortlistedOffers()
})

const fetchShortlistedOffers = async () => {
  loading.value = true
  error.value = null
  
  try {
    const data = await api.shortlist.getAll()
    console.log('\n=== Shortlist data ===')
    console.log('Raw data:', data)
    console.log('Type:', typeof data)
    console.log('Is Array:', Array.isArray(data))
    
    // Handle DRF pagination response format
    if (data && data.results && Array.isArray(data.results)) {
      console.log('Extracted from results:', data.results.length)
      shortlistedOffers.value = data.results
    } else if (Array.isArray(data)) {
      console.log('Data is array:', data.length)
      shortlistedOffers.value = data
    } else if (data && Array.isArray(data.items)) {
      console.log('Extracted from items:', data.items.length)
      shortlistedOffers.value = data.items
    } else if (data && typeof data === 'object') {
      console.log('Data is object:', data)
      shortlistedOffers.value = []
    } else {
      console.log('Data is empty or invalid')
      shortlistedOffers.value = []
    }
  } catch (err) {
    console.error('\n=== Error fetching shortlist ===')
    console.error('Error:', err)
    console.error('Error details:', err.details)
    console.error('Error message:', err.message)
    error.value = 'Failed to load shortlisted offers. Please try again.'
  } finally {
    loading.value = false
  }
}

const removeFromShortlist = async (itemId) => {
  if (!confirm('Remove this offer from your shortlist?')) {
    return
  }

  try {
    await api.shortlist.remove(itemId)
    
    // Remove from local state
    shortlistedOffers.value = shortlistedOffers.value.filter(
      item => item.id !== itemId
    )
    
    // Show success message
    console.log('Offer removed from shortlist')
  } catch (err) {
    console.error('Error removing from shortlist:', err)
    alert('Failed to remove offer from shortlist. Please try again.')
  }
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
</script>

<style scoped>
.card {
  border-radius: 10px;
  transition: transform 0.2s, box-shadow 0.2s;
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important;
}

.badge {
  font-weight: 500;
}
</style>
