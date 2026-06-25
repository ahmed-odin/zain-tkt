<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" @click.self="closeModal">
    <div class="w-full max-w-2xl bg-white rounded-xl p-4 shadow-xl overflow-y-auto max-h-[85vh]" @click.stop>
      <div class="flex items-start justify-between gap-4 mb-4">
        <div>
          <h2 class="text-lg font-bold text-text-primary">{{ $t('excel.importTitle') }}</h2>
          <p class="text-sm text-gray-600 mt-1">{{ $t('excel.importDescription') }}</p>
        </div>
        <button @click="closeModal" class="text-gray-500 hover:text-gray-700 text-2xl leading-none">✕</button>
      </div>

      <div class="flex flex-col gap-3">
        <button
          type="button"
          @click="openFilePicker"
          class="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
        >
          📤
          <span>{{ $t('actions.importExcel') }}</span>
        </button>

        <input ref="fileInput" type="file" accept=".xlsx,.xls,.ods,.csv" class="hidden" @change="handleFileUpload" />

        <p v-if="selectedFile" class="text-sm text-slate-600">{{ selectedFile.name }}</p>
        <p v-if="errorMessage" class="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">{{ errorMessage }}</p>
        <p v-if="isParsing" class="text-sm text-slate-600">{{ $t('excel.parsingFile') }}</p>

        <div v-if="validationResults" class="space-y-4">
          <div class="rounded-xl bg-slate-50 border border-slate-200 p-4">
            <p class="text-sm text-slate-700">{{ $t('excel.totalRows', { count: validationResults.totalRows }) }}</p>
            <p class="text-sm text-slate-700">{{ $t('excel.validRows', { count: validationResults.validRows }) }}</p>
            <p class="text-sm text-slate-700">{{ $t('excel.errorsCount', { count: validationResults.errors.length }) }}</p>
            <p v-if="validationResults.warnings?.length" class="text-sm text-slate-700">{{ $t('excel.warningsCount', { count: validationResults.warnings.length }) }}</p>
          </div>

          <div v-if="validationResults.errors.length" class="rounded-xl bg-red-50 border border-red-200 p-4 max-h-56 overflow-y-auto">
            <p class="text-sm font-semibold text-red-700 mb-2">{{ $t('excel.errorListTitle') }}</p>
            <ul class="list-disc list-inside space-y-1 text-sm text-red-700">
              <li v-for="(item, idx) in validationResults.errors" :key="idx">{{ item.message }}</li>
            </ul>
          </div>

          <div v-if="validationResults.warnings?.length" class="rounded-xl bg-yellow-50 border border-yellow-200 p-4 max-h-56 overflow-y-auto">
            <p class="text-sm font-semibold text-yellow-800 mb-2">{{ $t('excel.warningListTitle') }}</p>
            <ul class="list-disc list-inside space-y-1 text-sm text-yellow-800">
              <li v-for="(item, idx) in validationResults.warnings" :key="`warning-${idx}`">{{ item.message }}</li>
            </ul>
          </div>

          <div v-if="validationResults.validTickets.length" class="rounded-xl bg-white border border-slate-200 p-4">
            <div class="flex items-center justify-between mb-3">
              <p class="text-sm font-semibold text-slate-800">{{ $t('excel.previewTitle') }}</p>
              <span class="text-xs text-slate-500">{{ $t('excel.previewSubtitle', { count: validationResults.validTickets.length }) }}</span>
            </div>
            <div class="overflow-x-auto">
              <table class="min-w-full text-sm text-right rtl:text-left">
                <thead class="bg-slate-100 text-slate-700">
                  <tr>
                    <th class="px-3 py-2">MISSDN</th>
                    <th class="px-3 py-2">المحافظة</th>
                    <th class="px-3 py-2">التعليق</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(ticket, idx) in validationResults.validTickets.slice(0, 5)" :key="idx" class="border-b border-slate-200 hover:bg-slate-50">
                    <td class="px-3 py-2 font-mono text-slate-700">{{ ticket.missdn }}</td>
                    <td class="px-3 py-2 text-slate-700">{{ ticket.governorate }}</td>
                    <td class="px-3 py-2 text-slate-600">{{ ticket.comments || '-' }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p v-if="validationResults.validTickets.length > 5" class="mt-3 text-xs text-slate-500">{{ $t('excel.previewMore', { count: validationResults.validTickets.length - 5 }) }}</p>
          </div>
        </div>
      </div>

      <div class="mt-4 flex justify-end gap-2">
        <button
          type="button"
          class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60"
          :disabled="!validationResults || validationResults.validRows === 0"
          @click="importTickets"
        >
          {{ $t('excel.importValidButton', { count: validationResults ? validationResults.validRows : 0 }) }}
        </button>
        <button
          type="button"
          class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          @click="closeModal"
        >
          {{ $t('common.cancel') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { parsePendingTicketsExcel } from '../utils/excelUtils';

const emit = defineEmits(['close', 'import']);
const fileInput = ref(null);
const selectedFile = ref(null);
const validationResults = ref(null);
const errorMessage = ref('');
const isParsing = ref(false);

const closeModal = () => emit('close');
const openFilePicker = () => {
  if (fileInput.value) {
    fileInput.value.value = null;
  }
  fileInput.value?.click();
};

const handleFileUpload = async (event) => {
  const file = event.target.files?.[0];
  if (!file) return;

  selectedFile.value = file;
  errorMessage.value = '';
  validationResults.value = null;
  isParsing.value = true;

  try {
    validationResults.value = await parsePendingTicketsExcel(file);
  } catch (error) {
    validationResults.value = null;
    errorMessage.value = error?.message || String(error);
  } finally {
    isParsing.value = false;
  }
};

const importTickets = () => {
  if (!validationResults.value || validationResults.value.validRows === 0) return;
  emit('import', validationResults.value.validTickets);
  closeModal();
};
</script>
