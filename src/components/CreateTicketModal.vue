<template>
  <div
    :class="inline ? '' : 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-40'"
    @click.self="!inline && closeModal()"
  >
    <div
      :class="[
        'w-full bg-white',
        inline
          ? 'mx-auto max-w-xl rounded-2xl border border-border shadow-card'
          : 'relative max-w-lg rounded-2xl shadow-modal'
      ]"
      @click.stop
    >
      <!-- Header -->
      <div class="flex items-start gap-3 border-b border-border p-5">
        <div class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-bg-tertiary text-primary">
          <Icon icon="lucide:ticket-plus" class="h-5 w-5" />
        </div>
        <div class="min-w-0">
          <h2 class="text-lg font-bold text-text-primary">{{ $t('modal.createTitle') }}</h2>
          <p class="text-sm text-text-secondary">{{ $t('create.subtitle') }}</p>
        </div>
        <button
          v-if="!inline"
          @click="closeModal"
          class="ml-auto rtl:ml-0 rtl:mr-auto text-text-light hover:text-text-secondary"
          aria-label="Close"
        >
          <Icon icon="lucide:x" class="h-5 w-5" />
        </button>
      </div>

      <form @submit.prevent="handleSubmit" class="flex flex-col gap-4 p-5">
        <!-- MISSDN -->
        <div class="flex flex-col gap-1">
          <label for="create-missdn" class="text-sm font-medium text-text-primary">
            {{ $t('modal.fields.title') }} <span class="text-danger">*</span>
          </label>
          <div class="relative">
            <Icon icon="lucide:phone" class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-light rtl:left-auto rtl:right-3" />
            <input
              id="create-missdn"
              v-model="form.missdn"
              type="text"
              :placeholder="$t('modal.fields.titlePlaceholder')"
              inputmode="numeric"
              maxlength="10"
              @input="onMissdnInput"
              class="w-full rounded-lg border border-border bg-white py-2.5 pl-9 pr-3 font-mono text-sm text-text-primary placeholder:text-text-light placeholder:font-sans focus:border-primary focus:outline-none rtl:pl-3 rtl:pr-9"
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
          <label for="create-governorate" class="text-sm font-medium text-text-primary">
            {{ $t('modal.fields.governorate') }} <span class="text-danger">*</span>
          </label>
          <select
            id="create-governorate"
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
          <label for="create-comments" class="text-sm font-medium text-text-primary">
            {{ $t('modal.fields.comments') }} <span class="text-danger">*</span>
          </label>
          <textarea
            id="create-comments"
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

        <!-- Status note -->
        <div class="flex items-center gap-2 rounded-lg bg-bg-secondary px-3 py-2.5 text-sm text-text-secondary">
          <Icon icon="lucide:info" class="h-4 w-4 flex-shrink-0 text-text-light" />
          <span>{{ $t('modal.fields.statusDefaultMsg') }}</span>
        </div>

        <!-- Submission error -->
        <div v-if="submissionError" class="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-danger">
          <Icon icon="lucide:alert-circle" class="h-4 w-4 flex-shrink-0" />
          {{ submissionError }}
        </div>

        <!-- Actions -->
        <div class="flex gap-2 pt-1">
          <button
            type="submit"
            :disabled="isSubmitting || !isFormValid"
            class="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Icon v-if="isSubmitting" icon="lucide:loader-2" class="h-4 w-4 animate-spin" />
            <Icon v-else icon="lucide:plus" class="h-4 w-4" />
            {{ isSubmitting ? $t('modal.buttons.creating') : $t('common.create') }}
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
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { Icon } from '@iconify/vue';
import { useTicketStore } from '../stores/ticketStore';
import { useAuthStore } from '../stores/authStore';
import { validateTicketForm, validateMissdn, validateGovernorate } from '../utils/validators';

const props = defineProps({
  inline: { type: Boolean, default: false }
});

const emit = defineEmits(['close', 'created']);

const ticketStore = useTicketStore();
const authStore = useAuthStore();

const form = ref({
  missdn: '',
  governorate: '',
  comments: '',
  status: 'Pending'
});

const errors = ref({});
const isSubmitting = ref(false);
const submissionError = ref('');

const governorates = [
  'بغداد', 'البصرة', 'الموصل', 'كركوك',
  'الأنبار', 'صلاح الدين', 'ديالى', 'واسط', 'بابل', 'كربلاء', 'النجف',
  'المثنى', 'ذي قار', 'ميسان', 'نينوى'
];

const isFormValid = computed(() => {
  return !validateMissdn(form.value.missdn)
    && !validateGovernorate(form.value.governorate);
});

const closeModal = () => emit('close');

const handleEscape = (e) => {
  if (!props.inline && e.key === 'Escape') closeModal();
};

onMounted(() => {
  if (!props.inline) document.addEventListener('keydown', handleEscape);
});

onUnmounted(() => {
  if (!props.inline) document.removeEventListener('keydown', handleEscape);
});

const handleSubmit = async () => {
  errors.value = {};
  submissionError.value = '';
  const validationErrors = validateTicketForm(form.value);
  if (Object.keys(validationErrors).length > 0) {
    errors.value = validationErrors;
    return;
  }

  isSubmitting.value = true;
  const ticket = await ticketStore.createTicket(form.value);
  isSubmitting.value = false;

  if (!ticket) {
    submissionError.value = ticketStore.error || 'Unable to create ticket';
    return;
  }

  setTimeout(() => emit('created'), 300);
};

const normalizeDigits = (s) => {
  if (!s) return s;
  return s.replace(/[٠-٩۰-۹]/g, (d) => String(d.charCodeAt(0) & 0xF));
};

const onMissdnInput = (e) => {
  let v = e.target.value || '';
  v = normalizeDigits(v);
  v = v.replace(/\D/g, '').slice(0, 10);
  form.value.missdn = v;
};
</script>
