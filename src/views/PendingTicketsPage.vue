<template>
  <div>
    <div class="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div class="flex items-center gap-2.5">
        <h2 class="text-h2 font-bold">{{ $t('pages.pendingTitle') }}</h2>
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
          v-if="authStore.isZainRole || authStore.isSuperAdmin"
          type="button"
          @click="showImportModal = true"
          class="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-primary/90"
        >
          <Icon icon="lucide:upload" class="h-4 w-4" /> {{ $t('actions.importExcel') }}
        </button>
        <button
          type="button"
          @click="exportToExcel"
          class="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-border bg-white px-4 py-2 text-sm font-medium text-text-secondary shadow-sm transition-colors hover:bg-bg-secondary hover:text-text-primary"
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

    <div v-if="actionError" class="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
      {{ actionError }}
    </div>
    <div v-if="importStatus" class="mb-4 rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-700">
      {{ importStatus }}
    </div>
    <TableSkeleton v-if="isLoading" :columns="8" :rows="6" />

    <div v-else-if="total === 0" class="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border bg-white py-16 text-center">
      <div class="flex h-12 w-12 items-center justify-center rounded-full bg-bg-secondary text-text-light">
        <Icon icon="lucide:inbox" class="h-6 w-6" />
      </div>
      <p class="font-medium text-text-primary">{{ $t('dashboard.empty.title') }}</p>
      <p v-if="hasActiveFilters" class="text-sm text-text-secondary">{{ $t('dashboard.empty.subtitleSearch') }}</p>
    </div>

    <div v-else class="overflow-x-auto rounded-xl border border-border bg-white shadow-card">
      <table class="min-w-[920px] w-full text-sm" dir="rtl">
        <thead class="bg-bg-secondary border-b border-border">
          <tr>
            <th class="px-6 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-text-secondary">الإجراءات</th>
            <th class="px-6 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-text-secondary">تاريخ الإنشاء</th>
            <th class="px-6 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-text-secondary">بواسطة</th>
            <th class="px-6 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-text-secondary">الحالة</th>
            <th class="px-6 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-text-secondary">المحافظة</th>
            <th class="px-6 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-text-secondary">التعليق</th>
            <th class="px-6 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-text-secondary">MISSDN</th>
            <th class="px-6 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-text-secondary">رقم</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="t in pending"
            :key="t.id"
            @click="openDetails(t)"
            class="border-b border-border last:border-0 hover:bg-bg-secondary transition-colors cursor-pointer"
          >
            <td class="px-6 py-4 text-sm text-gray-700">
              <div class="flex gap-2 justify-center">
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
                  v-if="canReply(t)"
                  @click.stop="openReply(t)"
                  class="p-2 rounded-lg text-text-light hover:text-sky-600 hover:bg-sky-50 transition-all duration-200 hover:shadow-sm"
                  :aria-label="$t('actions.reply')"
                  :title="$t('actions.reply')"
                >
                  <Icon icon="lucide:reply" class="h-4 w-4" />
                </button>
                <button
                  v-if="canComplete"
                  @click.stop="openComplete(t)"
                  class="p-2 rounded-lg text-text-light hover:text-green-600 hover:bg-green-50 transition-all duration-200 hover:shadow-sm"
                  :aria-label="$t('actions.markComplete')"
                  :title="$t('actions.markComplete')"
                >
                  <Icon icon="lucide:check-circle" class="h-4 w-4" />
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
                <span v-if="!canEdit(t) && !canReply(t) && !canComplete && !canDelete" class="text-text-light">—</span>
              </div>
            </td>
            <td class="px-6 py-4 text-sm text-text-secondary whitespace-nowrap">{{ formatDateTime(t.createdAt) }}</td>
            <td class="px-6 py-4 text-sm text-text-primary">{{ t.createdBy }}</td>
            <td class="px-6 py-4">
              <span
                v-if="t.status === 'Reopened'"
                class="badge bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200"
              >
                <span class="badge-dot bg-amber-500"></span> {{ $t('ticket.status.Reopened') }}
              </span>
              <span
                v-else-if="t.status === 'Replied'"
                class="badge bg-sky-50 text-sky-700 ring-1 ring-inset ring-sky-200"
              >
                <span class="badge-dot bg-sky-500"></span> {{ $t('ticket.status.Replied') }}
              </span>
              <span
                v-else
                class="badge bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-200"
              >
                <span class="badge-dot bg-slate-400"></span> {{ $t('ticket.status.Pending') }}
              </span>
            </td>
            <td class="px-6 py-4 text-sm text-text-primary">{{ t.governorate }}</td>
            <td class="px-6 py-4 text-sm text-text-secondary">{{ t.comments || '—' }}</td>
            <td class="px-6 py-4 text-sm font-mono text-text-primary">{{ t.missdn }}</td>
            <td class="px-6 py-4 text-sm text-text-light">#{{ t.id }}</td>
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

    <ImportExcelModal
      v-if="showImportModal"
      @close="showImportModal = false"
      @import="handleImport"
    />

    <CompleteTicketModal
      v-if="completing"
      :ticket="completing"
      @close="completing = null"
      @confirm="confirmComplete"
    />

    <ReplyTicketModal
      v-if="replying"
      :ticket="replying"
      @close="replying = null"
      @confirm="confirmReply"
    />

    <ConfirmDeleteModal
      v-if="deleting"
      :ticket="deleting"
      @close="deleting = null"
      @confirm="confirmDelete"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { Icon } from '@iconify/vue';
