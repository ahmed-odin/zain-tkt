<template>
  <div
    :class="inline ? '' : 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-40'"
    @click.self="!inline && closeModal()"
  >
      <div
        :class="[
          inline
            ? 'w-full max-w-md bg-white rounded-lg p-4 max-h-[85vh] overflow-hidden flex flex-col'
            : 'w-full max-w-md bg-white rounded-lg p-4 max-h-[85vh] overflow-hidden flex flex-col'
        ]"
        @click.stop
      >
      <button
        v-if="!inline"
        @click="closeModal"
        class="absolute top-4 right-4 rtl:right-auto rtl:left-4 text-gray-500 hover:text-gray-700 text-2xl cursor-pointer leading-none"
        aria-label="Close"
      >
        ✕
      </button>

      <h2
        :class="[
          'text-lg font-bold text-text-primary mb-3',
          !inline ? 'pr-8 rtl:pr-0 rtl:pl-8' : ''
        ]"
      >
        {{ $t('modal.createTitle') }}
      </h2>

      <form @submit.prevent="handleSubmit" class="flex-1 flex flex-col gap-1.5 text-sm">
        <!-- MISSDN -->
        <div>
          <div class="flex flex-col gap-0.5">
            <label for="create-missdn" class="text-xs font-semibold" style="color:#5E35B1">{{ $t('modal.fields.title') }} <span class="text-danger">*</span></label>
            <input
              id="create-missdn"
              v-model="form.missdn"
              type="text"
              :placeholder="$t('modal.fields.titlePlaceholder')"
              inputmode="numeric"
              maxlength="10"
              @input="onMissdnInput"
              class="w-full px-2 py-1 text-sm bg-purple-100 border border-purple-300 rounded-md focus:bg-purple-50 focus:border-purple-600 focus:outline-none focus:ring-1 focus:ring-purple-600 transition-all"
              :class="{ 'border-danger': errors.missdn }"
            />
            <div class="flex justify-between mt-0.5">
              <p v-if="errors.missdn" class="text-danger text-xs">{{ $t(errors.missdn) }}</p>
              <p class="text-text-secondary text-xs ml-auto rtl:ml-0 rtl:mr-auto">{{ form.missdn.length }}/10</p>
            </div>
          </div>
        </div>

        <!-- Comments -->
        <div class="flex flex-col gap-0.5">
          <label for="create-comments" class="text-xs font-semibold" style="color:#5E35B1">{{ $t('modal.fields.comments') }}</label>
          <textarea
            id="create-comments"
            v-model="form.comments"
            :placeholder="$t('modal.fields.commentsPlaceholder')"
            maxlength="500"
            rows="3"
            class="w-full px-2 py-1 text-sm bg-purple-100 border border-purple-300 rounded-md resize-none focus:bg-purple-50 focus:border-purple-600 focus:outline-none focus:ring-1 focus:ring-purple-600 transition-all"
            :class="{ 'border-danger': errors.comments }"
          ></textarea>
          <div class="flex justify-between mt-0.5">
            <p v-if="errors.comments" class="text-danger text-xs">{{ $t(errors.comments) }}</p>
            <p class="text-text-secondary text-xs ml-auto rtl:ml-0 rtl:mr-auto">{{ form.comments.length }}/500</p>
          </div>
        </div>

        <!-- Governorate -->
        <div class="flex flex-col gap-0.5">
          <label for="create-governorate" class="text-xs font-semibold" style="color:#5E35B1">{{ $t('modal.fields.governorate') }} <span class="text-danger">*</span></label>
          <select
            id="create-governorate"
            v-model="form.governorate"
            class="w-full px-2 py-1 text-sm bg-purple-100 border border-purple-300 rounded-md focus:bg-purple-50 focus:border-purple-600 focus:outline-none focus:ring-1 focus:ring-purple-600 transition-all"
            :class="{ 'border-danger': errors.governorate }"
          >
            <option value="">{{ $t('common.selectGovernorate') }}</option>
            <option v-for="gov in governorates" :key="gov" :value="gov">{{ gov }}</option>
          </select>
          <p v-if="errors.governorate" class="text-danger text-xs mt-0.5">{{ $t(errors.governorate) }}</p>
        </div>

        <!-- removed Alwaseet Company from Create -->

        <!-- Status -->
        <div class="flex flex-col gap-0.5">
          <label for="create-status" class="text-xs font-semibold" style="color:#1565C0">{{ $t('modal.fields.initialStatus') }}</label>
          <select
            id="create-status"
            v-model="form.status"
            disabled
            class="w-full px-2 py-1 text-sm bg-blue-100 border border-blue-300 rounded-md focus:bg-blue-50 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 cursor-not-allowed opacity-80"
          >
            <option value="Pending">{{ $t('ticket.status.Pending') }}</option>
          </select>
        </div>

        <!-- Submission error -->
        <div v-if="submissionError" class="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {{ submissionError }}
        </div>

        <!-- Actions -->
        <div class="flex gap-2 mt-2">
          <button
            type="submit"
            :disabled="isSubmitting || !isFormValid"
            class="flex-1 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span v-if="!isSubmitting">{{ $t('common.create') }}</span>
            <span v-else>{{ $t('modal.buttons.creating') }}</span>
          </button>
          <button
            type="button"
            @click="closeModal"
            class="flex-1 px-3 py-1.5 bg-gray-200 text-gray-700 text-sm rounded-md hover:bg-gray-300 transition-colors"
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
  return s.replace(/[\u0660-\u0669\u06F0-\u06F9]/g, (d) => String(d.charCodeAt(0) & 0xF));
};

const onMissdnInput = (e) => {
  let v = e.target.value || '';
  v = normalizeDigits(v);
  v = v.replace(/\D/g, '').slice(0, 10);
  form.value.missdn = v;
};
</script>
