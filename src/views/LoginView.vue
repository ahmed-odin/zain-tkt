<template>
  <div class="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4 sm:p-6">
    <div class="w-full max-w-md">
      <!-- Logo/Header -->
      <div class="mb-6 text-center sm:mb-8">
        <div class="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-blue-200">
          <svg class="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
          </svg>
        </div>
        <h1 class="mb-2 text-h2 font-bold text-text-primary">{{ $t('login.title') }}</h1>
        <p class="text-body text-text-secondary">{{ $t('login.subtitle') }}</p>
      </div>

      <!-- Login Form -->
      <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/60 sm:p-8">
        <form @submit.prevent="handleLogin">
          <!-- Username Input -->
          <div class="mb-6">
            <label for="username" class="block text-body font-medium text-text-primary mb-2">
              {{ $t('login.identifier') }}
            </label>
            <input
              id="username"
              v-model="form.username"
              type="text"
              :placeholder="$t('login.identifierPlaceholder')"
              class="w-full rounded-btn border border-border px-4 py-3 transition-all duration-fast focus:border-primary focus:outline-none focus:ring-2 focus:ring-blue-100"
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
              class="w-full rounded-btn border border-border px-4 py-3 transition-all duration-fast focus:border-primary focus:outline-none focus:ring-2 focus:ring-blue-100"
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
            class="flex w-full items-center justify-center gap-2 rounded-btn bg-primary px-4 py-3 font-medium text-white transition-all duration-base hover:bg-blue-700 hover:shadow-md active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
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

  const validationErrors = validateCredentials(form.value.username, form.value.password);
  if (Object.keys(validationErrors).length > 0) {
    errors.value = validationErrors;
    return;
  }

  isLoading.value = true;

  const response = await login(form.value.username, form.value.password);

  isLoading.value = false;

  if (response.success) {
    router.push('/pending');
  } else {
    loginError.value = response.message || t('login.invalidCreds');
  }
};
</script>
