<template>
  <div 
    @dblclick="emit('edit', ticket)"
    @touchstart="handleTouchStart"
    @touchend="handleTouchEnd"
    @touchcancel="handleTouchEnd"
    @touchmove="handleTouchMove"
    class="bg-white rounded-card shadow-card border border-border transition-all duration-300 ease-in-out hover:shadow-lg hover:scale-105 active:scale-95 cursor-grab user-select-none overflow-hidden relative group"
  >
    <!-- Tooltip for first item -->
    <div v-if="isFirst" class="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap z-10 hidden sm:block">
      {{ $t('ticket.doubleClickToEdit') }}
    </div>

    <!-- Header -->
    <div class="p-4 sm:p-5 border-b border-border">
      <div class="flex items-start justify-between mb-2">
        <div>
          <p class="text-small text-text-secondary font-mono">{{ $t('ticket.id', { id: ticket.id }) }}</p>
          <h3 class="text-h3 font-bold text-text-primary mt-1">{{ ticket.missdn }}</h3>
        </div>
        <div :class="[
          'px-3 py-1 rounded-full text-small font-medium whitespace-nowrap',
          ticket.status === 'Pending' ? 'bg-gray-100 text-pending' :
          ticket.status === 'In Progress' ? 'bg-yellow-100 text-warning' :
          'bg-green-100 text-success'
        ]">
          {{ $t(`ticket.status.${ticket.status}`) }}
        </div>
      </div>
    </div>

    <!-- Body -->
    <div class="p-4 sm:p-5">
      <!-- Governorate Badge -->
      <div class="mb-4">
        <span class="inline-block bg-blue-100 text-primary px-3 py-1 rounded-full text-small font-medium">
          {{ ticket.governorate }}
        </span>
      </div>

      <!-- Comments Preview -->
      <div v-if="ticket.comments" class="mb-4">
        <p class="text-small text-text-secondary mb-1">{{ $t('ticket.comments') }}:</p>
        <p class="text-body text-text-primary line-clamp-2">{{ ticket.comments }}</p>
      </div>

      <!-- Problem Description -->
      <div v-if="ticket.problemDescription" class="mb-4">
        <p class="text-small text-text-secondary mb-1">{{ $t('ticket.problemDescription') }}:</p>
        <p class="text-body text-text-primary">{{ ticket.problemDescription }}</p>
      </div>

      <!-- Metadata -->
      <div class="space-y-2 mb-4 text-small text-text-secondary">
        <div class="flex items-center gap-2">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
          </svg>
          <span>{{ $t('ticket.createdBy', { name: ticket.createdBy }) }}</span>
        </div>
        
        <div class="flex items-center gap-2">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
          </svg>
          <span>{{ ticket.createdAt }}</span>
        </div>

        <div v-if="ticket.completedBy" class="flex items-center gap-2">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <span>{{ $t('ticket.completedBy', { name: ticket.completedBy }) }}</span>
        </div>

        <div class="flex items-center gap-2">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <span>{{ $t('ticket.updated', { date: ticket.updatedAt }) }}</span>
        </div>
      </div>

      <!-- Status Quick Change -->
      <div class="mb-4">
        <p class="text-small text-text-secondary mb-2">{{ $t('ticket.quickActions') }}</p>
        <div class="space-y-2">
          <button
            v-for="status in getAvailableStatusTransitions()"
            :key="status"
            @click.stop="emit('status-change', ticket.id, status)"
            :class="[
              'w-full px-3 py-1 rounded-btn text-small font-medium transition-all duration-base',
              status === 'Pending' ? 'bg-gray-100 hover:bg-gray-200 text-pending' :
              status === 'In Progress' ? 'bg-yellow-100 hover:bg-yellow-200 text-warning' :
              'bg-green-100 hover:bg-green-200 text-success'
            ]"
          >
            {{ $t('ticket.markAs', { status: $t(`ticket.status.${status}`) }) }}
          </button>
        </div>
      </div>
    </div>

    <!-- Footer Actions -->
    <div class="flex gap-2 p-4 sm:p-5 border-t border-border bg-bg-secondary">
      <button
        @click.stop="emit('edit', ticket)"
        class="flex-1 px-3 py-2 bg-primary hover:bg-blue-700 text-white text-small font-medium rounded-btn transition-all duration-base"
      >
        {{ $t('common.edit') }}
      </button>
      <button
        @click.stop="emit('delete', ticket)"
        class="flex-1 px-3 py-2 bg-danger hover:bg-red-600 text-white text-small font-medium rounded-btn transition-all duration-base"
      >
        {{ $t('common.delete') }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({
  ticket: {
    type: Object,
    required: true
  },
  isFirst: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['edit', 'delete', 'status-change']);

const getAvailableStatusTransitions = () => {
  const allStatuses = ['Pending', 'In Progress', 'Complete'];
  return allStatuses.filter(s => s !== props.ticket.status);
};

// Touch Handlers for Long Press Edit
const touchTimer = ref(null);

const handleTouchStart = () => {
  // Clear any existing timer
  if (touchTimer.value) clearTimeout(touchTimer.value);
  
  // Set a new timer for 500ms
  touchTimer.value = setTimeout(() => {
    emit('edit', props.ticket);
    // Vibrate to give feedback to user (if supported)
    if (navigator.vibrate) navigator.vibrate(50);
  }, 500);
};

const handleTouchEnd = () => {
  if (touchTimer.value) {
    clearTimeout(touchTimer.value);
    touchTimer.value = null;
  }
};

const handleTouchMove = () => {
  if (touchTimer.value) {
    clearTimeout(touchTimer.value);
    touchTimer.value = null;
  }
};
</script>
