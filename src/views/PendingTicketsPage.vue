<template>
  <div>
    <div class="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <h2 class="text-h2 font-bold">{{ $t('pages.pendingTitle') }} ({{ pending.length }})</h2>
      <div class="flex w-full flex-col items-stretch gap-2 sm:w-auto sm:flex-row sm:items-center">
        <div class="relative w-full sm:w-72">
          <input
            v-model="query"
            :placeholder="$t('common.search')"
            class="w-full rounded-xl border border-gray-200 py-2 pl-10 pr-3 text-sm focus:border-blue-400 focus:outline-none rtl:pl-3 rtl:pr-10"
          />
          <svg class="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 rtl:left-auto rtl:right-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
        </div>
        <button
          type="button"
          @click="showImportModal = true"
          class="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
        >
          📤 {{ $t('actions.importExcel') }}
        </button>
      </div>
    </div>

    <div v-if="actionError" class="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
      {{ actionError }}
    </div>
    <div v-if="importStatus" class="mb-4 rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-700">
      {{ importStatus }}
    </div>
    <div v-if="filtered.length === 0" class="rounded-card border border-gray-200 bg-white py-12 text-center">
      <p class="text-text-secondary">{{ $t('dashboard.empty.title') }}</p>
    </div>

    <div v-else class="overflow-x-auto rounded-xl border border-gray-100 bg-white shadow-sm">
      <table class="min-w-[920px] w-full text-sm" dir="rtl">
        <thead class="bg-gradient-to-r from-blue-50 to-blue-100 border-b-2 border-blue-200">
          <tr>
            <th class="px-6 py-4 text-right text-sm font-bold text-blue-900 border-r border-gray-200">الإجراءات</th>
            <th class="px-6 py-4 text-right text-sm font-bold text-blue-900 border-r border-gray-200">تاريخ الإنشاء</th>
            <th class="px-6 py-4 text-right text-sm font-bold text-blue-900 border-r border-gray-200">بواسطة</th>
            <th class="px-6 py-4 text-right text-sm font-bold text-blue-900 border-r border-gray-200">الحالة</th>
            <th class="px-6 py-4 text-right text-sm font-bold text-blue-900 border-r border-gray-200">المحافظة</th>
            <th class="px-6 py-4 text-right text-sm font-bold text-blue-900 border-r border-gray-200">التعليق</th>
            <th class="px-6 py-4 text-right text-sm font-bold text-blue-900 border-r border-gray-200">MISSDN</th>
            <th class="px-6 py-4 text-right text-sm font-bold text-blue-900">رقم</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="t in filtered"
            :key="t.id"
            @click="openDetails(t)"
            class="border-b border-gray-100 hover:bg-gray-50 transition-all duration-300 hover:shadow-sm cursor-pointer"
          >
            <td class="px-6 py-4 text-sm text-gray-700 border-r border-gray-100 flex gap-2 justify-center">
              <button
                @click.stop="openEdit(t)"
                class="p-2.5 rounded-lg text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 hover:shadow-sm"
                aria-label="Edit"
              >🖊️</button>
              <button
                @click.stop="markComplete(t.id)"
                class="p-2.5 rounded-lg text-gray-500 hover:text-green-600 hover:bg-green-50 transition-all duration-200 hover:shadow-sm"
                aria-label="Mark Complete"
              >✅</button>
            </td>
            <td class="px-6 py-4 text-sm text-gray-600 border-r border-gray-100">{{ formatDateTime(t.createdAt) }}</td>
            <td class="px-6 py-4 text-sm text-gray-700 border-r border-gray-100">{{ t.createdBy }}</td>
            <td class="px-6 py-4 border-r border-gray-100">
              <span class="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-xs font-semibold border border-gray-300">⏳ {{ $t('ticket.status.Pending') }}</span>
            </td>
            <td class="px-6 py-4 text-sm text-gray-700 border-r border-gray-100">{{ t.governorate }}</td>
            <td class="px-6 py-4 text-sm text-gray-700 border-r border-gray-100">{{ t.comments || '-' }}</td>
            <td class="px-6 py-4 text-sm font-mono text-gray-700 border-r border-gray-100">{{ t.missdn }}</td>
            <td class="px-6 py-4 text-sm text-gray-600">#{{ t.id }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <TicketDetailsModal
      v-if="viewing"
      :ticket="viewing"
      @close="viewing = null"
      @edit="editFromDetails"
    />

    <EditTicketModal
      v-if="editing"
      :ticket="editing"
      @close="closeEdit"
      @updated="closeEdit"
    />

    <ImportExcelModal
      v-if="showImportModal"
      @close="showImportModal = false"
      @import="handleImport"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useTicketStore } from '../stores/ticketStore';
import { formatDateTime } from '../utils/dateFormatter';
import { useI18n } from 'vue-i18n';
import EditTicketModal from '../components/EditTicketModal.vue';
import TicketDetailsModal from '../components/TicketDetailsModal.vue';
import ImportExcelModal from '../components/ImportExcelModal.vue';

const query = ref('');
const ticketStore = useTicketStore();
const { t } = useI18n();

const pending = computed(() => ticketStore.tickets.filter(t => t.status === 'Pending'));

const filtered = computed(() => {
  const q = query.value.trim().toLowerCase();
  if (!q) return pending.value;
  return pending.value.filter(t => {
    return String(t.missdn).includes(q)
      || (t.problemDescription && t.problemDescription.toLowerCase().includes(q))
      || (t.comments && t.comments.toLowerCase().includes(q))
      || (t.governorate && t.governorate.toLowerCase().includes(q));
  });
});

const viewing = ref(null);
const editing = ref(null);
const showImportModal = ref(false);
const importStatus = ref('');
const actionError = ref('');

onMounted(async () => {
  await ticketStore.fetchPendingTickets();
});

const openDetails = (t) => { viewing.value = { ...t }; };
const openEdit = (t) => { editing.value = { ...t }; };
const editFromDetails = (t) => { viewing.value = null; editing.value = { ...t }; };
const handleImport = (tickets) => {
  tickets.forEach(ticket => ticketStore.createTicket(ticket));
  importStatus.value = t('excel.importSuccess', { count: tickets.length });
  showImportModal.value = false;
  setTimeout(() => { importStatus.value = ''; }, 4500);
};
const markComplete = async (id) => {
  const ticket = ticketStore.getTicketById(id);
  if (!ticket) return;

  if (!ticket.problemDescription || !ticket.problemDescription.trim()) {
    actionError.value = t('validation.requiredAlwaseetCompany');
    return;
  }

  const completed = await ticketStore.markComplete(id, ticket.problemDescription);
  if (!completed) {
    actionError.value = ticketStore.error || t('ticket.completeError');
  } else {
    actionError.value = '';
  }
};
const closeEdit = () => { editing.value = null; };
</script>
