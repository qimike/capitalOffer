<template>
  <div>
    <h2 class="mb-4">
      <i class="bi bi-person-circle me-2"></i>My Profile
    </h2>

    <div class="row">
      <!-- Profile Card -->
      <div class="col-md-4 mb-4">
        <div class="card shadow-sm">
          <div class="card-body text-center">
            <div class="mb-3">
              <span class="avatar-circle">
                <i class="bi bi-person-fill display-4 text-white"></i>
              </span>
            </div>
            <h5 class="mb-0">{{ userName }}</h5>
            <p class="text-muted mb-3">{{ userEmail }}</p>
            <div class="badge bg-success">
              <i class="bi bi-check-circle me-1"></i>
              Active Account
            </div>
          </div>
        </div>
      </div>

      <!-- Profile Details -->
      <div class="col-md-8">
        <!-- Personal Information -->
        <div class="card shadow-sm mb-4">
          <div class="card-header bg-white">
            <h5 class="mb-0">Personal Information</h5>
          </div>
          <div class="card-body">
            <div class="row g-3">
              <div class="col-md-6">
                <strong>Full Name</strong>
                <p class="d-inline">{{ userName }}</p>
              </div>
              <div class="col-md-6">
                <strong>Email</strong>
                <p class="d-inline">{{ userEmail }}</p>
              </div>
              <div class="col-md-6">
                <strong>Phone</strong>
                <p class="d-inline">{{ profileData || 'Not provided' }}</p>
              </div>
              <div class="col-md-6">
                <strong>Date of Birth</strong>
                <p class="d-inline">{{ profileData || 'Not provided' }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Account Information -->
        <div class="card shadow-sm mb-4">
          <div class="card-header bg-white">
            <h5 class="mb-0">Account Information</h5>
          </div>
          <div class="card-body">
            <div class="row g-3">
              <div class="col-md-6">
                <strong>Account Type</strong>
                <p class="d-inline">Standard</p>
              </div>
              <div class="col-md-6">
                <strong>Account Status</strong>
                <span class="badge bg-success">
                  <i class="bi bi-check-circle me-1"></i>
                  Active
                </span>
              </div>
              <div class="col-md-6">
                <strong>Member Since</strong>
                <p class="d-inline">{{ formatDate('2024-01-01') }}</p>
              </div>
              <div class="col-md-6">
                <strong>Last Login</strong>
                <p class="d-inline">{{ formatDate(new Date().toISOString()) }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Security Settings -->
        <div class="card shadow-sm mb-4">
          <div class="card-header bg-white">
            <h5 class="mb-0">Security Settings</h5>
          </div>
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <div>
                <strong>Password</strong>
                <p class="text-muted mb-0">Last changed 30 days ago</p>
              </div>
              <router-link to="/profile/password" class="btn btn-sm btn-outline-primary">
                Change Password
              </router-link>
            </div>
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <strong>Two-Factor Authentication</strong>
                <p class="text-muted mb-0">Not enabled</p>
              </div>
              <button class="btn btn-sm btn-outline-secondary">
                Enable 2FA
              </button>
            </div>
          </div>
        </div>

        <!-- Account Activity -->
        <div class="card shadow-sm">
          <div class="card-header bg-white">
            <h5 class="mb-0">Account Activity</h5>
          </div>
          <div class="card-body">
            <div class="progress mb-3" style="height: 8px;">
              <div
                class="progress-bar bg-success"
                role="progressbar"
                style="width: 75%"
                aria-valuenow="75"
                aria-valuemin="0"
                aria-valuemax="100"
              ></div>
            </div>
            <small class="text-muted">Trust Score: 75/100</small>

            <hr>

            <div class="mb-3">
              <strong>Login History</strong>
              <ul class="list-unstyled mt-2">
                <li class="mb-2">
                  <i class="bi bi-device-ipad text-muted me-2"></i>
                  <span>MacBook Pro - Chrome</span>
                  <span class="text-muted ms-2">2 hours ago</span>
                </li>
                <li class="mb-2">
                  <i class="bi bi-phone text-muted me-2"></i>
                  <span>iPhone 15 - Safari</span>
                  <span class="text-muted ms-2">Yesterday</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const userId = ref(localStorage.getItem('userId'))
const userName = ref(localStorage.getItem('userName') || 'User')
const userEmail = ref('user@example.com')

const profileData = ref(null)

// Fetch profile data from API
onMounted(async () => {
  try {
    const response = await fetch('http://localhost:3000/api/users/profile/')
    const data = await response.json()
    
    if (data.name) {
      userName.value = data.name
    }
    if (data.email) {
      userEmail.value = data.email
    }
    profileData.value = data
  } catch (err) {
    console.error('Error fetching profile:', err)
  }
})

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}
</script>

<style scoped>
.card {
  border-radius: 10px;
}

.avatar-circle {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, #0d6efd, #0dcaf0);
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
</style>
