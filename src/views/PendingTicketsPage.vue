<template>
  <div>
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3">
      <h2 class="text-h2 font-bold">{{ $t('pages.pendingTitle') }} ({{ pending.length }})</h2>
      <div class="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
        <div class="relative w-full sm:w-72">
          <input
            v-model="query"
            :placeholder="$t('common.search')"
            class="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-blue-400 pl-10 rtl:pl-2 rtl:pr-10"
          />
          <svg class="w-4 h-4 text-gray-400 absolute left-2.5 rtl:left-auto rtl:right-2.5 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
        </div>
        <button
          type="button"
          @click="showImportModal = true"
          class="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
        >
          📤 {{ $t('actions.importExcel') }}
        </button>
      </div>
    </div>

    <div v-if="actionError" class="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">
      {{ actionError }}
    </div>
    <div v-if="importStatus" class="mb-4 p-3 bg-green-50 border border-green-200 rounded-md text-sm text-green-700">
      {{ importStatus }}
    </div>
    <div v-if="filtered.length === 0" class="text-center py-12 bg-white rounded-card border border-gray-200">
      <p class="text-text-secondary">{{ $t('dashboard.empty.title') }}</p>
    </div>

    <div v-else class="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
      <table class="w-full text-sm" dir="rtl">
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
import { ref, computed } from 'vue';
import { useTicketStore } from '../stores/ticketStore';
import { useAuthStore } from '../stores/authStore';
import { formatDateTime } from '../utils/dateFormatter';
import EditTicketModal from '../components/EditTicketModal.vue';
import TicketDetailsModal from '../components/TicketDetailsModal.vue';
import ImportExcelModal from '../components/ImportExcelModal.vue';

const query = ref('');
const ticketStore = useTicketStore();
const authStore = useAuthStore();

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

const openDetails = (t) => { viewing.value = { ...t }; };
const openEdit = (t) => { editing.value = { ...t }; };
const editFromDetails = (t) => { viewing.value = null; editing.value = { ...t }; };
const handleImport = (tickets) => {
  tickets.forEach(ticket => ticketStore.addTicket(ticket, authStore.currentUser));
  importStatus.value = $t('excel.importSuccess', { count: tickets.length });
  showImportModal.value = false;
  setTimeout(() => { importStatus.value = ''; }, 4500);
};
const markComplete = (id) => {
  const ticket = ticketStore.getTicketById(id);
  if (!ticket) return;

  if (!ticket.problemDescription || !ticket.problemDescription.trim()) {
    actionError.value = $t('validation.requiredAlwaseetCompany');
    return;
  }

  ticketStore.updateStatus(id, 'Complete', authStore.currentUser);
};
const closeEdit = () => { editing.value = null; };
</script>
