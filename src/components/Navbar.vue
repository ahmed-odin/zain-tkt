<template>
  <nav class="fixed left-0 right-0 top-0 z-50 h-16 border-b border-gray-100 bg-white/95 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/80">
    <div class="flex h-full items-center justify-between gap-3 px-3 sm:px-4 lg:px-6">
      <!-- Left: Hamburger + Logo -->
      <div class="flex min-w-0 items-center gap-2 sm:gap-3">
        <button
          @click="emit('toggle-sidebar')"
          class="rounded-lg p-2 transition-all hover:bg-bg-secondary md:hidden"
          aria-label="Toggle menu"
        >
          <svg class="h-6 w-6 text-text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
          </svg>
        </button>

        <div class="inline-flex h-9 w-9 items-center justify-center overflow-hidden rounded-lg">
          <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRFxIJZhBKts68cgFxhv_0r_FtAEsBl7yj0n8sTLkBpL3U8IOyU8rMOMSg&s=10" alt="Ticket System Logo" class="h-full w-full object-cover" />
        </div>
        <div class="hidden min-w-0 sm:block">
          <h1 class="truncate text-base font-bold leading-tight text-text-primary">{{ $t('nav.title') }}</h1>
          <p class="truncate text-xs text-text-secondary">{{ $t('nav.subtitle') }}</p>
        </div>
      </div>

      <!-- Right Side -->
      <div class="flex items-center gap-2 sm:gap-3">
        <button
          @click="toggleLanguage"
          class="flex h-8 items-center justify-center rounded-lg border-2 border-blue-500 px-2.5 text-xs font-medium transition-all duration-200 hover:bg-blue-50"
        >
          <span>{{ locale === 'en' ? '🇬🇧 EN' : '🇸🇦 AR' }}</span>
        </button>

        <div class="hidden min-w-0 text-right sm:block rtl:text-left">
          <p class="truncate text-sm font-medium text-text-primary">{{ currentUsername }}</p>
          <p class="truncate text-xs text-text-secondary">{{ $t('nav.admin') }}</p>
        </div>
        <div class="hidden h-7 w-px bg-border sm:block"></div>
        <button
          @click="handleLogout"
          class="flex items-center gap-1.5 rounded-btn px-3 py-1.5 text-sm text-text-primary transition-all duration-base hover:bg-bg-secondary"
        >
          <svg class="h-4 w-4 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

const currentUsername = computed(() => authStore.username || authStore.currentUser?.name || authStore.currentUser?.email || '');

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
