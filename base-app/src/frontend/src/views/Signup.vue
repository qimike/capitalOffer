<template>
  <div class="container mt-5">
    <div class="row justify-content-center">
      <div class="col-md-6 col-lg-5">
        <div class="card shadow">
          <div class="card-body p-5">
            <h3 class="text-center mb-4">
              <i class="bi bi-person-plus me-2"></i>Sign Up
            </h3>
            
            <form @submit.prevent="handleSignup" novalidate>
              <div class="mb-3">
                <label for="name" class="form-label">Full Name</label>
                <div class="input-group">
                  <span class="input-group-text">
                    <i class="bi bi-person"></i>
                  </span>
                  <input
                    type="text"
                    class="form-control"
                    id="name"
                    v-model="name"
                    placeholder="John Doe"
                    required
                    minlength="2"
                    maxlength="50"
                  />
                </div>
                <div class="invalid-feedback" v-if="errors.name">
                  {{ errors.name }}
                </div>
              </div>

              <div class="mb-3">
                <label for="email" class="form-label">Email address</label>
                <div class="input-group">
                  <span class="input-group-text">
                    <i class="bi bi-envelope"></i>
                  </span>
                  <input
                    type="email"
                    class="form-control"
                    id="email"
                    v-model="email"
                    placeholder="name@example.com"
                    required
                  />
                </div>
                <div class="invalid-feedback" v-if="errors.email">
                  Please enter a valid email address
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
                    minlength="8"
                  />
                </div>
                <div class="invalid-feedback" v-if="errors.password">
                  Password must be at least 8 characters
                </div>
              </div>

              <div class="mb-3">
                <label class="form-label d-block">Password Strength</label>
                <div class="progress" style="height: 6px;">
                  <div
                    class="progress-bar"
                    :class="passwordStrengthClass"
                    :style="{ width: passwordStrength + '%' }"
                  ></div>
                </div>
              </div>

              <div class="mb-3">
                <label for="confirmPassword" class="form-label">Confirm Password</label>
                <div class="input-group">
                  <span class="input-group-text">
                    <i class="bi bi-lock-fill"></i>
                  </span>
                  <input
                    type="password"
                    class="form-control"
                    id="confirmPassword"
                    v-model="confirmPassword"
                    required
                  />
                </div>
                <div class="invalid-feedback" v-if="errors.confirmPassword">
                  Passwords do not match
                </div>
              </div>

              <div class="mb-3 form-check">
                <input
                  type="checkbox"
                  class="form-check-input"
                  id="terms"
                  v-model="termsAccepted"
                  required
                />
                <label class="form-check-label" for="terms">
                  I accept the <router-link to="/terms">Terms and Conditions</router-link>
                </label>
                <div class="invalid-feedback" v-if="errors.terms">
                  You must accept the terms and conditions
                </div>
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
                  {{ loading ? 'Creating Account...' : 'Sign Up' }}
                </button>
              </div>
            </form>

            <div class="text-center mt-4">
              <p>Already have an account?</p>
              <router-link to="/login" class="btn btn-outline-primary">
                Login
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const name = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const termsAccepted = ref(false)
const loading = ref(false)
const error = ref('')
const errors = ref({})

const passwordStrength = computed(() => {
  let strength = 0
  if (password.value.length >= 8) strength += 25
  if (password.value.length >= 12) strength += 25
  if (/[a-z]/.test(password.value) && /[A-Z]/.test(password.value)) strength += 25
  if (/\d/.test(password.value) && /[^a-zA-Z0-9]/.test(password.value)) strength += 25
  return strength
})

const passwordStrengthClass = computed(() => {
  if (passwordStrength.value < 25) return 'bg-danger'
  if (passwordStrength.value < 50) return 'bg-warning'
  if (passwordStrength.value < 75) return 'bg-info'
  return 'bg-success'
})

const handleSignup = async () => {
  error.value = ''
  errors.value = {}

  // Validation
  if (!name.value.trim()) {
    errors.value.name = 'Name is required'
  }
  if (!email.value || !/\S+@\S+\.\S+/.test(email.value)) {
    errors.value.email = 'Please enter a valid email address'
  }
  if (!password.value || password.value.length < 8) {
    errors.value.password = 'Password must be at least 8 characters'
  }
  if (password.value !== confirmPassword.value) {
    errors.value.confirmPassword = 'Passwords do not match'
  }
  if (!termsAccepted.value) {
    errors.value.terms = 'You must accept the terms'
  }

  if (Object.keys(errors.value).length > 0) {
    return
  }

  loading.value = true

  try {
    const response = await fetch('http://localhost:3000/api/signup/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: name.value.trim(),
        email: email.value,
        password: password.value
      })
    })

    const data = await response.json()

    if (response.ok) {
      // Redirect to login page
      router.push('/login')
    } else {
      error.value = data.error || 'Signup failed. Please try again.'
    }
  } catch (err) {
    error.value = 'An error occurred. Please try again.'
    console.error('Signup error:', err)
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
