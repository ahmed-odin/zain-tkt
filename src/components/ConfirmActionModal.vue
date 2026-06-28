<template>
  <div
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-40"
    @click.self="emit('close')"
  >
    <div class="w-full max-w-sm bg-white rounded-lg p-5" @click.stop>
      <h2 class="text-lg font-bold text-text-primary mb-2">{{ title }}</h2>
      <p class="text-sm text-text-secondary mb-4">{{ message }}</p>
      <div class="flex gap-2">
        <button
          type="button"
          :disabled="isSubmitting"
          @click="confirm"
          class="flex-1 px-3 py-1.5 text-white text-sm rounded-md transition-colors disabled:opacity-60"
          :class="confirmClass"
        >
          {{ confirmLabel }}
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

defineProps({
  title: { type: String, required: true },
  message: { type: String, default: '' },
  confirmLabel: { type: String, required: true },
  confirmClass: { type: String, default: 'bg-blue-600 hover:bg-blue-700' }
});

const emit = defineEmits(['close', 'confirm']);

const isSubmitting = ref(false);

useModalClose(() => emit('close'));

const confirm = () => {
  isSubmitting.value = true;
  emit('confirm');
};
</script>
