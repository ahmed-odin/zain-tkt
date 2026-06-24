<template>
  <div class="p-6">
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-h2 font-bold">{{ $t('pages.completedTitle') }} ({{ completed.length }})</h2>
      <input v-model="query" :placeholder="$t('common.search')" class="px-3 py-2 border rounded-btn w-64" />
    </div>

    <div class="space-y-3">
      <div v-for="t in filtered" :key="t.id" class="p-3 border rounded-btn bg-white shadow-sm flex justify-between items-center">
        <div>
          <div class="font-medium">{{ t.missdn }}</div>
          <div class="text-small text-text-secondary">{{ t.intermediaryComment }}</div>
          <div class="text-small text-text-secondary mt-1">{{ $t('pages.completedBy') }}: {{ t.completedBy || '-' }}</div>
        </div>
        <div class="flex items-center gap-2">
          <button @click="reopen(t.id)" class="px-3 py-1 bg-yellow-500 text-white rounded">{{ $t('actions.reopen') }}</button>
          <button @click="openEdit(t)" class="px-3 py-1 bg-border rounded">{{ $t('common.edit') }}</button>
        </div>
      </div>
    </div>
    <EditTicketModal v-if="editing" :ticket="editing" @close="closeEdit" @updated="closeEdit" />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useTicketStore } from '../stores/ticketStore';
import EditTicketModal from '../components/EditTicketModal.vue';
import { useAuthStore } from '../stores/authStore';

const query = ref('');
const ticketStore = useTicketStore();
const completed = computed(() => ticketStore.tickets.filter(t => t.status === 'Complete'));
const filtered = computed(() => {
  const q = query.value.trim().toLowerCase();
  if (!q) return completed.value;
  return completed.value.filter(t => {
    return String(t.missdn).includes(q) || (t.intermediaryComment && t.intermediaryComment.toLowerCase().includes(q)) || (t.comments && t.comments.toLowerCase().includes(q));
  });
});

const editing = ref(null);
const authStore = useAuthStore();
const openEdit = (t) => { editing.value = { ...t }; };
const reopen = (id) => { ticketStore.updateStatus(id, 'Pending', authStore.currentUser); };
const closeEdit = () => { editing.value = null; };
</script>
