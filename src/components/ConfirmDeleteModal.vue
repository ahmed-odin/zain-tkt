<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-40">
    <div class="bg-white rounded-modal shadow-modal w-full max-w-sm">
      <!-- Icon -->
      <div class="flex justify-center pt-6">
        <div class="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
          <svg class="w-6 h-6 text-danger" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        </div>
      </div>

      <!-- Content -->
      <div class="text-center px-6 py-6">
        <h2 class="text-h3 font-bold text-text-primary mb-2">{{ $t('modal.deleteTitle') }}</h2>
        <p class="text-body text-text-secondary mb-6">
          {{ $t('modal.deleteConfirmMsg', { id: ticketId }) }}
        </p>

        <!-- Actions -->
        <div class="flex gap-3">
          <button
            @click="emit('cancel')"
            class="flex-1 px-4 py-2 bg-border hover:bg-border-accent text-text-primary font-medium rounded-btn transition-all duration-base"
          >
            {{ $t('common.cancel') }}
          </button>
          <button
            @click="emit('confirm')"
            class="flex-1 px-4 py-2 bg-danger hover:bg-red-600 text-white font-medium rounded-btn transition-all duration-base"
          >
            {{ $t('common.confirmDelete') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  ticketId: {
    type: Number,
    required: true
  }
});

const emit = defineEmits(['confirm', 'cancel']);
</script>
