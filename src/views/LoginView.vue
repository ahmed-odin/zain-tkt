<template>
  <div class="flex min-h-screen items-center justify-center bg-bg-secondary p-4 sm:p-6">
    <div class="w-full max-w-sm">
      <!-- Brand -->
      <div class="mb-8 flex flex-col items-center text-center">
        <div class="mb-4 flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl shadow-card">
          <img
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRFxIJZhBKts68cgFxhv_0r_FtAEsBl7yj0n8sTLkBpL3U8IOyU8rMOMSg&s=10"
            alt="Ticket System Logo"
            class="h-full w-full object-cover"
          />
        </div>
        <h1 class="text-h2 font-bold text-text-primary">{{ $t('login.title') }}</h1>
        <p class="mt-1 text-sm text-text-secondary">{{ $t('login.subtitle') }}</p>
      </div>

      <!-- Card -->
      <div class="rounded-2xl border border-border bg-white p-6 shadow-card sm:p-7">
        <form @submit.prevent="handleLogin" class="flex flex-col gap-4">
          <!-- Identifier -->
          <div>
            <label for="username" class="mb-1.5 block text-sm font-medium text-text-primary">
              {{ $t('login.identifier') }}
            </label>
            <div class="relative">
              <Icon icon="lucide:user" class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-light rtl:left-auto rtl:right-3" />
              <input
                id="username"
                v-model="form.username"
                type="text"
                autocomplete="username"
                :placeholder="$t('login.identifierPlaceholder')"
                class="w-full rounded-lg border border-border bg-white py-2.5 pl-9 pr-3 text-sm text-text-primary placeholder:text-text-light focus:border-primary focus:outline-none rtl:pl-3 rtl:pr-9"
                :class="{ 'border-danger': errors.username }"
              />
            </div>
            <p v-if="errors.username" class="mt-1 text-xs text-danger">{{ $t(errors.username) }}</p>
          </div>

          <!-- Password -->
          <div>
            <label for="password" class="mb-1.5 block text-sm font-medium text-text-primary">
              {{ $t('login.password') }}
            </label>
            <div class="relative">
              <Icon icon="lucide:lock" class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-light rtl:left-auto rtl:right-3" />
              <input
                id="password"
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                autocomplete="current-password"
                :placeholder="$t('login.passwordPlaceholder')"
                class="w-full rounded-lg border border-border bg-white py-2.5 pl-9 pr-10 text-sm text-text-primary placeholder:text-text-light focus:border-primary focus:outline-none rtl:pl-10 rtl:pr-9"
                :class="{ 'border-danger': errors.password }"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-light hover:text-text-secondary rtl:right-auto rtl:left-2.5"
                :aria-label="showPassword ? 'Hide password' : 'Show password'"
              >
                <Icon :icon="showPassword ? 'lucide:eye-off' : 'lucide:eye'" class="h-4 w-4" />
              </button>
            </div>
            <p v-if="errors.password" class="mt-1 text-xs text-danger">{{ $t(errors.password) }}</p>
          </div>

          <!-- Error -->
          <div v-if="loginError" class="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-danger">
            <Icon icon="lucide:alert-circle" class="h-4 w-4 flex-shrink-0" />
            {{ loginError }}
          </div>

          <!-- Submit -->
          <button
            type="submit"
            :disabled="isLoading"
            class="mt-1 flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-primary/90 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Icon v-if="isLoading" icon="lucide:loader-2" class="h-4 w-4 animate-spin" />
            <span>{{ isLoading ? $t('login.signingIn') : $t('login.signIn') }}</span>
          </button>

          <!-- Test Users Info -->
          <div class="mt-4 rounded-xl border border-sky-100 bg-sky-50/50 p-4 text-right rtl:text-right ltr:text-left">
            <h3 class="mb-3 text-xs font-semibold text-sky-700">
              {{ locale === 'ar' ? 'حسابات الاختبار:' : 'Test Accounts:' }}
            </h3>
            <div class="space-y-2">
              <div class="rounded-lg bg-white p-2.5 shadow-sm border border-slate-100 text-xs text-text-primary">
                <span class="inline-block rounded bg-red-100 px-1.5 py-0.5 text-[10px] font-bold text-red-800 mb-1">
                  {{ locale === 'ar' ? 'مسؤول نظام' : 'System Admin' }}
                </span>
                <p class="font-mono text-slate-800">admin@example.com</p>
                <p class="text-text-secondary mt-0.5">{{ locale === 'ar' ? 'كلمة المرور: admin' : 'Password: admin' }}</p>
              </div>
              <div class="rounded-lg bg-white p-2.5 shadow-sm border border-slate-100 text-xs text-text-primary">
                <span class="inline-block rounded bg-blue-100 px-1.5 py-0.5 text-[10px] font-bold text-blue-800 mb-1">
                  Zain
                </span>
                <p class="font-mono text-slate-800">zain@example.com</p>
                <p class="text-text-secondary mt-0.5">{{ locale === 'ar' ? 'كلمة المرور: zain' : 'Password: zain' }}</p>
              </div>
              <div class="rounded-lg bg-white p-2.5 shadow-sm border border-slate-100 text-xs text-text-primary">
                <span class="inline-block rounded bg-green-100 px-1.5 py-0.5 text-[10px] font-bold text-green-800 mb-1">
                  الوسيط
                </span>
                <p class="font-mono text-slate-800">alwaseet@example.com</p>
                <p class="text-text-secondary mt-0.5">{{ locale === 'ar' ? 'كلمة المرور: alwaseet' : 'Password: alwaseet' }}</p>
              </div>
            </div>
          </div>
        </form>
      </div>

      <!-- Language toggle -->
      <div class="mt-6 text-center">
        <button
          @click="toggleLanguage"
          class="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-text-secondary transition-colors hover:text-primary"
        >
          <Icon icon="lucide:languages" class="h-4 w-4" />
          {{ locale === 'en' ? 'العربية' : 'English' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { Icon } from '@iconify/vue';
import { useRouter } from 'vue-router';
import { useAuth } from '../composables/useAuth';
import { validateCredentials } from '../utils/validators';
import { useI18n } from 'vue-i18n';

const router = useRouter();
const { login } = useAuth();
const { t, locale } = useI18n();

const form = ref({
  username: 'zain@example.com',
  password: 'zain'
});

const errors = ref({});
const loginError = ref('');
const isLoading = ref(false);
const showPassword = ref(false);

const toggleLanguage = () => {
  locale.value = locale.value === 'en' ? 'ar' : 'en';
  localStorage.setItem('language', locale.value);
  document.documentElement.dir = locale.value === 'ar' ? 'rtl' : 'ltr';
};

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
