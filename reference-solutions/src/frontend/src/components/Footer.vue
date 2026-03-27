<template>
  <footer class="bg-dark text-light py-4 mt-auto">
    <div class="container">
      <div class="row">
        <!-- Brand Column -->
        <div class="col-md-4 mb-3">
          <div class="d-flex align-items-center mb-3">
            <i class="bi bi-wallet2 me-2 fs-4"></i>
            <span class="fw-bold">capitalOffer</span>
          </div>
          <p class="small text-muted mb-2">
            Find the best loan offers tailored to your needs. Compare lenders, rates, and terms in one place.
          </p>
        </div>

        <!-- Quick Links -->
        <div class="col-md-2 mb-3">
          <h6 class="text-uppercase fw-bold mb-3">Quick Links</h6>
          <ul class="list-unstyled">
            <li class="mb-2">
              <RouterLink to="/offers" class="text-muted text-decoration-none">
                Find Offers
              </RouterLink>
            </li>
            <li class="mb-2">
              <RouterLink to="/profile" class="text-muted text-decoration-none">
                My Profile
              </RouterLink>
            </li>
            <li class="mb-2">
              <a href="#" class="text-muted text-decoration-none">About Us</a>
            </li>
          </ul>
        </div>

        <!-- Resources -->
        <div class="col-md-2 mb-3">
          <h6 class="text-uppercase fw-bold mb-3">Resources</h6>
          <ul class="list-unstyled">
            <li class="mb-2">
              <a href="#" class="text-muted text-decoration-none">Help Center</a>
            </li>
            <li class="mb-2">
              <a href="#" class="text-muted text-decoration-none">Contact Support</a>
            </li>
            <li class="mb-2">
              <a href="#" class="text-muted text-decoration-none">FAQs</a>
            </li>
          </ul>
        </div>

        <!-- Legal -->
        <div class="col-md-4 mb-3">
          <h6 class="text-uppercase fw-bold mb-3">Legal</h6>
          <div class="small text-muted">
            <p class="mb-2">
              All loan offers, rates, and terms are provided for informational purposes only. 
              Actual rates may vary based on your credit profile and financial situation.
            </p>
            <p class="mb-2">
              capitalOffer is not a lender. We connect you with potential lenders who may 
              offer you a loan.
            </p>
            <p>© {{ currentYear }} capitalOffer. All rights reserved.</p>
          </div>
        </div>
      </div>

      <!-- Bottom Bar -->
      <div class="border-top border-secondary pt-3 mt-3">
        <div class="row">
          <div class="col-md-6">
            <div class="small text-muted">
              <RouterLink to="/terms" class="text-muted text-decoration-none me-3">Terms of Service</RouterLink>
              <RouterLink to="/privacy" class="text-muted text-decoration-none">Privacy Policy</RouterLink>
            </div>
          </div>
          <div class="col-md-6 text-md-end">
            <a href="#" class="text-muted me-3">
              <i class="bi bi-facebook"></i>
            </a>
            <a href="#" class="text-muted me-3">
              <i class="bi bi-twitter"></i>
            </a>
            <a href="#" class="text-muted">
              <i class="bi bi-linkedin"></i>
            </a>
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { computed } from 'vue'

const currentYear = computed(() => {
  return new Date().getFullYear()
})
</script>

<style scoped>
footer a {
  transition: color 0.2s;
}

footer a:hover {
  color: #0dcaf0 !important;
}

.navbar-brand {
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
</style>
