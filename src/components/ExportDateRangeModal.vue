<template>
  <div
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-40"
    @click.self="closeModal"
  >
    <div class="relative w-full max-w-sm bg-white rounded-lg p-5" @click.stop>
      <button
        @click="closeModal"
        class="absolute top-4 right-4 rtl:right-auto rtl:left-4 text-gray-500 hover:text-gray-700 text-2xl cursor-pointer leading-none"
        aria-label="Close"
      >
        ✕
      </button>

      <h2 class="text-lg font-bold text-text-primary mb-1 pr-8 rtl:pr-0 rtl:pl-8">
        {{ $t('excel.exportRangeTitle') }}
      </h2>
      <p class="text-xs text-text-secondary mb-4">{{ $t('excel.exportRangeSubtitle') }}</p>

      <form @submit.prevent="handleSubmit" class="flex flex-col gap-3 text-sm">
        <div class="flex gap-3">
          <div class="flex flex-1 flex-col gap-1">
            <label class="text-xs font-medium text-text-secondary">{{ $t('common.dateFrom') }}</label>
            <input
              type="date"
              v-model="from"
              class="rounded-lg border border-border bg-white px-2.5 py-2 text-sm text-text-primary focus:border-primary focus:outline-none"
              :class="{ 'border-danger': error }"
            />
          </div>
          <div class="flex flex-1 flex-col gap-1">
            <label class="text-xs font-medium text-text-secondary">{{ $t('common.dateTo') }}</label>
            <input
              type="date"
              v-model="to"
              class="rounded-lg border border-border bg-white px-2.5 py-2 text-sm text-text-primary focus:border-primary focus:outline-none"
              :class="{ 'border-danger': error }"
            />
          </div>
        </div>

        <p v-if="error" class="text-xs text-danger">{{ error }}</p>

        <div class="flex gap-2 mt-1">
          <button
            type="submit"
            :disabled="isExporting"
            class="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/90 disabled:opacity-60"
          >
            <Icon :icon="isExporting ? 'lucide:loader-2' : 'lucide:download'" class="h-4 w-4" :class="{ 'animate-spin': isExporting }" />
            {{ $t('excel.exportButton') }}
          </button>
          <button
            type="button"
            @click="closeModal"
            class="flex-1 rounded-lg bg-gray-100 px-3 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-gray-200"
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

defineProps({
  isExporting: { type: Boolean, default: false }
});

const emit = defineEmits(['close', 'export']);

const { t } = useI18n();
const from = ref('');
const to = ref('');
const error = ref('');

const closeModal = () => emit('close');
useModalClose(closeModal);

const handleSubmit = () => {
  error.value = '';
  if (!from.value || !to.value) {
    error.value = t('excel.exportRangeRequired');
    return;
  }
  if (from.value > to.value) {
    error.value = t('excel.exportRangeInvalid');
    return;
  }
  emit('export', { from: from.value, to: to.value });
};
</script>
