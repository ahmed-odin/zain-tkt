<template>
  <div>
    <div class="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <h2 class="text-h2 font-bold">{{ $t('pages.completedTitle') }} ({{ completed.length }})</h2>
      <div class="flex w-full flex-col items-stretch gap-2 sm:w-auto sm:flex-row sm:items-center">
        <div class="relative w-full sm:w-72">
          <input
            v-model="query"
            :placeholder="$t('common.search')"
            class="w-full rounded-lg border border-gray-300 py-2 pl-8 pr-2 text-sm focus:border-blue-600 focus:outline-none rtl:pl-2 rtl:pr-8"
          />
          <svg class="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 rtl:left-auto rtl:right-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
        </div>
        <button
          type="button"
          @click="exportToExcel"
          class="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
        >
          📥 {{ $t('excel.exportButton') }}
        </button>
      </div>
    </div>

    <div v-if="filtered.length === 0" class="rounded-card border border-gray-200 bg-white py-12 text-center">
      <p class="text-text-secondary">{{ $t('dashboard.empty.title') }}</p>
    </div>

    <div v-else class="overflow-x-auto rounded-xl border border-gray-100 bg-white shadow-sm">
      <table class="min-w-[920px] w-full text-sm" dir="rtl">
        <thead class="bg-gradient-to-r from-blue-50 to-blue-100 border-b-2 border-blue-200">
          <tr>
            <th class="px-6 py-4 text-right text-sm font-bold text-blue-900 border-r border-gray-200">الإجراءات</th>
            <th class="px-6 py-4 text-right text-sm font-bold text-blue-900 border-r border-gray-200">تاريخ الإتمام</th>
            <th class="px-6 py-4 text-right text-sm font-bold text-blue-900 border-r border-gray-200">تاريخ الإنشاء</th>
            <th class="px-6 py-4 text-right text-sm font-bold text-blue-900 border-r border-gray-200">مكتمل بواسطة</th>
            <th class="px-6 py-4 text-right text-sm font-bold text-blue-900 border-r border-gray-200">الحالة</th>
            <th class="px-6 py-4 text-right text-sm font-bold text-blue-900 border-r border-gray-200">المحافظة</th>
            <th class="px-6 py-4 text-right text-sm font-bold text-blue-900 border-r border-gray-200">شركة الوسيط</th>
            <th class="px-6 py-4 text-right text-sm font-bold text-blue-900 border-r border-gray-200">التعليقات</th>
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
                @click.stop="reopen(t.id)"
                class="p-2.5 rounded-lg text-gray-500 hover:text-amber-600 hover:bg-amber-50 transition-all duration-200 hover:shadow-sm"
                aria-label="Reopen"
              >↩️</button>
            </td>
            <td class="px-6 py-4 text-sm text-gray-600 border-r border-gray-100">{{ formatDateTime(t.completedAt) }}</td>
            <td class="px-6 py-4 text-sm text-gray-600 border-r border-gray-100">{{ formatDateTime(t.createdAt) }}</td>
            <td class="px-6 py-4 text-sm text-gray-700 border-r border-gray-100">{{ t.completedBy || '—' }}</td>
            <td class="px-6 py-4 border-r border-gray-100">
              <span class="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg text-xs font-semibold border border-green-300">✅ {{ $t('ticket.status.Complete') }}</span>
            </td>
            <td class="px-6 py-4 text-sm text-gray-700 border-r border-gray-100">{{ t.governorate }}</td>
            <td class="px-6 py-4 text-sm text-gray-700 border-r border-gray-100">{{ t.problemDescription || '—' }}</td>
            <td class="px-6 py-4 text-sm text-gray-700 border-r border-gray-100">{{ t.comments || '—' }}</td>
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
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useTicketStore } from '../stores/ticketStore';
import { useAuthStore } from '../stores/authStore';
import { formatDateTime } from '../utils/dateFormatter';
import { exportCompletedTicketsToExcel } from '../utils/excelUtils';
import EditTicketModal from '../components/EditTicketModal.vue';
import TicketDetailsModal from '../components/TicketDetailsModal.vue';

const query = ref('');
const ticketStore = useTicketStore();
const authStore = useAuthStore();

const completed = computed(() => ticketStore.tickets.filter(t => t.status === 'Complete'));

const filtered = computed(() => {
  const q = query.value.trim().toLowerCase();
  if (!q) return completed.value;
  return completed.value.filter(t => {
    return String(t.missdn).includes(q)
      || (t.problemDescription && t.problemDescription.toLowerCase().includes(q))
      || (t.comments && t.comments.toLowerCase().includes(q))
      || (t.governorate && t.governorate.toLowerCase().includes(q))
      || (t.completedBy && t.completedBy.toLowerCase().includes(q));
  });
});

const viewing = ref(null);
const editing = ref(null);

onMounted(async () => {
  await ticketStore.fetchCompletedTickets();
});

const openDetails = (t) => { viewing.value = { ...t }; };
const openEdit = (t) => { editing.value = { ...t }; };
const editFromDetails = (t) => { viewing.value = null; editing.value = { ...t }; };
const reopen = async (id) => {
  const updated = await ticketStore.updateTicket(id, { status: 'Pending' });
  if (!updated) {
    // handle error if needed
  }
};
const exportToExcel = () => { exportCompletedTicketsToExcel(completed.value); };
const closeEdit = () => { editing.value = null; };
</script>
