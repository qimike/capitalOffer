<template>
  <nav class="navbar navbar-expand-lg navbar-dark bg-primary fixed-top shadow">
    <div class="container">
      <!-- Logo -->
      <RouterLink to="/offers" class="navbar-brand d-flex align-items-center">
        <i class="bi bi-wallet2 me-2"></i>
        <span class="fw-bold">Capital Offer</span>
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
            
            <!-- Notification Bell -->
            <li class="nav-item dropdown">
              <a
                class="nav-link dropdown-toggle position-relative"
                href="#"
                id="notificationDropdown"
                role="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                <div class="position-relative d-inline">
                  <i class="bi bi-bell-fill"></i>
                  <span
                    v-if="unreadCount > 0"
                    class="position-absolute top-0 start-100 translate-middle badge rounded-circle bg-danger border border-2 border-primary"
                    style="width: 18px; height: 18px; font-size: 10px; display: flex; align-items: center; justify-content: center;"
                  >
                    {{ unreadCount }}
                  </span>
                </div>
              </a>
              <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="notificationDropdown" style="min-width: 350px; max-height: 450px; overflow-y: auto;">
                <li class="px-4 py-3 border-bottom bg-light">
                  <div class="d-flex justify-content-between align-items-center">
                    <h6 class="mb-0 text-primary">
                      <i class="bi bi-bell-fill me-2"></i>Notifications
                    </h6>
                    <span v-if="unreadCount > 0" class="badge bg-primary rounded-pill">{{ unreadCount }} unread</span>
                  </div>
                </li>
                <li v-if="notifications.length === 0" class="px-4 py-5 text-center">
                  <i class="bi bi-bell-slash-fill display-5 text-muted"></i>
                  <p class="mb-0 mt-3 text-muted">No notifications</p>
                  <small class="text-muted">Check back later for updates!</small>
                </li>
                <li v-else-if="notifications.length > 0">
                  <a
                    v-for="notification in notifications.slice(0, 5)"
                    :key="notification.id"
                    class="dropdown-item"
                    :class="{ 'bg-light': notification.is_unread }"
                    @click.prevent="navigateToNotification(notification)"
                  >
                    <div class="d-flex justify-content-between align-items-center">
                      <span>{{ notification.message }}</span>
                      <span v-if="notification.is_unread" class="badge bg-primary rounded-pill">New</span>
                    </div>
                    <small class="text-muted d-block mt-1">{{ formatDate(notification.created_at) }}</small>
                  </a>
                </li>
                <li v-if="notifications.length > 0" class="border-top">
                  <RouterLink to="/notifications" class="dropdown-item text-center fw-semibold">
                    <i class="bi bi-arrow-right-circle me-2"></i>View All Notifications
                  </RouterLink>
                </li>
                <li v-if="unreadCount > 0 && notifications.length > 0" class="border-top">
                  <button class="dropdown-item text-center fw-semibold" @click.prevent="markAllAsRead">
                    <i class="bi bi-check-all me-2"></i>Mark All as Read
                  </button>
                </li>
              </ul>
            </li>

            <!-- User Dropdown -->
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
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { api } from '@/api'

const router = useRouter()
const route = useRoute()
const isAuthenticated = ref(false)
const userName = ref('')
const notifications = ref([])

// Function to update auth state
const updateAuthState = () => {
  isAuthenticated.value = localStorage.getItem('isAuthenticated') === 'true'
  userName.value = localStorage.getItem('userName') || 'User'
}

// Calculate unread count
const unreadCount = computed(() => {
  return notifications.value.filter(n => n.is_unread).length
})

// Fetch notifications
const fetchNotifications = async () => {
  try {
    const data = await api.notifications.getAll()
    console.log('API response:', data)
    
    // Handle paginated response (DRF) or direct array
    let notificationsData = []
    if (Array.isArray(data)) {
      notificationsData = data
    } else if (data && data.results && Array.isArray(data.results)) {
      notificationsData = data.results
    } else if (data && data.items && Array.isArray(data.items)) {
      notificationsData = data.items
    } else {
      notificationsData = []
    }
    
    notifications.value = notificationsData
    console.log('Notifications loaded:', notificationsData.length, notificationsData)
  } catch (err) {
    console.error('Error fetching notifications:', err)
    notifications.value = []
  }
}

// Format date
const formatDate = (dateTimeString) => {
  if (!dateTimeString) return ''
  const date = new Date(dateTimeString)
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  })
}

// Navigate to notification page
const navigateToNotification = (notification) => {
  if (notification.is_unread) {
    markAsRead(notification.id)
  }
  router.push('/notifications')
}

// Mark notification as read
const markAsRead = async (id) => {
  try {
    await api.notifications.markAsRead(id)
    const index = notifications.value.findIndex(n => n.id === id)
    if (index !== -1) {
      notifications.value[index].is_read = true
      notifications.value[index].is_unread = false
    }
  } catch (err) {
    console.error('Error marking notification as read:', err)
  }
}

// Mark all as read
const markAllAsRead = async () => {
  try {
    for (const notification of notifications.value) {
      await markAsRead(notification.id)
    }
  } catch (err) {
    console.error('Error marking all as read:', err)
  }
}

onMounted(() => {
  // Initial state check
  updateAuthState()
  
  // Fetch notifications
  fetchNotifications()
  
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
  localStorage.removeItem('refreshToken')
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
