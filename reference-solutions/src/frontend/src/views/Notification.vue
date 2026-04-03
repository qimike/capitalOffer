<template>
  <div class="container-fluid py-5">
    <nav aria-label="breadcrumb" class="mb-4 mt-4">
      <ol class="breadcrumb">
        <li class="breadcrumb-item"><RouterLink to="/">Home</RouterLink></li>
        <li class="breadcrumb-item active" aria-current="page">Notifications</li>
      </ol>
    </nav>

    <div class="row">
      <div class="col-12">
        <h2 class="mb-4">
          <i class="bi bi-bell-fill me-2"></i>Notifications
          <span v-if="unreadCount > 0" class="badge bg-danger ms-2">{{ unreadCount }}</span>
        </h2>

        <!-- Loading State -->
        <div v-if="loading" class="text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
          <p class="mt-2 text-muted">Loading notifications...</p>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="alert alert-danger" role="alert">
          <i class="bi bi-exclamation-triangle-fill me-2"></i>
          {{ error }}
        </div>

        <!-- Empty State -->
        <div v-else-if="filteredNotifications.length === 0" class="alert alert-info text-center py-5">
          <i class="bi bi-bell-slash-fill display-4 d-block mb-3"></i>
          <h5>No Notifications</h5>
          <p class="mb-0">You don't have any notifications yet.</p>
        </div>

        <!-- Notifications List -->
        <div v-else-if="filteredNotifications.length > 0" class="card shadow-sm">
          <div class="card-header bg-primary text-white d-flex justify-content-between align-items-center p-3">
            <h5 class="mb-0 d-flex align-items-center">
              <i class="bi bi-bell-fill me-2"></i>
              <span>Notification List</span>
              <span v-if="unreadCount > 0" class="badge bg-white text-primary ms-2">{{ unreadCount }}</span>
            </h5>
            <div class="btn-group">
              <button
                class="btn btn-light btn-sm px-4 py-2 fw-semibold"
                @click="markAllAsRead"
                :disabled="unreadCount === 0"
                :style="{ opacity: unreadCount === 0 ? 0.5 : 1, cursor: unreadCount === 0 ? 'not-allowed' : 'pointer' }"
              >
                <i class="bi bi-check-all me-1"></i>
                Mark All
              </button>
              <button
                class="btn btn-outline-light btn-sm px-4 py-2 fw-semibold"
                :class="viewMode === 'unread' ? 'btn-warning text-dark' : ''"
                @click="viewMode = 'unread'"
              >
                <i class="bi bi-bell me-1"></i>Unread Only
              </button>
              <button
                class="btn btn-outline-light btn-sm px-4 py-2 fw-semibold"
                :class="viewMode === 'all' ? 'btn-warning text-dark' : ''"
                @click="viewMode = 'all'"
              >
                <i class="bi bi-infinity me-1"></i>All
              </button>
            </div>
          </div>

          <div class="card-body p-0">
            <ul class="list-group list-group-flush">
              <li
                v-for="notification in filteredNotifications"
                :key="notification.id"
                class="list-group-item"
                :class="{ 'bg-light': notification.is_unread }"
              >
                <div class="d-flex justify-content-between align-items-start">
                  <div class="flex-grow-1">
                    <div class="d-flex align-items-start">
                      <i
                        class="bi"
                        :class="notification.offer ? 'bi-building' : 'bi-bell'"
                        style="font-size: 1.2rem;"
                      ></i>
                      <div class="ms-3">
                        <p class="mb-2">{{ notification.message }}</p>
                        <small class="text-muted">
                          <i class="bi bi-clock me-1"></i>
                          {{ formatDateTime(notification.created_at) }}
                        </small>
                      </div>
                    </div>
                  </div>
                  <div class="ms-3">
                    <button
                      v-if="notification.is_unread"
                      class="btn btn-sm btn-outline-success"
                      @click="markAsRead(notification.id)"
                    >
                      <i class="bi bi-check-circle"></i>
                    </button>
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <!-- Empty State for Unread Filter -->
        <div v-else-if="filteredNotifications.length === 0 && viewMode === 'unread'" class="alert alert-info text-center py-5 border-0 bg-white">
          <i class="bi bi-check-circle-fill display-4 text-success d-block mb-3"></i>
          <h5 class="text-muted">All Caught Up!</h5>
          <p class="mb-0 text-muted">You've read all your notifications.</p>
        </div>

        <!-- Empty State for All Filter -->
        <div v-else-if="filteredNotifications.length === 0 && viewMode === 'all'" class="alert alert-info text-center py-5 border-0 bg-white">
          <i class="bi bi-bell-slash-fill display-4 text-muted d-block mb-3"></i>
          <h5 class="text-muted">No Notifications Yet</h5>
          <p class="mb-0 text-muted">You don't have any notifications at the moment.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { api } from '@/api'
import { useRouter } from 'vue-router'

const router = useRouter()

// Check authentication
const checkAuth = () => {
  return localStorage.getItem('isAuthenticated') === 'true'
}

// State
const notifications = ref([])
const loading = ref(false)
const error = ref(null)
const viewMode = ref('all')

// Computed properties
const unreadCount = computed(() => {
  return notifications.value.filter(n => n.is_unread).length
})

const filteredNotifications = computed(() => {
  if (viewMode.value === 'unread') {
    return notifications.value.filter(n => n.is_unread)
  }
  return notifications.value
})

// Helper functions
const formatDateTime = (dateTimeString) => {
  if (!dateTimeString) return 'Unknown time'
  const date = new Date(dateTimeString)
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  })
}

// API functions
const getNotifications = async () => {
  loading.value = true
  error.value = null

  try {
    const data = await api.notifications.getAll()
    
    if (data && data.results && Array.isArray(data.results)) {
      notifications.value = data.results
    } else if (Array.isArray(data)) {
      notifications.value = data
    } else {
      notifications.value = []
    }
  } catch (err) {
    console.error('Error fetching notifications:', err)
    error.value = 'Failed to load notifications. Please try again.'
  } finally {
    loading.value = false
  }
}

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

const markAllAsRead = async () => {
  try {
    await Promise.all(
      notifications.value.filter(n => n.is_unread).map(n => api.notifications.markAsRead(n.id))
    )
    notifications.value.forEach(n => {
      n.is_read = true
      n.is_unread = false
    })
  } catch (err) {
    console.error('Error marking all as read:', err)
  }
}

// Lifecycle hooks
onMounted(() => {
  if (!checkAuth()) {
    router.push('/login')
    return
  }
  getNotifications()
})

// Expose to template
defineExpose({
  notifications,
  loading,
  error,
  viewMode,
  unreadCount,
  filteredNotifications,
  formatDateTime,
  markAsRead,
  markAllAsRead
})
</script>

<style scoped>
.list-group-item {
  transition: background-color 0.2s ease;
}

.list-group-item:hover {
  background-color: #f8f9fa;
}

.list-group-item.bg-light {
  background-color: #e8f4fd !important;
}
</style>
