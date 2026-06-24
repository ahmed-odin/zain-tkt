<template>
  <nav class="sticky top-0 z-50 bg-white shadow-md">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16">
        <!-- Logo -->
        <div class="flex items-center gap-3">
          <div class="inline-flex items-center justify-center w-10 h-10 bg-primary rounded-lg">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
            </svg>
          </div>
          <div>
            <h1 class="text-h3 font-bold text-text-primary hidden sm:block">{{ $t('nav.title') }}</h1>
            <p class="text-small text-text-secondary hidden sm:block">{{ $t('nav.subtitle') }}</p>
          </div>
        </div>

        <!-- Right Side: Language Switcher + User Info -->
        <div class="flex items-center gap-4 ml-auto rtl:ml-0 rtl:mr-auto">
          <!-- Language Switcher -->
          <button
            @click="toggleLanguage"
            class="flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg border-2 border-blue-500 hover:bg-blue-50 transition-all duration-200 text-sm font-medium h-[35px]"
          >
            <span>{{ locale === 'en' ? '🇬🇧 EN' : '🇸🇦 العربية' }}</span>
          </button>

          <!-- User Info and Logout -->
          <div class="text-right rtl:text-left hidden sm:block">
            <p class="text-body font-medium text-text-primary">{{ currentUsername }}</p>
            <p class="text-small text-text-secondary">{{ $t('nav.admin') }}</p>
          </div>
          <div class="w-px h-8 bg-border hidden sm:block"></div>
          <button
            @click="handleLogout"
            class="flex items-center gap-2 px-4 py-2 text-text-primary hover:bg-bg-secondary rounded-btn transition-all duration-base"
          >
            <svg class="w-5 h-5 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
            </svg>
            <span class="hidden sm:inline">{{ $t('nav.logout') }}</span>
          </button>
        </div>
      </div>

      <!-- Navigation Tabs -->
      <div class="bg-bg-secondary">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex items-center gap-2 py-2">
            <router-link to="/create" class="px-3 py-2 rounded-btn" :class="$route.name === 'CreateTicket' ? 'bg-primary text-white' : 'text-text-primary'">{{ $t('pages.createTab') }}</router-link>
            <router-link to="/pending" class="px-3 py-2 rounded-btn" :class="$route.name === 'PendingTickets' ? 'bg-primary text-white' : 'text-text-primary'">{{ $t('pages.pendingTab') }}</router-link>
            <router-link to="/completed" class="px-3 py-2 rounded-btn" :class="$route.name === 'CompletedTickets' ? 'bg-primary text-white' : 'text-text-primary'">{{ $t('pages.completedTab') }}</router-link>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/authStore';
import { useI18n } from 'vue-i18n';

const router = useRouter();
const authStore = useAuthStore();
const { locale } = useI18n();

const currentUsername = computed(() => authStore.currentUser);

const handleLogout = () => {
  authStore.logout();
  router.push('/login');
};

const toggleLanguage = () => {
  locale.value = locale.value === 'en' ? 'ar' : 'en';
  localStorage.setItem('language', locale.value);
  document.documentElement.dir = locale.value === 'ar' ? 'rtl' : 'ltr';
};
</script>
