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

      <!-- Minimal Search Bar -->
      <div class="mb-8">
        <div class="relative w-full max-w-2xl">
          <div class="absolute inset-y-0 left-0 rtl:left-auto rtl:right-0 pl-3 rtl:pr-3 flex items-center pointer-events-none">
            <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </div>
          <input
            v-model="searchQuery"
            type="text"
            :placeholder="$t('common.searchPlaceholder')"
            class="w-full pl-10 rtl:pr-10 rtl:pl-4 pr-4 py-3 border border-gray-300 rounded-btn focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-sm"
          />
        </div>
      </div>

      <!-- Tickets Table -->
      <div v-if="sortedAndFilteredTickets.length > 0" class="bg-white rounded-card shadow-sm border border-gray-200 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full border-collapse whitespace-nowrap text-left rtl:text-right">
            <thead>
              <tr class="bg-gray-100 border-b-2 border-gray-300">
                <th @click="toggleSort('id')" class="p-3 text-sm font-semibold cursor-pointer hover:bg-gray-200 transition-colors group select-none">
                  <div class="flex items-center gap-1">
                    {{ $t('dashboard.table.id') }}
                    <span v-if="sortKey === 'id'" class="text-gray-500">{{ sortOrder === 'asc' ? '↑' : '↓' }}</span>
                    <span v-else class="text-gray-400 opacity-0 group-hover:opacity-100">↕</span>
                  </div>
                </th>
                <th @click="toggleSort('missdn')" class="p-3 text-sm font-semibold cursor-pointer hover:bg-gray-200 transition-colors group select-none">
                  <div class="flex items-center gap-1">
                    {{ $t('dashboard.table.missdn') }}
                    <span v-if="sortKey === 'missdn'" class="text-gray-500">{{ sortOrder === 'asc' ? '↑' : '↓' }}</span>
                    <span v-else class="text-gray-400 opacity-0 group-hover:opacity-100">↕</span>
                  </div>
                </th>
                <th class="p-3 text-sm font-semibold hidden sm:table-cell">{{ $t('dashboard.table.governorate') }}</th>
                <th class="p-3 text-sm font-semibold">{{ $t('dashboard.table.status') }}</th>
                <th class="p-3 text-sm font-semibold hidden md:table-cell">{{ $t('dashboard.table.createdBy') }}</th>
                <th @click="toggleSort('createdAt')" class="p-3 text-sm font-semibold cursor-pointer hover:bg-gray-200 transition-colors group select-none">
                  <div class="flex items-center gap-1">
                    {{ $t('dashboard.table.createdAt') }}
                    <span v-if="sortKey === 'createdAt'" class="text-gray-500">{{ sortOrder === 'asc' ? '↑' : '↓' }}</span>
                    <span v-else class="text-gray-400 opacity-0 group-hover:opacity-100">↕</span>
                  </div>
                </th>
                <th @click="toggleSort('updatedAt')" class="p-3 text-sm font-semibold cursor-pointer hover:bg-gray-200 transition-colors hidden lg:table-cell group select-none">
                  <div class="flex items-center gap-1">
                    {{ $t('dashboard.table.updatedAt') }}
                    <span v-if="sortKey === 'updatedAt'" class="text-gray-500">{{ sortOrder === 'asc' ? '↑' : '↓' }}</span>
                    <span v-else class="text-gray-400 opacity-0 group-hover:opacity-100">↕</span>
                  </div>
                </th>
                <th class="p-3 text-sm font-semibold">{{ $t('dashboard.table.actions') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr 
                v-for="ticket in sortedAndFilteredTickets" 
                :key="ticket.id"
                class="border-b border-gray-200 hover:bg-blue-50 transition-colors duration-200 hover:shadow-sm"
              >
                <td class="p-3 text-sm text-gray-600 font-mono">#{{ ticket.id }}</td>
                <td class="p-3 text-sm font-medium text-gray-900">{{ ticket.missdn }}</td>
                <td class="p-3 text-sm text-gray-700 hidden sm:table-cell">{{ ticket.governorate }}</td>
                <td class="p-3 text-sm">
                  <span 
                    :style="ticket.status === 'Complete' ? 'background-color: #00D084; color: white;' : 'background-color: #6C757D; color: white;'"
                    class="px-3 py-1.5 rounded-[20px] font-medium text-[12px] whitespace-nowrap"
                  >
                    {{ $t(`ticket.status.${ticket.status}`) }}
                  </span>
                </td>
                <td class="p-3 text-sm text-gray-600 hidden md:table-cell">{{ ticket.createdBy }}</td>
                <td class="p-3 text-sm text-gray-600">{{ ticket.createdAt }}</td>
                <td class="p-3 text-sm text-gray-600 hidden lg:table-cell">{{ ticket.updatedAt }}</td>
                <td class="p-3 text-sm">
                  <div class="flex items-center gap-2">
                    <button 
                      @click="handleEditTicket(ticket)"
                      class="p-1.5 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                      :title="$t('common.edit')"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                    </button>
                    <button 
                      @click="handleDeleteTicket(ticket)"
                      class="p-1.5 text-red-600 hover:bg-red-100 rounded transition-colors"
                      :title="$t('common.delete')"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-16 bg-white rounded-card shadow-sm border border-gray-200">
        <svg class="w-16 h-16 text-text-light mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
        </svg>
        <h3 class="text-h3 text-text-primary mb-2">{{ $t('dashboard.empty.title') }}</h3>
        <p class="text-text-secondary text-body mb-6">
          {{ searchQuery ? $t('dashboard.empty.subtitleSearch') : $t('dashboard.empty.subtitleFirst') }}
        </p>
        <button
          v-if="!searchQuery"
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
          'fixed bottom-4 right-4 px-6 py-3 rounded-btn shadow-lg text-white font-medium transition-all duration-base z-50',
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

// Sorting
const sortKey = ref('id');
const sortOrder = ref('desc');

const notification = ref({
  show: false,
  message: '',
  type: 'success'
});

const toggleSort = (key) => {
  if (sortKey.value === key) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortKey.value = key;
    sortOrder.value = 'asc';
  }
};

const sortedAndFilteredTickets = computed(() => {
  // First apply search
  let results = ticketStore.searchTickets(searchQuery.value, {});
  
  // Then sort
  return results.sort((a, b) => {
    let valA = a[sortKey.value];
    let valB = b[sortKey.value];
    
    // Convert to Date for sorting time if createdAt/updatedAt
    if (sortKey.value === 'createdAt' || sortKey.value === 'updatedAt') {
      valA = new Date(valA).getTime();
      valB = new Date(valB).getTime();
    }
    
    if (valA < valB) return sortOrder.value === 'asc' ? -1 : 1;
    if (valA > valB) return sortOrder.value === 'asc' ? 1 : -1;
    return 0;
  });
});

// Methods
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
