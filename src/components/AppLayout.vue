<template>
  <div class="min-h-screen bg-bg-secondary text-text-primary">
    <Navbar @toggle-sidebar="sidebarOpen = !sidebarOpen" />
    <Sidebar :open="sidebarOpen" @close="sidebarOpen = false" />
    <main
      class="min-h-screen overflow-x-hidden pt-16 transition-all duration-300 md:ml-14 lg:ml-64 rtl:md:mr-14 rtl:md:ml-0 rtl:lg:mr-64"
    >
      <div class="mx-auto w-full max-w-7xl p-4 sm:p-6 lg:p-8">
        <router-view v-slot="{ Component }">
          <Transition name="page" mode="out-in">
            <component :is="Component" />
          </Transition>
        </router-view>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import Navbar from './Navbar.vue';
import Sidebar from './Sidebar.vue';
import { useTicketStore } from '../stores/ticketStore';

const sidebarOpen = ref(false);
const ticketStore = useTicketStore();

onMounted(() => {
  ticketStore.fetchPendingTickets();
});
</script>

<style scoped>
.page-enter-active,
.page-leave-active {
  transition: opacity 200ms ease, transform 200ms ease;
}
.page-enter-from {
  opacity: 0;
  transform: translateY(8px);
}
.page-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