import { useTicketStore } from '../stores/ticketStore';
import { useAuthStore } from '../stores/authStore';
import { formatDateTime } from '../utils/dateFormatter';
import { useI18n } from 'vue-i18n';
import { exportPendingTicketsToExcel } from '../utils/excelUtils';
import EditTicketModal from '../components/EditTicketModal.vue';
import TicketDetailsModal from '../components/TicketDetailsModal.vue';
import ImportExcelModal from '../components/ImportExcelModal.vue';
import CompleteTicketModal from '../components/CompleteTicketModal.vue';
import ReplyTicketModal from '../components/ReplyTicketModal.vue';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal.vue';
import TableSkeleton from '../components/TableSkeleton.vue';
import TicketFilters from '../components/TicketFilters.vue';
import Pagination from '../components/Pagination.vue';
import { useServerTickets } from '../composables/useServerTickets';

const ticketStore = useTicketStore();
const authStore = useAuthStore();
const { t } = useI18n();

// Role-based action permissions
const canComplete = computed(() => authStore.isAlwaseetRole || authStore.isSuperAdmin);
const canDelete = computed(() => authStore.isSuperAdmin);
const canEdit = (ticket) =>
  authStore.isSuperAdmin || (authStore.isZainRole && ticket.createdById === authStore.currentUser?.id);
// The ticket owner (or a super admin) can reply to a reopened ticket.
const canReply = (ticket) =>
  ticket.status === 'Reopened' &&
  (authStore.isSuperAdmin || (authStore.isZainRole && ticket.createdById === authStore.currentUser?.id));

// Current page of rows (the server already returns only pending/reopened tickets).
const pending = computed(() => ticketStore.tickets);

const {
  query, dateFrom, dateTo, userFilter, governorate, page, pageSize,
  totalPages, total, isLoading, load, goToPage, setPageSize, hasActiveFilters, resetFilters,
} = useServerTickets((params) => ticketStore.fetchPendingTickets(params));

const users = ref([]);
const governorates = ref([]);

const viewing = ref(null);
const editing = ref(null);
const completing = ref(null);
const replying = ref(null);
const deleting = ref(null);
const showImportModal = ref(false);
const importStatus = ref('');
const actionError = ref('');

onMounted(async () => {
  await load();
  const opts = await ticketStore.fetchFilterOptions();
  users.value = opts.users;
  governorates.value = opts.governorates;
});

const openDetails = (t) => { viewing.value = { ...t }; };

const exportToExcel = async () => {
  const params = {
    search: query.value || undefined,
    date_from: dateFrom.value || undefined,
    date_to: dateTo.value || undefined,
    user_id: userFilter.value || undefined,
    governorate: governorate.value || undefined,
  };
  const rows = await ticketStore.fetchPendingForExport(params);
  exportPendingTicketsToExcel(rows);
};
const openEdit = (t) => { editing.value = { ...t }; };
const editFromDetails = (t) => { viewing.value = null; editing.value = { ...t }; };
const handleImport = async (tickets) => {
  const count = await ticketStore.bulkCreateTickets(tickets);
  if (count === null) {
    actionError.value = ticketStore.error || 'Unable to import tickets';
    return;
  }
  importStatus.value = t('excel.importSuccess', { count });
  showImportModal.value = false;
  await load();
  setTimeout(() => { importStatus.value = ''; }, 4500);
};
const openComplete = (t) => { actionError.value = ''; completing.value = { ...t }; };
const confirmComplete = async (alwaseetCompany) => {
  const id = completing.value?.id;
  if (!id) return;
  const completed = await ticketStore.markComplete(id, alwaseetCompany);
  if (!completed) {
    actionError.value = ticketStore.error || t('validation.requiredAlwaseetCompany');
  } else {
    actionError.value = '';
    await load();
  }
  completing.value = null;
};
const openReply = (t) => { actionError.value = ''; replying.value = { ...t }; };
const confirmReply = async (reply) => {
  const id = replying.value?.id;
  if (!id) return;
  const ok = await ticketStore.replyTicket(id, reply);
  if (!ok) {
    actionError.value = ticketStore.error || 'Unable to send reply';
  } else {
    actionError.value = '';
    await load();
  }
  replying.value = null;
};
const openDelete = (t) => { actionError.value = ''; deleting.value = { ...t }; };
const confirmDelete = async (id) => {
  const ok = await ticketStore.deleteTicket(id);
  if (!ok) {
    actionError.value = ticketStore.error || 'Unable to delete ticket';
  } else {
    await load();
  }
  deleting.value = null;
};
const closeEdit = async () => { editing.value = null; await load(); };
</script>
