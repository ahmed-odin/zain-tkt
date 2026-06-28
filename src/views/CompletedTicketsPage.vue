<template>
  <div>
    <div class="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div class="flex items-center gap-2.5">
        <h2 class="text-h2 font-bold">{{ $t('pages.completedTitle') }}</h2>
        <span class="rounded-full bg-bg-tertiary px-2.5 py-0.5 text-sm font-semibold text-primary">{{ total }}</span>
      </div>
      <div class="flex w-full flex-col items-stretch gap-2 sm:w-auto sm:flex-row sm:items-center">
        <div class="relative w-full sm:w-72">
          <Icon icon="lucide:search" class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-light rtl:left-auto rtl:right-3" />
          <input
            v-model="query"
            :placeholder="$t('common.search')"
            class="w-full rounded-lg border border-border bg-white py-2 pl-9 pr-3 text-sm text-text-primary placeholder:text-text-light focus:border-primary focus:outline-none rtl:pl-3 rtl:pr-9"
          />
        </div>
        <button
          type="button"
          @click="showExportRange = true"
          class="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-border bg-white px-4 py-2 text-sm font-medium text-text-secondary transition-colors hover:border-primary hover:text-primary"
        >
          <Icon icon="lucide:calendar-range" class="h-4 w-4" /> {{ $t('excel.exportByDate') }}
        </button>
        <button
          type="button"
          @click="exportToExcel"
          class="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-primary/90"
        >
          <Icon icon="lucide:download" class="h-4 w-4" /> {{ $t('excel.exportButton') }}
        </button>
      </div>
    </div>

    <TicketFilters
      v-model:dateFrom="dateFrom"
      v-model:dateTo="dateTo"
      v-model:userFilter="userFilter"
      v-model:governorate="governorate"
      :users="users"
      :governorates="governorates"
      :has-active-filters="hasActiveFilters"
      @reset="resetFilters"
    />

    <TableSkeleton v-if="isLoading" :columns="10" :rows="6" />

    <div v-else-if="total === 0" class="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border bg-white py-16 text-center">
      <div class="flex h-12 w-12 items-center justify-center rounded-full bg-bg-secondary text-text-light">
        <Icon icon="lucide:inbox" class="h-6 w-6" />
      </div>
      <p class="font-medium text-text-primary">{{ $t('dashboard.empty.title') }}</p>
      <p v-if="hasActiveFilters" class="text-sm text-text-secondary">{{ $t('dashboard.empty.subtitleSearch') }}</p>
    </div>

    <div v-else class="overflow-x-auto rounded-xl border border-border bg-white shadow-card">
      <table class="w-full min-w-[860px] table-auto text-sm" dir="rtl">
        <thead class="border-b border-border bg-bg-secondary">
          <tr>
            <th class="w-28 whitespace-nowrap px-3 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-text-secondary">الإجراءات</th>
            <th class="w-36 whitespace-nowrap px-3 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-text-secondary">تاريخ الإتمام</th>
            <th class="w-36 px-3 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-text-secondary">تاريخ الإنشاء</th>
            <th class="w-32 px-3 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-text-secondary">مكتمل بواسطة</th>
            <th class="w-24 px-3 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-text-secondary">الحالة</th>
            <th class="w-28 px-3 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-text-secondary">المحافظة</th>
            <th class="w-40 px-3 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-text-secondary">شركة الوسيط</th>
            <th class="w-40 px-3 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-text-secondary">التعليقات</th>
            <th class="w-28 px-3 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-text-secondary">MISSDN</th>
            <th class="w-16 px-3 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-text-secondary">رقم</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="t in completed"
            :key="t.id"
            @click="openDetails(t)"
            class="cursor-pointer border-b border-border last:border-0 transition-colors hover:bg-bg-secondary"
          >
            <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-700">
              <div class="flex justify-center gap-2">
                <button
                  v-if="canEdit(t)"
                  @click.stop="openEdit(t)"
                  class="p-2 rounded-lg text-text-light hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 hover:shadow-sm"
                  :aria-label="$t('common.edit')"
                  :title="$t('common.edit')"
                >
                  <Icon icon="lucide:pencil" class="h-4 w-4" />
                </button>
                <button
                  v-if="canReopen"
                  @click.stop="openReopen(t)"
                  class="p-2 rounded-lg text-text-light hover:text-amber-600 hover:bg-amber-50 transition-all duration-200 hover:shadow-sm"
                  :aria-label="$t('actions.reopen')"
                  :title="$t('actions.reopen')"
                >
                  <Icon icon="lucide:undo-2" class="h-4 w-4" />
                </button>
                <button
                  v-if="canDelete"
                  @click.stop="openDelete(t)"
                  class="p-2 rounded-lg text-text-light hover:text-red-600 hover:bg-red-50 transition-all duration-200 hover:shadow-sm"
                  :aria-label="$t('common.delete')"
                  :title="$t('common.delete')"
                >
                  <Icon icon="lucide:trash-2" class="h-4 w-4" />
                </button>
                <span v-if="!canEdit(t) && !canReopen && !canDelete" class="text-gray-300">—</span>
              </div>
            </td>
            <td class="px-3 py-4 text-sm text-text-secondary whitespace-normal break-words">{{ formatDateTime(t.completedAt) }}</td>
            <td class="px-3 py-4 text-sm text-text-secondary whitespace-normal break-words">{{ formatDateTime(t.createdAt) }}</td>
            <td class="px-3 py-4 text-sm text-text-primary whitespace-normal break-words">{{ t.completedBy || '—' }}</td>
            <td class="px-3 py-4">
              <span class="badge bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200">
                <span class="badge-dot bg-emerald-500"></span> {{ $t('ticket.status.Complete') }}
              </span>
            </td>
            <td class="px-3 py-4 text-sm text-text-primary whitespace-normal break-words">{{ t.governorate }}</td>
            <td class="px-3 py-4 text-sm text-text-secondary whitespace-normal break-words">{{ t.problemDescription || '—' }}</td>
            <td class="px-3 py-4 text-sm text-text-secondary whitespace-normal break-words">{{ t.comments || '—' }}</td>
            <td class="px-3 py-4 text-sm font-mono text-text-primary whitespace-normal break-words">{{ t.missdn }}</td>
            <td class="px-3 py-4 text-sm text-text-light whitespace-normal break-words">#{{ t.id }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <Pagination
      v-if="!isLoading && total"
      :page="page"
      :total-pages="totalPages"
      :page-size="pageSize"
      :total="total"
      @update:page="goToPage"
      @update:page-size="setPageSize"
    />

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

    <ConfirmDeleteModal
      v-if="deleting"
      :ticket="deleting"
      @close="deleting = null"
      @confirm="confirmDelete"
    />

    <ReopenTicketModal
      v-if="reopening"
      :ticket="reopening"
      @close="reopening = null"
      @confirm="confirmReopen"
    />

    <ExportDateRangeModal
      v-if="showExportRange"
      :is-exporting="isExporting"
      @close="showExportRange = false"
      @export="exportByDate"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { Icon } from '@iconify/vue';
