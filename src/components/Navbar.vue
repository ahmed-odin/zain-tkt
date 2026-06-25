<template>
  <nav class="fixed top-0 left-0 right-0 z-50 bg-white shadow-md h-16">
    <div class="h-full px-4 sm:px-6 lg:px-8 flex justify-between items-center">
      <!-- Left: Hamburger + Logo -->
      <div class="flex items-center gap-3">
        <button
          @click="emit('toggle-sidebar')"
          class="md:hidden p-2 hover:bg-bg-secondary rounded-lg transition-all"
          aria-label="Toggle menu"
        >
          <svg class="w-6 h-6 text-text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
          </svg>
        </button>

        <div class="inline-flex items-center justify-center w-9 h-9 rounded-lg overflow-hidden">
          <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRFxIJZhBKts68cgFxhv_0r_FtAEsBl7yj0n8sTLkBpL3U8IOyU8rMOMSg&s=10" alt="Ticket System Logo" class="w-full h-full object-cover" />
        </div>
        <div class="hidden sm:block">
          <h1 class="text-base font-bold text-text-primary leading-tight">{{ $t('nav.title') }}</h1>
          <p class="text-xs text-text-secondary">{{ $t('nav.subtitle') }}</p>
        </div>
      </div>

      <!-- Right Side -->
      <div class="flex items-center gap-3 rtl:gap-3">
        <button
          @click="toggleLanguage"
          class="flex items-center justify-center gap-1 px-2.5 py-1 rounded-lg border-2 border-blue-500 hover:bg-blue-50 transition-all duration-200 text-xs font-medium h-8"
        >
          <span>{{ locale === 'en' ? '🇬🇧 EN' : '🇸🇦 AR' }}</span>
        </button>

        <div class="text-right rtl:text-left hidden sm:block">
          <p class="text-sm font-medium text-text-primary">{{ currentUsername }}</p>
          <p class="text-xs text-text-secondary">{{ $t('nav.admin') }}</p>
        </div>
        <div class="w-px h-7 bg-border hidden sm:block"></div>
        <button
          @click="handleLogout"
          class="flex items-center gap-1.5 px-3 py-1.5 text-text-primary hover:bg-bg-secondary rounded-btn transition-all duration-base text-sm"
        >
          <svg class="w-4 h-4 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
          </svg>
          <span class="hidden sm:inline">{{ $t('nav.logout') }}</span>
        </button>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/authStore';
import { useI18n } from 'vue-i18n';

const emit = defineEmits(['toggle-sidebar']);

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
