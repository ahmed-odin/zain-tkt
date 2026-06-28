<template>
  <div
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-40"
    @click.self="emit('close')"
  >
    <div
      class="relative bg-white rounded-modal shadow-modal w-full max-w-md sm:max-w-lg max-h-[90vh] overflow-y-auto p-4 sm:p-5"
      @click.stop
    >
      <button
        @click="emit('close')"
        class="absolute top-4 right-4 rtl:right-auto rtl:left-4 text-gray-500 hover:text-gray-700 text-2xl cursor-pointer leading-none"
        aria-label="Close"
      >
        ✕
      </button>

      <h2 class="text-lg font-bold text-text-primary mb-4 pr-8 rtl:pr-0 rtl:pl-8">
        {{ $t('details.title', { id: ticket.id }) }}
      </h2>

      <div class="space-y-3 text-sm">
        <div class="grid grid-cols-1 gap-2 border-b border-gray-200 pb-3">
          <div><span class="font-medium text-text-secondary">{{ $t('modal.fields.title') }}:</span> {{ ticket.missdn }}</div>
          <div><span class="font-medium text-text-secondary">{{ $t('modal.fields.governorate') }}:</span> {{ ticket.governorate }}</div>
          <div>
            <span class="font-medium text-text-secondary">{{ $t('modal.fields.status') }}:</span>
            <span
              :class="ticket.status === 'Complete' ? 'bg-success' : 'bg-pending'"
              class="inline-block px-2 py-0.5 rounded-full text-white text-xs ml-1 rtl:ml-0 rtl:mr-1"
            >
              {{ $t(`ticket.status.${ticket.status}`) }}
            </span>
          </div>
        </div>

        <div class="grid grid-cols-1 gap-2 border-b border-gray-200 pb-3">
          <div><span class="font-medium text-text-secondary">{{ $t('details.createdBy') }}:</span> {{ ticket.createdBy }}</div>
          <div><span class="font-medium text-text-secondary">{{ $t('details.createdAt') }}:</span> {{ formatDateTime(ticket.createdAt) }}</div>
          <div><span class="font-medium text-text-secondary">{{ $t('details.updatedAt') }}:</span> {{ formatDateTime(ticket.updatedAt) }}</div>
        </div>

        <div>
          <p class="font-medium text-text-secondary mb-1">{{ $t('modal.fields.comments') }}:</p>
          <p class="text-text-primary whitespace-pre-wrap bg-bg-secondary rounded-md p-2">{{ ticket.comments || '—' }}</p>
        </div>

        <div>
          <p class="font-medium text-text-secondary mb-1">{{ $t('modal.fields.intermediary') }}:</p>
          <p class="text-text-primary whitespace-pre-wrap bg-bg-secondary rounded-md p-2">{{ ticket.problemDescription || '—' }}</p>
        </div>

        <div v-if="ticket.status === 'Complete'" class="border-t border-gray-200 pt-3">
          <div><span class="font-medium text-text-secondary">{{ $t('pages.completedBy') }}:</span> {{ ticket.completedBy || '—' }}</div>
          <div v-if="ticket.completedAt || ticket.updatedAt">
            <span class="font-medium text-text-secondary">{{ $t('details.completedAt') }}:</span>
            {{ formatDateTime(ticket.completedAt || ticket.updatedAt) }}
          </div>
        </div>

        <!-- Timeline -->
        <div class="border-t border-gray-200 pt-3">
          <p class="font-medium text-text-secondary mb-2">{{ $t('timeline.title') }}</p>
          <ul v-if="timeline.length" class="space-y-3">
            <li v-for="event in timeline" :key="event.id" class="flex gap-3">
              <span
                class="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full"
                :class="actionStyle(event.action)"
              >
                <Icon :icon="actionIcon(event.action)" class="h-4 w-4" />
              </span>
              <div class="min-w-0">
                <p class="text-text-primary">
                  {{ $t(`timeline.${event.action}`, { name: event.by }) }}
                </p>
                <p v-if="event.action === 'edited' && event.fields.length" class="text-xs text-text-secondary">
                  {{ event.fields.map(fieldLabel).join('، ') }}
                </p>
                <p v-if="event.action === 'reopened' && event.note" class="mt-0.5 rounded-md bg-amber-50 px-2 py-1 text-xs text-amber-700">
                  {{ event.note }}
                </p>
                <p v-if="event.action === 'replied' && event.note" class="mt-0.5 rounded-md bg-sky-50 px-2 py-1 text-xs text-sky-700">
                  {{ event.note }}
                </p>
                <p class="text-xs text-text-secondary">{{ formatDateTime(event.at) }}</p>
              </div>
            </li>
          </ul>
          <p v-else class="text-xs text-text-secondary">{{ $t('timeline.empty') }}</p>
        </div>
      </div>

      <div class="flex gap-2 mt-5">
        <button
          v-if="canEdit"
          @click="emit('edit', ticket)"
          class="flex-1 bg-primary hover:bg-blue-700 text-white font-medium py-1.5 px-3 rounded-md text-sm transition-all"
        >
          {{ $t('common.edit') }}
        </button>
        <button
          @click="emit('close')"
          class="flex-1 bg-border hover:bg-border-accent text-text-primary font-medium py-1.5 px-3 rounded-md text-sm transition-all"
        >
          {{ $t('common.close') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { Icon } from '@iconify/vue';
import { useI18n } from 'vue-i18n';
import { useModalClose } from '../composables/useModalClose';
import { useAuthStore } from '../stores/authStore';
import { formatDateTime } from '../utils/dateFormatter';

const props = defineProps({
  ticket: { type: Object, required: true }
});

const emit = defineEmits(['close', 'edit']);

const authStore = useAuthStore();
const { t } = useI18n();

const timeline = computed(() => props.ticket.timeline || []);

const actionIcon = (action) => ({
  created: 'lucide:plus-circle',
  completed: 'lucide:check-circle',
  reopened: 'lucide:undo-2',
  replied: 'lucide:reply',
  edited: 'lucide:pencil',
}[action] || 'lucide:dot');

const actionStyle = (action) => ({
  created: 'bg-blue-100 text-blue-600',
  completed: 'bg-green-100 text-green-600',
  reopened: 'bg-amber-100 text-amber-600',
  replied: 'bg-sky-100 text-sky-600',
  edited: 'bg-gray-100 text-gray-600',
}[action] || 'bg-gray-100 text-gray-600');

const fieldLabel = (field) => ({
  missdn: t('modal.fields.title'),
  governorate: t('modal.fields.governorate'),
  comments: t('ticket.comments'),
  alwaseet_company: t('modal.fields.intermediary'),
}[field] || field);

// Super admins can edit any ticket. Users can edit only their own pending tickets.
const canEdit = computed(() => {
  if (authStore.isSuperAdmin) return true;
  if (authStore.isUser) {
    return props.ticket.status !== 'Complete'
      && props.ticket.createdById === authStore.currentUser?.id;
  }
  return false;
});

useModalClose(() => emit('close'));
</script>
