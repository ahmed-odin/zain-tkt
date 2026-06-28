<template>
  <div
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-40"
    @click.self="closeModal"
  >
    <div class="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-modal" @click.stop>
      <!-- Header -->
      <div class="flex items-start gap-3 border-b border-border p-5">
        <div class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
          <Icon icon="lucide:check-circle" class="h-5 w-5" />
        </div>
        <div class="min-w-0">
          <h2 class="text-lg font-bold text-text-primary">{{ $t('modal.completeTitle', { id: ticket.id }) }}</h2>
          <p class="text-sm text-text-secondary">{{ $t('modal.completeSubtitle') }}</p>
        </div>
        <button
          @click="closeModal"
          class="ml-auto rtl:ml-0 rtl:mr-auto text-text-light hover:text-text-secondary"
          aria-label="Close"
        >
          <Icon icon="lucide:x" class="h-5 w-5" />
        </button>
      </div>

      <form @submit.prevent="handleSubmit" class="flex flex-col gap-4 p-5">
        <!-- Ticket summary -->
        <div class="grid grid-cols-2 gap-3 rounded-xl bg-bg-secondary p-3 text-sm">
          <div>
            <p class="text-xs text-text-light">{{ $t('modal.fields.title') }}</p>
            <p class="font-mono text-text-primary">{{ ticket.missdn }}</p>
          </div>
          <div>
            <p class="text-xs text-text-light">{{ $t('modal.fields.governorate') }}</p>
            <p class="text-text-primary">{{ ticket.governorate || '—' }}</p>
          </div>
        </div>

        <!-- Alwaseet Company (required to complete) -->
        <div class="flex flex-col gap-1">
          <label for="complete-alwaseet" class="text-sm font-medium text-text-primary">
            {{ $t('modal.fields.intermediary') }} <span class="text-danger">*</span>
          </label>
          <textarea
            id="complete-alwaseet"
            v-model="alwaseet"
            :placeholder="$t('modal.fields.intermediaryPlaceholder')"
            rows="4"
            maxlength="500"
            class="w-full resize-none rounded-lg border border-border bg-white px-3 py-2.5 text-sm text-text-primary placeholder:text-text-light focus:border-primary focus:outline-none"
            :class="{ 'border-danger': error }"
          ></textarea>
          <div class="flex justify-between">
            <p v-if="error" class="text-xs text-danger">{{ error }}</p>
            <p class="ml-auto rtl:ml-0 rtl:mr-auto text-xs text-text-light">{{ alwaseet.length }}/500</p>
          </div>
        </div>

        <div class="flex gap-2 pt-1">
          <button
            type="submit"
            :disabled="isSubmitting"
            class="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-emerald-700 disabled:opacity-60"
          >
            <Icon :icon="isSubmitting ? 'lucide:loader-2' : 'lucide:check'" class="h-4 w-4" :class="{ 'animate-spin': isSubmitting }" />
            {{ isSubmitting ? $t('modal.buttons.updating') : $t('actions.markComplete') }}
          </button>
          <button
            type="button"
            @click="closeModal"
            class="flex-1 rounded-lg bg-gray-100 px-4 py-2.5 text-sm font-medium text-text-secondary transition-colors hover:bg-gray-200"
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
import { Icon } from '@iconify/vue';
import { useI18n } from 'vue-i18n';
import { useModalClose } from '../composables/useModalClose';

const props = defineProps({
  ticket: { type: Object, required: true }
});

const emit = defineEmits(['close', 'confirm']);

const { t } = useI18n();

const alwaseet = ref(props.ticket.problemDescription || '');
const error = ref('');
const isSubmitting = ref(false);

const closeModal = () => emit('close');
useModalClose(closeModal);

const handleSubmit = () => {
  error.value = '';
  if (!alwaseet.value.trim()) {
    error.value = t('validation.requiredAlwaseetCompany');
    return;
  }
  isSubmitting.value = true;
  emit('confirm', alwaseet.value.trim());
};
</script>
