<template>
  <nav class="navbar navbar-expand-lg navbar-dark bg-primary fixed-top shadow">
    <div class="container">
      <!-- Logo -->
      <RouterLink to="/offers" class="navbar-brand d-flex align-items-center">
        <i class="bi bi-wallet2 me-2"></i>
        <span class="fw-bold">capitalOffer</span>
      </RouterLink>

      <!-- Mobile Toggle -->
      <button
        class="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navbarNav"
        aria-controls="navbarNav"
        aria-expanded="false"
        aria-label="Toggle navigation"
      >
        <span class="navbar-toggler-icon"></span>
      </button>

      <!-- Navbar Content -->
      <div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav ms-auto align-items-center">
          <!-- Navigation Links for authenticated users -->
          <template v-if="isAuthenticated">
            <li class="nav-item">
              <RouterLink to="/offers" class="nav-link">
                <i class="bi bi-wallet2 me-1"></i>Offers
              </RouterLink>
            </li>
            <li class="nav-item">
              <RouterLink to="/offers?tab=shortlist" class="nav-link">
                <i class="bi bi-heart me-1"></i>Shortlist
              </RouterLink>
            </li>
            <li class="nav-item dropdown">
              <a
                class="nav-link dropdown-toggle"
                href="#"
                id="userDropdown"
                role="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                <i class="bi bi-person-circle me-1"></i>
                {{ userName }}
              </a>
              <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
                <li>
                  <RouterLink to="/profile" class="dropdown-item">
                    <i class="bi bi-person me-2"></i>Profile
                  </RouterLink>
                </li>
                <li><hr class="dropdown-divider"></li>
                <li>
                  <a href="#" class="dropdown-item" @click.prevent="logout">
                    <i class="bi bi-box-arrow-right me-2"></i>Logout
                  </a>
                </li>
              </ul>
            </li>
          </template>

          <!-- Guest Links -->
          <template v-else>
            <li class="nav-item">
              <RouterLink to="/login" class="nav-link">
                <i class="bi bi-box-arrow-in-right me-1"></i>Login
              </RouterLink>
            </li>
            <li class="nav-item">
              <RouterLink to="/signup" class="btn btn-light btn-sm text-primary">
                <i class="bi bi-person-plus me-1"></i>Sign Up
              </RouterLink>
            </li>
          </template>
        </ul>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()
const isAuthenticated = ref(false)
const userName = ref('')

// Function to update auth state
const updateAuthState = () => {
  isAuthenticated.value = localStorage.getItem('isAuthenticated') === 'true'
  userName.value = localStorage.getItem('userName') || 'User'
}

onMounted(() => {
  // Initial state check
  updateAuthState()
  
  // Listen for auth changes
  const handleStateChange = () => {
    updateAuthState()
  }
  
  // Listen for storage events (when localStorage changes in another tab/window)
  window.addEventListener('storage', handleStateChange)
  
  // Listen for route changes to refresh auth state
  router.afterEach(() => {
    updateAuthState()
  })
})

onUnmounted(() => {
  // Clean up
})

const logout = () => {
  // Clear authentication data
  localStorage.removeItem('authToken')
  localStorage.removeItem('isAuthenticated')
  localStorage.removeItem('userId')
  localStorage.removeItem('userName')

  // Immediately update UI state
  updateAuthState()

  // Redirect to login
  router.push('/login')
}
</script>

<style scoped>
.navbar-brand {
  font-size: 1.3rem;
}

.nav-link {
  position: relative;
  margin: 0 0.5rem;
}

.nav-link.active {
  color: #ffc107 !important;
}

.dropdown-item:hover {
  background-color: #0d6efd;
  color: white;
}
</style>
