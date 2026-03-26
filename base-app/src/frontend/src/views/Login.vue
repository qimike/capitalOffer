<template>
  <div class="auth-container" style="padding-top: 80px;">
    <div class="container mt-2">
      <div class="row justify-content-center">
        <div class="col-md-6 col-lg-4">
          <div class="card shadow">
            <div class="card-body p-5">
              <h3 class="text-center mb-4">
                <i class="bi bi-wallet2 me-2"></i>Capital Offer
              </h3>
              
              <form @submit.prevent="handleLogin" novalidate>
                <div class="mb-3">
                  <label for="username" class="form-label">Username</label>
                  <div class="input-group">
                    <span class="input-group-text">
                      <i class="bi bi-person"></i>
                    </span>
                    <input
                      type="text"
                      class="form-control"
                      id="username"
                      v-model="username"
                      placeholder="Enter your username"
                      required
                    />
                  </div>
                  <div class="invalid-feedback" v-if="errors.username">
                    Username is required
                  </div>
                </div>

                <div class="mb-3">
                  <label for="password" class="form-label">Password</label>
                  <div class="input-group">
                    <span class="input-group-text">
                      <i class="bi bi-lock"></i>
                    </span>
                    <input
                      type="password"
                      class="form-control"
                      id="password"
                      v-model="password"
                      required
                    />
                  </div>
                  <div class="invalid-feedback" v-if="errors.password">
                    Password is required
                  </div>
                </div>

                <div class="mb-3 form-check">
                  <input
                    type="checkbox"
                    class="form-check-input"
                    id="rememberMe"
                    v-model="rememberMe"
                  />
                  <label class="form-check-label" for="rememberMe">
                    Remember me
                  </label>
                </div>

                <div v-if="error" class="alert alert-danger alert-dismissible fade show" role="alert">
                  {{ error }}
                  <button type="button" class="btn-close" @click="error = ''"></button>
                </div>

                <div class="d-grid gap-2">
                  <button
                    type="submit"
                    class="btn btn-primary btn-lg"
                    :disabled="loading"
                  >
                    <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
                    {{ loading ? 'Logging in...' : 'Login' }}
                  </button>
                </div>
              </form>

              <div class="text-center mt-4">
                <p>New to capitalOffer?</p>
                <router-link to="/signup" class="btn btn-outline-primary">
                  Create Account
                </router-link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { api } from '@/api'

const router = useRouter()
const route = useRoute()

const username = ref('')
const password = ref('')
const rememberMe = ref(false)
const loading = ref(false)
const error = ref('')
const errors = ref({})

const handleLogin = async () => {
  error.value = ''
  errors.value = {}

  // Validation
  if (!username.value) {
    errors.value.username = 'Username is required'
  }
  if (!password.value) {
    errors.value.password = 'Password is required'
  }

  if (Object.keys(errors.value).length > 0) {
    return
  }

  loading.value = true

  try {
    const data = await api.auth.login({
      username: username.value,
      password: password.value
    })

    if (data.token) {
      // Save authentication token
      localStorage.setItem('authToken', data.token)
      localStorage.setItem('isAuthenticated', 'true')
      localStorage.setItem('userId', data.user.id)
      // Store username directly for display
      localStorage.setItem('userName', data.user.username)

      // Redirect to intended page or offers
      const redirect = route.query.redirect || '/offers'
      router.push(redirect)
    } else {
      error.value = data.error || 'Login failed. Please try again.'
    }
  } catch (err) {
    error.value = err.details?.error || err.message || 'Login failed. Please try again.'
    console.error('Login error:', err)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.card {
  border-radius: 10px;
}

.form-control:invalid {
  border-color: #dc3545;
}

.form-control:valid {
  border-color: #198754;
}
</style>