import { useTicketStore } from '../stores/ticketStore';
import { useAuthStore } from '../stores/authStore';
import { formatDateTime, localDayStartUtc, localDayEndUtc } from '../utils/dateFormatter';
import { exportCompletedTicketsToExcel } from '../utils/excelUtils';
import EditTicketModal from '../components/EditTicketModal.vue';
import TicketDetailsModal from '../components/TicketDetailsModal.vue';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal.vue';
import ReopenTicketModal from '../components/ReopenTicketModal.vue';
import ExportDateRangeModal from '../components/ExportDateRangeModal.vue';
import TableSkeleton from '../components/TableSkeleton.vue';
import TicketFilters from '../components/TicketFilters.vue';
import Pagination from '../components/Pagination.vue';
import { useServerTickets } from '../composables/useServerTickets';

const ticketStore = useTicketStore();
const authStore = useAuthStore();

// Role-based action permissions.
// Completed tickets can only be edited by super admins — users may not edit a done ticket.
const canReopen = computed(() => authStore.isStaff || authStore.isSuperAdmin);
const canDelete = computed(() => authStore.isSuperAdmin);
const canEdit = () => authStore.isSuperAdmin;

// Current page of rows (the server already returns only completed tickets).
const completed = computed(() => ticketStore.tickets);

const {
  query, dateFrom, dateTo, userFilter, governorate, page, pageSize,
  totalPages, total, isLoading, load, goToPage, setPageSize, hasActiveFilters, resetFilters,
} = useServerTickets((params) => ticketStore.fetchCompletedTickets(params));

const users = ref([]);
const governorates = ref([]);
const showExportRange = ref(false);
const isExporting = ref(false);

const viewing = ref(null);
const editing = ref(null);
const deleting = ref(null);
const reopening = ref(null);

onMounted(async () => {
  await load();
  const opts = await ticketStore.fetchFilterOptions();
  users.value = opts.users;
  governorates.value = opts.governorates;
});

const openDelete = (t) => { deleting.value = { ...t }; };
const confirmDelete = async (id) => {
  const ok = await ticketStore.deleteTicket(id);
  if (ok) await load();
  deleting.value = null;
};

const openDetails = (t) => { viewing.value = { ...t }; };
const openEdit = (t) => { editing.value = { ...t }; };
const editFromDetails = (t) => { viewing.value = null; editing.value = { ...t }; };
const openReopen = (t) => { reopening.value = { ...t }; };
const confirmReopen = async (reason) => {
  const id = reopening.value?.id;
  if (id) {
    await ticketStore.updateTicket(id, { status: 'Reopened', reopenReason: reason });
    await load();
  }
  reopening.value = null;
};
const exportToExcel = async () => {
  const params = {};
  if (query.value.trim()) params.search = query.value.trim();
  if (dateFrom.value) params.date_from = dateFrom.value;
  if (dateTo.value) params.date_to = dateTo.value;
  if (userFilter.value) params.user = userFilter.value;
  const rows = await ticketStore.fetchCompletedForExport(params);
  exportCompletedTicketsToExcel(rows);
};
const exportByDate = async ({ from, to }) => {
  isExporting.value = true;
  const rows = await ticketStore.fetchCompletedForExport({
    date_from: localDayStartUtc(from),
    date_to: localDayEndUtc(to),
  });
  isExporting.value = false;
  exportCompletedTicketsToExcel(rows);
  showExportRange.value = false;
};
const closeEdit = async () => { editing.value = null; await load(); };
</script>
