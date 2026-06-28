<template>
  <div>
    <div class="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div class="flex items-center gap-2.5">
        <h2 class="text-h2 font-bold">{{ $t('users.title') }}</h2>
        <span class="rounded-full bg-bg-tertiary px-2.5 py-0.5 text-sm font-semibold text-primary">{{ userStore.users.length }}</span>
      </div>
      <button
        type="button"
        @click="openCreate"
        class="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-primary/90"
      >
        <Icon icon="lucide:user-plus" class="h-4 w-4" /> {{ $t('users.addUser') }}
      </button>
    </div>

    <div v-if="actionError" class="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-danger">
      {{ actionError }}
    </div>

    <TableSkeleton v-if="isLoading" :columns="6" :rows="5" />

    <div v-else-if="userStore.users.length === 0" class="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border bg-white py-16 text-center">
      <div class="flex h-12 w-12 items-center justify-center rounded-full bg-bg-secondary text-text-light">
        <Icon icon="lucide:users" class="h-6 w-6" />
      </div>
      <p class="font-medium text-text-primary">{{ $t('dashboard.empty.title') }}</p>
    </div>

    <div v-else class="overflow-x-auto rounded-xl border border-border bg-white shadow-card">
      <table class="min-w-[760px] w-full text-sm">
        <thead class="bg-bg-secondary border-b border-border">
          <tr>
            <th class="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-text-secondary">{{ $t('users.name') }}</th>
            <th class="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-text-secondary">{{ $t('users.email') }}</th>
            <th class="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-text-secondary">{{ $t('users.phone') }}</th>
            <th class="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-text-secondary">{{ $t('users.role') }}</th>
            <th class="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-text-secondary">{{ $t('users.status') }}</th>
            <th class="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-text-secondary">{{ $t('dashboard.table.actions') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="u in userStore.users" :key="u.id" class="border-b border-border last:border-0 hover:bg-bg-secondary transition-colors">
            <td class="px-6 py-4">
              <div class="flex items-center gap-2.5">
                <div class="flex h-8 w-8 items-center justify-center rounded-full bg-bg-tertiary text-xs font-semibold text-primary">
                  {{ initials(u.name) }}
                </div>
                <span class="font-medium text-text-primary">{{ u.name }}</span>
                <span v-if="u.id === authStore.currentUser?.id" class="rounded bg-bg-secondary px-1.5 py-0.5 text-[10px] text-text-light">{{ $t('users.you') }}</span>
              </div>
            </td>
            <td class="px-6 py-4 text-text-secondary">{{ u.email }}</td>
            <td class="px-6 py-4 text-text-secondary">{{ u.phone || '—' }}</td>
            <td class="px-6 py-4">
              <span class="badge" :class="roleStyle(u.role)">{{ $t(`nav.roles.${u.role}`) }}</span>
            </td>
            <td class="px-6 py-4">
              <span v-if="u.is_active" class="badge bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200">
                <span class="badge-dot bg-emerald-500"></span> {{ $t('users.active') }}
              </span>
              <span v-else class="badge bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-200">
                <span class="badge-dot bg-slate-400"></span> {{ $t('users.inactive') }}
              </span>
            </td>
            <td class="px-6 py-4">
              <div class="flex gap-1.5">
                <button
                  @click="openEdit(u)"
                  class="p-2 rounded-lg text-text-light hover:text-blue-600 hover:bg-blue-50 transition-colors"
                  :title="$t('common.edit')"
                >
                  <Icon icon="lucide:pencil" class="h-4 w-4" />
                </button>
                <button
                  @click="openPassword(u)"
                  class="p-2 rounded-lg text-text-light hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                  :title="$t('users.changePassword')"
                >
                  <Icon icon="lucide:key-round" class="h-4 w-4" />
                </button>
                <button
                  @click="openToggle(u)"
                  class="p-2 rounded-lg text-text-light transition-colors"
                  :class="u.is_active ? 'hover:text-amber-600 hover:bg-amber-50' : 'hover:text-emerald-600 hover:bg-emerald-50'"
                  :title="u.is_active ? $t('users.deactivate') : $t('users.activate')"
                >
                  <Icon :icon="u.is_active ? 'lucide:user-x' : 'lucide:user-check'" class="h-4 w-4" />
                </button>
                <button
                  v-if="u.id !== authStore.currentUser?.id"
                  @click="openDelete(u)"
                  class="p-2 rounded-lg text-text-light hover:text-red-600 hover:bg-red-50 transition-colors"
                  :title="$t('common.delete')"
                >
                  <Icon icon="lucide:trash-2" class="h-4 w-4" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <UserFormModal
      v-if="showForm"
      :user="editingUser"
      @close="showForm = false"
      @saved="onSaved"
    />

    <ChangePasswordModal
      v-if="passwordUser"
      :user="passwordUser"
      @close="passwordUser = null"
      @saved="passwordUser = null"
    />

    <ConfirmActionModal
      v-if="toggling"
      :title="toggling.is_active ? $t('users.deactivateTitle') : $t('users.activateTitle')"
      :message="$t(toggling.is_active ? 'users.deactivateConfirm' : 'users.activateConfirm', { name: toggling.name })"
      :confirm-label="toggling.is_active ? $t('users.deactivate') : $t('users.activate')"
      :confirm-class="toggling.is_active ? 'bg-amber-600 hover:bg-amber-700' : 'bg-emerald-600 hover:bg-emerald-700'"
      @close="toggling = null"
      @confirm="confirmToggle"
    />

    <ConfirmActionModal
      v-if="deleting"
      :title="$t('users.deleteTitle')"
      :message="$t('users.deleteConfirm', { name: deleting.name })"
      :confirm-label="$t('common.delete')"
      confirm-class="bg-red-600 hover:bg-red-700"
      @close="deleting = null"
      @confirm="confirmDelete"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { Icon } from '@iconify/vue';
import { useUserStore } from '../stores/userStore';
import { useAuthStore } from '../stores/authStore';
import TableSkeleton from '../components/TableSkeleton.vue';
import UserFormModal from '../components/UserFormModal.vue';
import ChangePasswordModal from '../components/ChangePasswordModal.vue';
import ConfirmActionModal from '../components/ConfirmActionModal.vue';

const userStore = useUserStore();
const authStore = useAuthStore();

const isLoading = ref(true);
const showForm = ref(false);
const editingUser = ref(null);
const passwordUser = ref(null);
const toggling = ref(null);
const deleting = ref(null);
const actionError = ref('');

onMounted(async () => {
  isLoading.value = true;
  await userStore.fetchUsers();
  isLoading.value = false;
});

const initials = (name) => {
  const parts = (name || '').trim().split(/\s+/);
  if (!parts[0]) return '?';
  return (parts[0][0] + (parts[1]?.[0] || '')).toUpperCase();
};

const roleStyle = (role) => ({
  super_admin: 'bg-violet-50 text-violet-700 ring-1 ring-inset ring-violet-200',
  staff: 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200',
  user: 'bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-200',
}[role] || 'bg-slate-100 text-slate-600');

const openCreate = () => { editingUser.value = null; showForm.value = true; };
const openEdit = (u) => { editingUser.value = { ...u }; showForm.value = true; };
const openPassword = (u) => { passwordUser.value = { ...u }; };
const openToggle = (u) => { actionError.value = ''; toggling.value = { ...u }; };
const openDelete = (u) => { actionError.value = ''; deleting.value = { ...u }; };

const onSaved = () => { showForm.value = false; editingUser.value = null; };

const confirmToggle = async () => {
  const u = toggling.value;
  if (u) {
    const ok = await userStore.updateUser(u.id, { is_active: !u.is_active });
    if (!ok) actionError.value = userStore.error || 'Unable to update user';
  }
  toggling.value = null;
};

const confirmDelete = async () => {
  const u = deleting.value;
  if (u) {
    const ok = await userStore.deleteUser(u.id);
    if (!ok) actionError.value = userStore.error || 'Unable to delete user';
  }
  deleting.value = null;
};
</script>
