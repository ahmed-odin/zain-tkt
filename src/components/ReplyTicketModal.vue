<template>
  <div
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-40"
    @click.self="closeModal"
  >
    <div class="relative w-full max-w-md bg-white rounded-lg p-4" @click.stop>
      <button
        @click="closeModal"
        class="absolute top-4 right-4 rtl:right-auto rtl:left-4 text-gray-500 hover:text-gray-700 text-2xl cursor-pointer leading-none"
        aria-label="Close"
      >
        ✕
      </button>

      <h2 class="text-lg font-bold text-text-primary mb-3 pr-8 rtl:pr-0 rtl:pl-8">
        {{ $t('modal.replyTitle', { id: ticket.id }) }}
      </h2>

      <!-- Show the staff reopen reason for context, if present -->
      <div v-if="reopenReason" class="mb-3 rounded-lg bg-amber-50 p-2.5 text-xs text-amber-800">
        <span class="font-semibold">{{ $t('modal.fields.reopenReason') }}:</span> {{ reopenReason }}
      </div>

      <form @submit.prevent="handleSubmit" class="flex flex-col gap-2 text-sm">
        <div class="flex flex-col gap-0.5">
          <label for="reply-text" class="text-xs font-semibold text-text-primary">
            {{ $t('modal.fields.reply') }} <span class="text-danger">*</span>
          </label>
          <textarea
            id="reply-text"
            v-model="reply"
            :placeholder="$t('modal.fields.replyPlaceholder')"
            rows="4"
            maxlength="500"
            class="w-full rounded-lg border border-border bg-white px-2.5 py-2 text-sm text-text-primary focus:border-primary focus:outline-none"
            :class="{ 'border-danger': error }"
          ></textarea>
          <p v-if="error" class="text-danger text-xs mt-0.5">{{ $t(error) }}</p>
        </div>

        <div class="flex gap-2 mt-2">
          <button
            type="submit"
            :disabled="isSubmitting"
            class="flex-1 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/90 disabled:opacity-60"
          >
            {{ $t('actions.reply') }}
          </button>
          <button
            type="button"
            @click="closeModal"
            class="flex-1 rounded-lg bg-gray-200 px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-300"
          >
            {{ $t('common.cancel') }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useModalClose } from '../composables/useModalClose';

const props = defineProps({
  ticket: { type: Object, required: true }
});

const emit = defineEmits(['close', 'confirm']);

const reply = ref('');
const error = ref('');
const isSubmitting = ref(false);

// Surface the most recent reopen reason from the timeline, if available.
const reopenReason = computed(() => {
  const events = props.ticket.timeline || [];
  for (let i = events.length - 1; i >= 0; i--) {
    if (events[i].action === 'reopened' && events[i].note) return events[i].note;
  }
  return '';
});

const closeModal = () => emit('close');
useModalClose(closeModal);

const handleSubmit = () => {
  error.value = '';
  if (!reply.value.trim()) {
    error.value = 'validation.requiredReply';
    return;
  }
  isSubmitting.value = true;
  emit('confirm', reply.value.trim());
};
</script>
