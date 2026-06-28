<template>
  <div
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-40"
    @click.self="emit('close')"
  >
    <div class="w-full max-w-sm bg-white rounded-lg p-5" @click.stop>
      <h2 class="text-lg font-bold text-text-primary mb-2">
        {{ $t('modal.deleteTitle') }}
      </h2>
      <p class="text-sm text-text-secondary mb-4">
        {{ $t('modal.deleteConfirmMsg', { id: ticket.id }) }}
      </p>
      <div class="flex gap-2">
        <button
          type="button"
          :disabled="isSubmitting"
          @click="confirm"
          class="flex-1 px-3 py-1.5 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 transition-colors disabled:opacity-60"
        >
          {{ $t('common.delete') }}
        </button>
        <button
          type="button"
          @click="emit('close')"
          class="flex-1 px-3 py-1.5 bg-gray-200 text-gray-700 text-sm rounded-md hover:bg-gray-300 transition-colors"
        >
          {{ $t('common.cancel') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useModalClose } from '../composables/useModalClose';

const props = defineProps({
  ticket: { type: Object, required: true }
});

const emit = defineEmits(['close', 'confirm']);

const isSubmitting = ref(false);

useModalClose(() => emit('close'));

const confirm = () => {
  isSubmitting.value = true;
  emit('confirm', props.ticket.id);
};
</script>
