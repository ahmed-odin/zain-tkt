<template>
  <div
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-40"
    @click.self="closeModal"
  >
    <div class="w-full max-w-md bg-white rounded-lg p-4" @click.stop>
      <button
        @click="closeModal"
        class="absolute top-4 right-4 rtl:right-auto rtl:left-4 text-gray-500 hover:text-gray-700 text-2xl cursor-pointer leading-none"
        aria-label="Close"
      >
        ✕
      </button>

      <h2 class="text-lg font-bold text-text-primary mb-3 pr-8 rtl:pr-0 rtl:pl-8">
        {{ $t('modal.reopenTitle') }}
      </h2>

      <form @submit.prevent="handleSubmit" class="flex flex-col gap-2 text-sm">
        <p class="text-text-secondary text-xs">{{ $t('modal.reopenConfirmMsg', { id: ticket.id }) }}</p>

        <div class="flex flex-col gap-0.5">
          <label for="reopen-reason" class="text-xs font-semibold text-text-primary">
            {{ $t('modal.fields.reopenReason') }} <span class="text-danger">*</span>
          </label>
          <textarea
            id="reopen-reason"
            v-model="reason"
            :placeholder="$t('modal.fields.reopenReasonPlaceholder')"
            rows="4"
            maxlength="500"
            class="w-full rounded-lg border border-border bg-white px-2.5 py-2 text-sm text-text-primary focus:border-primary focus:outline-none"
            :class="{ 'border-danger': error }"
          ></textarea>
          <p v-if="error" class="text-danger text-xs mt-0.5">{{ error }}</p>
        </div>

        <div class="flex gap-2 mt-2">
          <button
            type="submit"
            class="flex-1 px-3 py-1.5 bg-amber-600 text-white text-sm font-medium rounded-lg hover:bg-amber-700 transition-colors"
          >
            {{ $t('actions.reopen') }}
          </button>
          <button
            type="button"
            @click="closeModal"
            class="flex-1 px-3 py-1.5 bg-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-300 transition-colors"
          >
            {{ $t('common.cancel') }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useModalClose } from '../composables/useModalClose';

const props = defineProps({
  ticket: { type: Object, required: true }
});

const emit = defineEmits(['close', 'confirm']);

const { t } = useI18n();
const reason = ref('');
const error = ref('');

const closeModal = () => emit('close');
useModalClose(closeModal);

const handleSubmit = () => {
  error.value = '';
  if (!reason.value.trim()) {
    error.value = t('validation.requiredReopenReason');
    return;
  }
  emit('confirm', reason.value.trim());
};
</script>
