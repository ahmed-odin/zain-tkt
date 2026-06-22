<template>
  <div class="bg-white rounded-card shadow-card p-6 mb-8">
    <!-- Search Input -->
    <div class="mb-6">
      <div class="relative">
        <svg class="absolute left-3 rtl:right-3 rtl:left-auto top-3 w-5 h-5 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
        </svg>
        <input
          v-model="searchInput"
          type="text"
          :placeholder="$t('common.searchPlaceholder')"
          class="w-full pl-10 pr-4 rtl:pr-10 rtl:pl-4 py-2 border border-border rounded-btn focus:outline-none focus:border-primary focus:ring-2 focus:ring-blue-100 transition-all duration-fast"
          @input="handleSearch"
        />
        <button
          v-if="searchInput"
          @click="clearSearch"
          class="absolute right-3 rtl:left-3 rtl:right-auto top-3 text-text-secondary hover:text-text-primary transition-colors"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>
    </div>

    <!-- Filters Row -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <!-- Status Filter -->
      <div>
        <label class="block text-small font-medium text-text-primary mb-2">{{ $t('common.filterByStatus') }}</label>
        <div class="space-y-2">
          <button
            v-for="status in statusOptions"
            :key="status.value"
            @click="toggleStatus(status.value)"
            :class="[
              'w-full text-left rtl:text-right px-3 py-2 rounded-btn transition-all duration-base text-body',
              isStatusActive(status.value)
                ? 'bg-primary text-white font-medium'
                : 'bg-bg-secondary text-text-primary hover:bg-border'
            ]"
          >
            <div class="flex justify-between items-center">
              <span>{{ $t(`ticket.status.${status.value}`) }}</span>
              <span class="text-small">({{ status.count }})</span>
            </div>
          </button>
        </div>
      </div>

      <!-- Governorate Filter -->
      <div class="sm:col-span-1 lg:col-span-2">
        <label class="block text-small font-medium text-text-primary mb-2">{{ $t('common.filterByGovernorate') }}</label>
        <div class="relative">
          <button
            @click="toggleGovernorateDropdown"
            class="w-full px-3 py-2 border border-border rounded-btn bg-white text-left rtl:text-right flex justify-between items-center hover:border-primary transition-all duration-fast"
          >
            <span :class="selectedGovernorate === 'all' ? 'text-text-secondary' : 'text-text-primary'">
              {{ selectedGovernorate === 'all' ? $t('common.allGovernorates') : selectedGovernorate }}
            </span>
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
            </svg>
          </button>

          <!-- Dropdown Menu -->
          <transition name="dropdown">
            <div
              v-if="showGovernorateDropdown"
              class="absolute top-full left-0 right-0 mt-2 bg-white border border-border rounded-card shadow-modal z-10 max-h-64 overflow-y-auto"
            >
              <button
                @click="selectGovernorate('all')"
                :class="[
                  'w-full text-left rtl:text-right px-4 py-2 hover:bg-bg-secondary transition-colors text-body',
                  selectedGovernorate === 'all' ? 'bg-blue-100 text-primary font-medium' : 'text-text-primary'
                ]"
              >
                {{ $t('common.allGovernorates') }}
              </button>
              <button
                v-for="gov in governorates"
                :key="gov"
                @click="selectGovernorate(gov)"
                :class="[
                  'w-full text-left rtl:text-right px-4 py-2 hover:bg-bg-secondary transition-colors text-body border-t border-border',
                  selectedGovernorate === gov ? 'bg-blue-100 text-primary font-medium' : 'text-text-primary'
                ]"
              >
                <div class="flex justify-between items-center">
                  <span>{{ gov }}</span>
                  <span class="text-small text-text-secondary">({{ getGovernorateCount(gov) }})</span>
                </div>
              </button>
            </div>
          </transition>
        </div>
      </div>

      <!-- Reset Button -->
      <div class="flex items-end">
        <button
          @click="resetFilters"
          class="w-full px-4 py-2 bg-border hover:bg-border-accent text-text-primary rounded-btn transition-all duration-base font-medium"
        >
          {{ $t('common.resetFilters') }}
        </button>
      </div>
    </div>

    <!-- Active Filters Display -->
    <div v-if="hasActiveFilters" class="flex flex-wrap gap-2">
      <div v-for="status in activeStatuses" :key="`status-${status}`" class="inline-flex items-center gap-2 bg-blue-100 text-primary px-3 py-1 rounded-full text-small">
        {{ $t(`ticket.status.${status}`) }}
        <button @click="removeStatus(status)" class="hover:text-blue-700">
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useTicketStore } from '../stores/ticketStore';

const emit = defineEmits(['search', 'filter', 'reset']);

const ticketStore = useTicketStore();

const searchInput = ref('');
const showGovernorateDropdown = ref(false);
const selectedGovernorate = ref('all');
const selectedStatuses = ref([]);

const governorates = [
  'بغداد', 'البصرة', 'الموصل', 'كركوك', 'أربيل', 'السليمانية', 'دهوك',
  'الأنبار', 'صلاح الدين', 'ديالى', 'واسط', 'بابل', 'كربلاء', 'النجف',
  'المثنى', 'ذي قار', 'ميسان', 'نينوى'
];

const statusOptions = computed(() => {
  const stats = ticketStore.getTicketStats();
  return [
    { value: 'Pending', label: 'Pending', count: stats.pending },
    { value: 'In Progress', label: 'In Progress', count: stats.inProgress },
    { value: 'Complete', label: 'Complete', count: stats.complete }
  ];
});

const activeStatuses = computed(() => selectedStatuses.value);

const hasActiveFilters = computed(() => {
  return selectedStatuses.value.length > 0 || selectedGovernorate.value !== 'all' || searchInput.value;
});

const getGovernorateCount = (gov) => {
  const stats = ticketStore.getGovernorateStats();
  return stats[gov] || 0;
};

const isStatusActive = (status) => {
  return selectedStatuses.value.includes(status);
};

const toggleStatus = (status) => {
  const index = selectedStatuses.value.indexOf(status);
  if (index > -1) {
    selectedStatuses.value.splice(index, 1);
  } else {
    selectedStatuses.value.push(status);
  }
  emitFilters();
};

const removeStatus = (status) => {
  const index = selectedStatuses.value.indexOf(status);
  if (index > -1) {
    selectedStatuses.value.splice(index, 1);
  }
  emitFilters();
};

const toggleGovernorateDropdown = () => {
  showGovernorateDropdown.value = !showGovernorateDropdown.value;
};

const selectGovernorate = (gov) => {
  selectedGovernorate.value = gov;
  showGovernorateDropdown.value = false;
  emitFilters();
};

const handleSearch = () => {
  emit('search', searchInput.value);
  emitFilters();
};

const clearSearch = () => {
  searchInput.value = '';
  emit('search', '');
  emitFilters();
};

const emitFilters = () => {
  const filters = {};
  
  if (selectedStatuses.value.length === 1) {
    filters.status = selectedStatuses.value[0];
  }
  
  if (selectedGovernorate.value !== 'all') {
    filters.governorate = selectedGovernorate.value;
  }
  
  emit('filter', filters);
};

const resetFilters = () => {
  searchInput.value = '';
  selectedStatuses.value = [];
  selectedGovernorate.value = 'all';
  showGovernorateDropdown.value = false;
  emit('reset');
};
</script>

<style scoped>
.dropdown-enter-active,
.dropdown-leave-active {
  transition: opacity 150ms ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
