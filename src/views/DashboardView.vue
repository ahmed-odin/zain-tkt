<template>
  <div class="min-h-screen bg-bg-secondary">
    <Navbar />
    
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
        <div>
          <h1 class="text-h2 font-bold text-text-primary">{{ $t('dashboard.title') }}</h1>
          <p class="text-text-secondary text-body mt-1">{{ $t('dashboard.subtitle') }}</p>
        </div>
        <button
          @click="showCreateModal = true"
          class="bg-primary hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-btn transition-all duration-base hover:shadow-md active:scale-95 flex items-center gap-2 whitespace-nowrap"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
          </svg>
          {{ $t('dashboard.createNew') }}
        </button>
      </div>

      <!-- Statistics Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          :title="$t('dashboard.stats.total')"
          :count="stats.total"
          icon="total"
          color="bg-blue-100"
          textColor="text-primary"
        />
        <StatCard
          :title="$t('dashboard.stats.pending')"
          :count="stats.pending"
          icon="pending"
          color="bg-gray-100"
          textColor="text-pending"
        />
        <StatCard
          :title="$t('dashboard.stats.inProgress')"
          :count="stats.inProgress"
          icon="progress"
          color="bg-yellow-100"
          textColor="text-warning"
        />
        <StatCard
          :title="$t('dashboard.stats.complete')"
          :count="stats.complete"
          icon="complete"
          color="bg-green-100"
          textColor="text-success"
        />
      </div>

      <!-- Search and Filter Section -->
      <SearchFilterBar
        @search="handleSearch"
        @filter="handleFilter"
        @reset="handleResetFilters"
      />

      <!-- Tickets Grid -->
      <div v-if="filteredTickets.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 p-4 sm:p-6 lg:p-8">
        <TicketCard
          v-for="(ticket, index) in filteredTickets"
          :key="ticket.id"
          :ticket="ticket"
          :isFirst="index === 0"
          @edit="handleEditTicket"
          @delete="handleDeleteTicket"
          @status-change="handleStatusChange"
        />
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-16">
        <svg class="w-16 h-16 text-text-light mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
        </svg>
        <h3 class="text-h3 text-text-primary mb-2">{{ $t('dashboard.empty.title') }}</h3>
        <p class="text-text-secondary text-body mb-6">
          {{ searchQuery || Object.keys(filters).length > 0 ? $t('dashboard.empty.subtitleSearch') : $t('dashboard.empty.subtitleFirst') }}
        </p>
        <button
          v-if="!searchQuery && Object.keys(filters).length === 0"
          @click="showCreateModal = true"
          class="bg-primary hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-btn transition-all duration-base hover:shadow-md active:scale-95"
        >
          {{ $t('dashboard.empty.createFirst') }}
        </button>
      </div>
    </main>

    <!-- Create Ticket Modal -->
    <CreateTicketModal
      v-if="showCreateModal"
      @close="showCreateModal = false"
      @created="handleTicketCreated"
    />

    <!-- Edit Ticket Modal -->
    <EditTicketModal
      v-if="showEditModal && selectedTicket"
      :ticket="selectedTicket"
      @close="showEditModal = false"
      @updated="handleTicketUpdated"
    />

    <!-- Delete Confirmation Modal -->
    <ConfirmDeleteModal
      v-if="showDeleteModal && ticketToDelete"
      :ticket-id="ticketToDelete.id"
      @confirm="confirmDelete"
      @cancel="showDeleteModal = false"
    />

    <!-- Notifications -->
    <Transition name="fade">
      <div
        v-if="notification.show"
        :class="[
          'fixed bottom-4 right-4 px-6 py-3 rounded-btn shadow-lg text-white font-medium transition-all duration-base',
          notification.type === 'success' ? 'bg-success' : 'bg-danger'
        ]"
      >
        {{ notification.message }}
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useTicketStore } from '../stores/ticketStore';
import { useAuthStore } from '../stores/authStore';
import Navbar from '../components/Navbar.vue';
import TicketCard from '../components/TicketCard.vue';
import SearchFilterBar from '../components/SearchFilterBar.vue';
import StatCard from '../components/StatCard.vue';
import CreateTicketModal from '../components/CreateTicketModal.vue';
import EditTicketModal from '../components/EditTicketModal.vue';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal.vue';
import { useI18n } from 'vue-i18n';

const ticketStore = useTicketStore();
const authStore = useAuthStore();
const { t } = useI18n();

// Initialize stores
onMounted(() => {
  ticketStore.initializeTickets();
});

const showCreateModal = ref(false);
const showEditModal = ref(false);
const showDeleteModal = ref(false);
const selectedTicket = ref(null);
const ticketToDelete = ref(null);

const searchQuery = ref('');
const filters = ref({});

const notification = ref({
  show: false,
  message: '',
  type: 'success'
});

// Computed properties
const stats = computed(() => ticketStore.getTicketStats());

const filteredTickets = computed(() => {
  return ticketStore.searchTickets(searchQuery.value, filters.value);
});

// Methods
const handleSearch = (query) => {
  searchQuery.value = query;
};

const handleFilter = (newFilters) => {
  filters.value = newFilters;
};

const handleResetFilters = () => {
  searchQuery.value = '';
  filters.value = {};
};

const handleTicketCreated = () => {
  showCreateModal.value = false;
  showNotification(t('dashboard.notifications.created'), 'success');
};

const handleEditTicket = (ticket) => {
  selectedTicket.value = ticket;
  showEditModal.value = true;
};

const handleTicketUpdated = () => {
  showEditModal.value = false;
  selectedTicket.value = null;
  showNotification(t('dashboard.notifications.updated'), 'success');
};

const handleDeleteTicket = (ticket) => {
  // Allow any authenticated user to delete tickets
  ticketToDelete.value = ticket;
  showDeleteModal.value = true;
};

const confirmDelete = () => {
  if (ticketToDelete.value) {
    ticketStore.deleteTicket(ticketToDelete.value.id);
    showDeleteModal.value = false;
    ticketToDelete.value = null;
    showNotification(t('dashboard.notifications.deleted'), 'success');
  }
};

const handleStatusChange = (ticketId, newStatus) => {
  const ticket = ticketStore.getTicketById(ticketId);
  if (ticket) {
    ticketStore.updateTicket(ticketId, { status: newStatus }, authStore.currentUser);
    showNotification(t('dashboard.notifications.statusUpdated'), 'success');
  }
};

const showNotification = (message, type = 'success') => {
  notification.value = {
    show: true,
    message,
    type
  };

  setTimeout(() => {
    notification.value.show = false;
  }, 3000);
};
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 200ms ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
