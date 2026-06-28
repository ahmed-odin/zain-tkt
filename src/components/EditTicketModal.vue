<template>
  <div
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-40"
    @click.self="closeModal"
  >
    <div
      class="flex max-h-[88vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white shadow-modal"
      @click.stop
    >
      <!-- Header -->
      <div class="flex items-start gap-3 border-b border-border p-5">
        <div class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-bg-tertiary text-primary">
          <Icon icon="lucide:pencil" class="h-5 w-5" />
        </div>
        <div class="min-w-0">
          <h2 class="text-lg font-bold text-text-primary">{{ $t('modal.editTitle', { id: ticket.id }) }}</h2>
          <p class="text-sm text-text-secondary">{{ $t('modal.fields.title') }}: <span class="font-mono">{{ ticket.missdn }}</span></p>
        </div>
        <button
          @click="closeModal"
          class="ml-auto rtl:ml-0 rtl:mr-auto text-text-light hover:text-text-secondary"
          aria-label="Close"
        >
          <Icon icon="lucide:x" class="h-5 w-5" />
        </button>
      </div>

      <form @submit.prevent="handleSubmit" class="flex flex-col gap-4 overflow-y-auto p-5">
        <!-- MISSDN -->
        <div class="flex flex-col gap-1">
          <label for="edit-missdn" class="text-sm font-medium text-text-primary">
            {{ $t('modal.fields.title') }} <span class="text-danger">*</span>
          </label>
          <div class="relative">
            <Icon icon="lucide:phone" class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-light rtl:left-auto rtl:right-3" />
            <input
              id="edit-missdn"
              v-model="form.missdn"
              type="text"
              :placeholder="$t('modal.fields.titlePlaceholder')"
              inputmode="numeric"
              maxlength="10"
              @input="onMissdnInput"
              class="w-full rounded-lg border border-border bg-white py-2.5 pl-9 pr-3 font-mono text-sm text-text-primary placeholder:font-sans placeholder:text-text-light focus:border-primary focus:outline-none rtl:pl-3 rtl:pr-9"
              :class="{ 'border-danger': errors.missdn }"
            />
          </div>
          <div class="flex justify-between">
            <p v-if="errors.missdn" class="text-xs text-danger">{{ $t(errors.missdn) }}</p>
            <p class="ml-auto rtl:ml-0 rtl:mr-auto text-xs text-text-light">{{ form.missdn.length }}/10</p>
          </div>
        </div>

        <!-- Governorate -->
        <div class="flex flex-col gap-1">
          <label for="edit-governorate" class="text-sm font-medium text-text-primary">
            {{ $t('modal.fields.governorate') }} <span class="text-danger">*</span>
          </label>
          <select
            id="edit-governorate"
            v-model="form.governorate"
            class="w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm text-text-primary focus:border-primary focus:outline-none"
            :class="{ 'border-danger': errors.governorate }"
          >
            <option value="">{{ $t('common.selectGovernorate') }}</option>
            <option v-for="gov in governorates" :key="gov" :value="gov">{{ gov }}</option>
          </select>
          <p v-if="errors.governorate" class="text-xs text-danger">{{ $t(errors.governorate) }}</p>
        </div>

        <!-- Comments -->
        <div class="flex flex-col gap-1">
          <label for="edit-comments" class="text-sm font-medium text-text-primary">{{ $t('modal.fields.comments') }}</label>
          <textarea
            id="edit-comments"
            v-model="form.comments"
            :placeholder="$t('modal.fields.commentsPlaceholder')"
            maxlength="500"
            rows="3"
            class="w-full resize-none rounded-lg border border-border bg-white px-3 py-2.5 text-sm text-text-primary placeholder:text-text-light focus:border-primary focus:outline-none"
            :class="{ 'border-danger': errors.comments }"
          ></textarea>
          <div class="flex justify-between">
            <p v-if="errors.comments" class="text-xs text-danger">{{ $t(errors.comments) }}</p>
            <p class="ml-auto rtl:ml-0 rtl:mr-auto text-xs text-text-light">{{ form.comments.length }}/500</p>
          </div>
        </div>

        <!-- Admin-only fields -->
        <div v-if="canEditStatus" class="flex flex-col gap-4 rounded-xl border border-border bg-bg-secondary p-3">
          <p class="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-text-light">
            <Icon icon="lucide:shield" class="h-3.5 w-3.5" /> {{ $t('nav.roles.super_admin') }}
          </p>

          <!-- Alwaseet Company -->
          <div class="flex flex-col gap-1">
            <label for="edit-alwaseet" class="text-sm font-medium text-text-primary">{{ $t('modal.fields.intermediary') }}</label>
            <textarea
              id="edit-alwaseet"
              v-model="form.problemDescription"
              :placeholder="$t('modal.fields.intermediaryPlaceholder')"
              rows="2"
              class="w-full resize-none rounded-lg border border-border bg-white px-3 py-2.5 text-sm text-text-primary placeholder:text-text-light focus:border-primary focus:outline-none"
              :class="{ 'border-danger': errors.problemDescription }"
            ></textarea>
            <p v-if="errors.problemDescription" class="text-xs text-danger">{{ $t(errors.problemDescription) }}</p>
          </div>

          <!-- Status -->
          <div class="flex flex-col gap-1">
            <label for="edit-status" class="text-sm font-medium text-text-primary">{{ $t('modal.fields.status') }} <span class="text-danger">*</span></label>
            <select
              id="edit-status"
              v-model="form.status"
              class="w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm text-text-primary focus:border-primary focus:outline-none"
              :class="{ 'border-danger': errors.status }"
            >
              <option value="Pending">{{ $t('ticket.status.Pending') }}</option>
              <option value="Reopened">{{ $t('ticket.status.Reopened') }}</option>
              <option value="Replied">{{ $t('ticket.status.Replied') }}</option>
              <option value="Complete">{{ $t('ticket.status.Complete') }}</option>
            </select>
            <p v-if="errors.status" class="text-xs text-danger">{{ $t(errors.status) }}</p>
          </div>
        </div>

        <p v-if="submitError" class="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-danger">
          <Icon icon="lucide:alert-circle" class="h-4 w-4 flex-shrink-0" /> {{ submitError }}
        </p>

        <!-- Actions -->
        <div class="flex gap-2 pt-1">
          <button
            type="submit"
            :disabled="isSubmitting"
            class="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-primary/90 disabled:opacity-60"
          >
            <Icon v-if="isSubmitting" icon="lucide:loader-2" class="h-4 w-4 animate-spin" />
            {{ isSubmitting ? $t('modal.buttons.updating') : $t('common.save') }}
          </button>
          <button
            type="button"
            @click="closeModal"
            class="flex-1 rounded-lg bg-gray-100 px-4 py-2.5 text-sm font-medium text-text-secondary transition-colors hover:bg-gray-200"
          >
            {{ $t('common.cancel') }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { Icon } from '@iconify/vue';
import { useTicketStore } from '../stores/ticketStore';
import { useAuthStore } from '../stores/authStore';
import { validateTicketForm } from '../utils/validators';
import { useModalClose } from '../composables/useModalClose';

const props = defineProps({
  ticket: { type: Object, required: true }
});

const emit = defineEmits(['close', 'updated']);

const ticketStore = useTicketStore();
const authStore = useAuthStore();

// Only super admins may change status / Alwaseet Company through the edit modal.
const canEditStatus = computed(() => authStore.isSuperAdmin);

const form = ref({
  missdn: '',
  problemDescription: '',
  governorate: '',
  comments: '',
  status: ''
});

const errors = ref({});
const isSubmitting = ref(false);
const submitError = ref('');

const governorates = [
  'بغداد', 'البصرة', 'الموصل', 'كركوك',
  'الأنبار', 'صلاح الدين', 'ديالى', 'واسط', 'بابل', 'كربلاء', 'النجف',
  'المثنى', 'ذي قار', 'ميسان', 'نينوى'
];

const closeModal = () => emit('close');
useModalClose(closeModal);

onMounted(() => {
  form.value = {
    missdn: props.ticket.missdn,
    problemDescription: props.ticket.problemDescription || '',
    governorate: props.ticket.governorate,
    comments: props.ticket.comments || '',
    status: props.ticket.status
  };
});

const handleSubmit = async () => {
  errors.value = {};
  submitError.value = '';
  const validationErrors = validateTicketForm(form.value);
  if (Object.keys(validationErrors).length > 0) {
    errors.value = validationErrors;
    return;
  }

  isSubmitting.value = true;
  const result = await ticketStore.updateTicket(props.ticket.id, form.value);
  isSubmitting.value = false;

  if (!result) {
    submitError.value = ticketStore.error || 'Unable to update ticket';
    return;
  }

  setTimeout(() => emit('updated'), 300);
};

const normalizeDigits = (s) => {
  if (!s) return s;
  return s.replace(/[\u0660-\u0669\u06F0-\u06F9]/g, (d) => String(d.charCodeAt(0) & 0xF));
};

const onMissdnInput = (e) => {
  let v = e.target.value || '';
  v = normalizeDigits(v);
  v = v.replace(/\D/g, '').slice(0, 10);
  form.value.missdn = v;
};
</script>
