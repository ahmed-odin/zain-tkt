<template>
  <div
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-40"
    @click.self="emit('close')"
  >
    <div
      class="relative bg-white rounded-modal shadow-modal w-full max-w-md sm:max-w-lg max-h-[90vh] overflow-y-auto p-4 sm:p-5"
      @click.stop
    >
      <button
        @click="emit('close')"
        class="absolute top-4 right-4 rtl:right-auto rtl:left-4 text-gray-500 hover:text-gray-700 text-2xl cursor-pointer leading-none"
        aria-label="Close"
      >
        ✕
      </button>

      <h2 class="text-lg font-bold text-text-primary mb-4 pr-8 rtl:pr-0 rtl:pl-8">
        {{ $t('details.title', { id: ticket.id }) }}
      </h2>

      <div class="space-y-3 text-sm">
        <div class="grid grid-cols-1 gap-2 border-b border-gray-200 pb-3">
          <div><span class="font-medium text-text-secondary">{{ $t('modal.fields.title') }}:</span> {{ ticket.missdn }}</div>
          <div><span class="font-medium text-text-secondary">{{ $t('modal.fields.governorate') }}:</span> {{ ticket.governorate }}</div>
          <div>
            <span class="font-medium text-text-secondary">{{ $t('modal.fields.status') }}:</span>
            <span
              :class="ticket.status === 'Complete' ? 'bg-success' : 'bg-pending'"
              class="inline-block px-2 py-0.5 rounded-full text-white text-xs ml-1 rtl:ml-0 rtl:mr-1"
            >
              {{ $t(`ticket.status.${ticket.status}`) }}
            </span>
          </div>
        </div>

        <div class="grid grid-cols-1 gap-2 border-b border-gray-200 pb-3">
          <div><span class="font-medium text-text-secondary">{{ $t('details.createdBy') }}:</span> {{ ticket.createdBy }}</div>
          <div><span class="font-medium text-text-secondary">{{ $t('details.createdAt') }}:</span> {{ formatDateTime(ticket.createdAt) }}</div>
          <div><span class="font-medium text-text-secondary">{{ $t('details.updatedAt') }}:</span> {{ formatDateTime(ticket.updatedAt) }}</div>
        </div>

        <div>
          <p class="font-medium text-text-secondary mb-1">{{ $t('modal.fields.comments') }}:</p>
          <p class="text-text-primary whitespace-pre-wrap bg-bg-secondary rounded-md p-2">{{ ticket.comments || '—' }}</p>
        </div>

        <div>
          <p class="font-medium text-text-secondary mb-1">{{ $t('modal.fields.intermediary') }}:</p>
          <p class="text-text-primary whitespace-pre-wrap bg-bg-secondary rounded-md p-2">{{ ticket.problemDescription || '—' }}</p>
        </div>

        <div v-if="ticket.status === 'Complete'" class="border-t border-gray-200 pt-3">
          <div><span class="font-medium text-text-secondary">{{ $t('pages.completedBy') }}:</span> {{ ticket.completedBy || '—' }}</div>
          <div v-if="ticket.completedAt || ticket.updatedAt">
            <span class="font-medium text-text-secondary">{{ $t('details.completedAt') }}:</span>
            {{ formatDateTime(ticket.completedAt || ticket.updatedAt) }}
          </div>
        </div>
      </div>

      <div class="flex gap-2 mt-5">
        <button
          @click="emit('edit', ticket)"
          class="flex-1 bg-primary hover:bg-blue-700 text-white font-medium py-1.5 px-3 rounded-md text-sm transition-all"
        >
          {{ $t('common.edit') }}
        </button>
        <button
          @click="emit('close')"
          class="flex-1 bg-border hover:bg-border-accent text-text-primary font-medium py-1.5 px-3 rounded-md text-sm transition-all"
        >
          {{ $t('common.close') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useModalClose } from '../composables/useModalClose';
import { formatDateTime } from '../utils/dateFormatter';

defineProps({
  ticket: { type: Object, required: true }
});

const emit = defineEmits(['close', 'edit']);

useModalClose(() => emit('close'));
</script>
