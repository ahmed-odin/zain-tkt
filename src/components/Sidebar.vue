<template>
  <!-- Mobile overlay -->
  <div
    v-if="open"
    class="fixed inset-0 bg-black bg-opacity-40 z-30 md:hidden"
    @click="emit('close')"
  ></div>

  <aside
    :class="[
      'fixed top-16 h-[calc(100vh-64px)] bg-white border-r-2 rtl:border-r-0 rtl:border-l-2 border-gray-200 shadow-md z-40 transition-all duration-300',
      'left-0 rtl:left-auto rtl:right-0',
      open ? 'translate-x-0' : '-translate-x-full rtl:translate-x-full',
      'md:translate-x-0 rtl:md:translate-x-0',
      'w-64 md:w-14 lg:w-64'
    ]"
  >
    <nav class="flex flex-col py-3 h-full">
      <router-link
        v-for="item in navItems"
        :key="item.to"
        :to="item.to"
        @click="emit('close')"
        :class="[
          'flex items-center gap-3 px-4 py-3 mx-2 rounded-lg transition-all duration-200',
          'md:justify-center md:px-2 lg:justify-start lg:px-4',
          isActive(item.routeName)
            ? 'bg-primary text-white'
            : 'text-text-primary hover:bg-bg-secondary'
        ]"
        :title="item.label"
      >
        <component :is="item.icon" class="w-5 h-5 flex-shrink-0" />
        <span class="font-medium text-sm md:hidden lg:inline">{{ item.label }}</span>
      </router-link>
    </nav>
  </aside>
</template>

<script setup>
import { computed, h } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';

defineProps({
  open: { type: Boolean, default: false }
});

const emit = defineEmits(['close']);

const route = useRoute();
const { t } = useI18n();

const PlusIcon = {
  render() {
    return h('svg', { fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24', class: 'w-5 h-5' }, [
      h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M12 4v16m8-8H4' })
    ]);
  }
};

const ListIcon = {
  render() {
    return h('svg', { fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24', class: 'w-5 h-5' }, [
      h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M4 6h16M4 12h16M4 18h16' })
    ]);
  }
};

const CheckListIcon = {
  render() {
    return h('svg', { fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24', class: 'w-5 h-5' }, [
      h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4' })
    ]);
  }
};

const navItems = computed(() => [
  { to: '/create', routeName: 'CreateTicket', label: t('pages.createTab'), icon: PlusIcon },
  { to: '/pending', routeName: 'PendingTickets', label: t('pages.pendingTab'), icon: ListIcon },
  { to: '/completed', routeName: 'CompletedTickets', label: t('pages.completedTab'), icon: CheckListIcon }
]);

const isActive = (routeName) => route.name === routeName;
</script>
