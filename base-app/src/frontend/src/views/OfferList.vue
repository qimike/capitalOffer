<template>
  <div class="offers-container" style="padding-top: 80px;">
    <!-- Header -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2><i class="bi bi-wallet2 me-2"></i>My Offers</h2>
      <div class="input-group w-25">
        <input
          type="text"
          class="form-control"
          placeholder="Search offers..."
          v-model="searchQuery"
        />
      </div>
    </div>

    <!-- Filters -->
    <div class="card mb-4">
      <div class="card-body">
        <div class="row g-3">
          <div class="col-md-3">
            <select class="form-select" v-model="filterStatus">
              <option value="">All Status</option>
              <option value="new">New</option>
              <option value="accepted">Accepted</option>
              <option value="expired">Expired</option>
              <option value="pending">Pending</option>
            </select>
          </div>
          <div class="col-md-3">
            <select class="form-select" v-model="sortBy">
              <option value="amount_desc">Amount: High to Low</option>
              <option value="amount_asc">Amount: Low to High</option>
              <option value="rate_asc">Interest Rate: Low to High</option>
              <option value="rate_desc">Interest Rate: High to Low</option>
              <option value="expiry_asc">Expiry: Soonest</option>
              <option value="expiry_desc">Expiry: Latest</option>
            </select>
          </div>
          <div class="col-md-3 d-flex align-items-end">
            <button class="btn btn-outline-secondary me-2" @click="resetFilters">
              <i class="bi bi-x-circle"></i> Clear
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status" style="width: 3rem; height: 3rem;">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="text-muted mt-3">Loading offers...</p>
    </div>

    <!-- Offers Grid -->
    <div v-else class="row">
      <div v-if="offers.length === 0" class="col-12 text-center py-5">
        <i class="bi bi-inbox display-1 text-muted"></i>
        <p class="text-muted mt-3">No offers found</p>
        <p v-if="hasFilters">Try adjusting your filters</p>
      </div>

      <div
        v-for="offer in offers"
        :key="offer.id"
        class="col-md-4 mb-4"
      >
        <div class="card h-100 shadow-sm">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-start mb-3">
              <h5 class="card-title mb-0">{{ offer.lender.name }}</h5>
              <span
                class="badge"
                :class="statusBadgeClass(offer.status)"
              >
                {{ offer.status }}
              </span>
            </div>

            <div class="mb-3">
              <h2 class="text-primary mb-1">${{ (offer.amount / 1000).toFixed(1) }}k</h2>
              <p class="text-muted mb-0">
                {{ offer.term }} months @ {{ offer.rate }}% APR
              </p>
            </div>

            <div class="progress mb-2" style="height: 6px;">
              <div
                class="progress-bar"
                role="progressbar"
                :style="{ width: (offer.term / 60) * 100 + '%' }"
              ></div>
            </div>
            <small class="text-muted">{{ offer.term }} months</small>
          </div>

          <div class="card-footer border-0 py-3">
            <div class="d-grid gap-2">
              <router-link
                :to="'/offers/' + offer.id"
                class="btn btn-outline-primary btn-sm"
              >
                View Details
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="!loading && offers.length > 0" class="d-flex justify-content-center mt-4">
      <nav>
        <ul class="pagination">
          <li class="page-item" :class="{ disabled: currentPage === 1 }">
            <a class="page-link" href="#" @click.prevent="currentPage--">Previous</a>
          </li>
          <li
            v-for="page in totalPages"
            :key="page"
            class="page-item"
            :class="{ active: page === currentPage }"
          >
            <a class="page-link" href="#" @click.prevent="currentPage = page">{{ page }}</a>
          </li>
          <li class="page-item" :class="{ disabled: currentPage === totalPages }">
            <a class="page-link" href="#" @click.prevent="currentPage++">Next</a>
          </li>
        </ul>
      </nav>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'

const offers = ref([])
const loading = ref(true)
const searchQuery = ref('')
const filterStatus = ref('')
const sortBy = ref('amount_desc')
const currentPage = ref(1)
const limit = ref(10)

const totalPages = computed(() => {
  return Math.ceil(offers.value.length / limit.value)
})

const hasFilters = computed(() => {
  return filterStatus.value !== '' || searchQuery.value !== ''
})

onMounted(() => {
  fetchOffers()
})

const fetchOffers = async () => {
  loading.value = true
  try {
    const params = new URLSearchParams({
      page: currentPage.value,
      limit: limit.value,
      status: filterStatus.value || '',
      sort: sortBy.value,
      search: searchQuery.value || ''
    })

    const response = await fetch(`http://localhost:3000/api/offers/?${params}`)
    const data = await response.json()
    
    if (data.offers) {
      offers.value = data.offers
    }
  } catch (err) {
    console.error('Error fetching offers:', err)
  } finally {
    loading.value = false
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

const resetFilters = () => {
  filterStatus.value = ''
  sortBy.value = 'amount_desc'
  searchQuery.value = ''
  currentPage.value = 1
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

.page-link {
  color: #0d6efd;
}

.page-item.active .page-link {
  background-color: #0d6efd;
  border-color: #0d6efd;
}
</style>
