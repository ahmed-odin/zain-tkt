<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
    <div class="w-full max-w-md">
      <!-- Logo/Header -->
      <div class="text-center mb-8">
        <div class="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-lg mb-4">
          <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
          </svg>
        </div>
        <h1 class="text-h2 font-bold text-text-primary mb-2">{{ $t('login.title') }}</h1>
        <p class="text-text-secondary text-body">{{ $t('login.subtitle') }}</p>
      </div>

      <!-- Login Form -->
      <div class="bg-white rounded-modal shadow-modal p-8">
        <form @submit.prevent="handleLogin">
          <!-- Username Input -->
          <div class="mb-6">
            <label for="username" class="block text-body font-medium text-text-primary mb-2">
              {{ $t('login.username') }}
            </label>
            <input
              id="username"
              v-model="form.username"
              type="text"
              :placeholder="$t('login.usernamePlaceholder')"
              class="w-full px-3 py-2 border border-border rounded-btn focus:outline-none focus:border-primary focus:ring-2 focus:ring-blue-100 transition-all duration-fast"
              :class="{ 'border-danger': errors.username }"
            />
            <p v-if="errors.username" class="text-danger text-small mt-1">{{ $t(errors.username) }}</p>
          </div>

          <!-- Password Input -->
          <div class="mb-6">
            <label for="password" class="block text-body font-medium text-text-primary mb-2">
              {{ $t('login.password') }}
            </label>
            <input
              id="password"
              v-model="form.password"
              type="password"
              :placeholder="$t('login.passwordPlaceholder')"
              class="w-full px-3 py-2 border border-border rounded-btn focus:outline-none focus:border-primary focus:ring-2 focus:ring-blue-100 transition-all duration-fast"
              :class="{ 'border-danger': errors.password }"
            />
            <p v-if="errors.password" class="text-danger text-small mt-1">{{ $t(errors.password) }}</p>
          </div>

          <!-- Error Message -->
          <div v-if="loginError" class="mb-6 p-3 bg-red-50 border border-danger rounded-btn text-danger text-small">
            {{ loginError }}
          </div>

          <!-- Sign In Button -->
          <button
            type="submit"
            :disabled="isLoading"
            class="w-full bg-primary hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-btn transition-all duration-base hover:shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <span v-if="!isLoading">{{ $t('login.signIn') }}</span>
            <span v-else>
              <svg class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ $t('login.signingIn') }}
            </span>
          </button>
        </form>

        <!-- Demo Credentials -->
        <div class="mt-6 pt-6 border-t border-border">
          <p class="text-text-secondary text-small mb-2">{{ $t('login.demo') }}</p>
          <p class="text-text-primary text-small font-mono">Username: <span class="font-semibold">admin</span></p>
          <p class="text-text-primary text-small font-mono">Password: <span class="font-semibold">admin</span></p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '../composables/useAuth';
import { validateCredentials } from '../utils/validators';
import { useI18n } from 'vue-i18n';

const router = useRouter();
const { login } = useAuth();
const { t } = useI18n();

const form = ref({
  username: '',
  password: ''
});

const errors = ref({});
const loginError = ref('');
const isLoading = ref(false);

const handleLogin = async () => {
  errors.value = {};
  loginError.value = '';

  // Validate form
  const validationErrors = validateCredentials(form.value.username, form.value.password);
  if (Object.keys(validationErrors).length > 0) {
    errors.value = validationErrors;
    return;
  }

  isLoading.value = true;

  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));

  // Attempt login
  const success = login(form.value.username, form.value.password);

  isLoading.value = false;

  if (success) {
    router.push('/pending');
  } else {
    loginError.value = t('login.invalidCreds');
  }
};
</script>
