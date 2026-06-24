<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-40">
    <div class="bg-white rounded-modal shadow-modal w-full max-w-md sm:max-w-lg md:max-w-2xl max-h-[90vh] overflow-y-auto">
      <!-- Header -->
      <div class="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-white z-10">
        <h2 class="text-h2 font-bold text-text-primary">{{ $t('modal.editTitle', { id: ticket.id }) }}</h2>
        <button
          @click="emit('close')"
          class="p-2 hover:bg-bg-secondary rounded-btn transition-all duration-base rtl:rotate-0"
        >
          <svg class="w-5 h-5 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>

      <!-- Form -->
      <form @submit.prevent="handleSubmit" class="p-6 flex flex-col gap-3 sm:gap-4">
        <!-- MISSDN Input -->
        <div>
          <label for="missdn" class="block text-body font-medium text-text-primary mb-2">
            {{ $t('modal.fields.title') }}
            <span class="text-danger">*</span>
          </label>
          <input
            id="missdn"
            v-model="form.missdn"
            type="text"
            :placeholder="$t('modal.fields.titlePlaceholder')"
            inputmode="numeric"
            pattern="[0-9]{10}"
            maxlength="10"
            @input="onMissdnInput"
            class="w-full px-3 py-2 border border-border rounded-btn focus:outline-none focus:border-primary focus:ring-2 focus:ring-blue-100 transition-all duration-fast"
            :class="{ 'border-danger': errors.missdn }"
          />
          <div class="flex justify-between mt-1">
            <p v-if="errors.missdn" class="text-danger text-small">{{ $t(errors.missdn) }}</p>
            <p class="text-text-secondary text-small ml-auto rtl:ml-0 rtl:mr-auto">{{ form.missdn.length }}/10</p>
          </div>
        </div>

        <!-- Governorate Dropdown -->
        <div>
          <label for="governorate" class="block text-body font-medium text-text-primary mb-2">
            {{ $t('modal.fields.governorate') }}
            <span class="text-danger">*</span>
          </label>
          <select
            id="governorate"
            v-model="form.governorate"
            class="w-full px-3 py-2 border border-border rounded-btn focus:outline-none focus:border-primary focus:ring-2 focus:ring-blue-100 transition-all duration-fast"
            :class="{ 'border-danger': errors.governorate }"
          >
            <option value="">{{ $t('common.selectGovernorate') }}</option>
            <option v-for="gov in governorates" :key="gov" :value="gov">{{ gov }}</option>
          </select>
          <p v-if="errors.governorate" class="text-danger text-small mt-1">{{ $t(errors.governorate) }}</p>
        </div>

        <!-- Comments Textarea (FIRST textarea) -->
        <div>
          <label for="comments" class="block text-body font-medium text-text-primary mb-2">
            {{ $t('modal.fields.comments') }}
          </label>
          <textarea
            id="comments"
            v-model="form.comments"
            placeholder="Add any additional details..."
            maxlength="500"
            rows="4"
            class="w-full px-3 py-2 border border-border rounded-btn focus:outline-none focus:border-primary focus:ring-2 focus:ring-blue-100 transition-all duration-fast resize-none"
            :class="{ 'border-danger': errors.comments }"
          ></textarea>
          <div class="flex justify-between mt-1">
            <p v-if="errors.comments" class="text-danger text-small">{{ $t(errors.comments) }}</p>
            <p class="text-text-secondary text-small ml-auto rtl:ml-0 rtl:mr-auto">{{ form.comments.length }}/500</p>
          </div>
        </div>

        <!-- Governorate Dropdown -->
        <div>
          <label for="governorate" class="block text-body font-medium text-text-primary mb-2">
            {{ $t('modal.fields.governorate') }}
            <span class="text-danger">*</span>
          </label>
          <select
            id="governorate"
            v-model="form.governorate"
            class="w-full px-3 py-2 border border-border rounded-btn focus:outline-none focus:border-primary focus:ring-2 focus:ring-blue-100 transition-all duration-fast"
            :class="{ 'border-danger': errors.governorate }"
          >
            <option value="">{{ $t('common.selectGovernorate') }}</option>
            <option v-for="gov in governorates" :key="gov" :value="gov">{{ gov }}</option>
          </select>
          <p v-if="errors.governorate" class="text-danger text-small mt-1">{{ $t(errors.governorate) }}</p>
        </div>

        <!-- Intermediary Comment (LAST textarea, REQUIRED) -->
        <div>
          <label for="problemDescription" class="block text-body font-medium text-text-primary mb-2">
            {{ $t('modal.fields.intermediary') }}
          </label>
          <textarea
            id="problemDescription"
            v-model="form.problemDescription"
            placeholder="Describe the issue or problem..."
            maxlength="1000"
            rows="6"
            class="w-full px-3 py-2 border border-border rounded-btn focus:outline-none focus:border-primary focus:ring-2 focus:ring-blue-100 transition-all duration-fast resize-none hover:shadow"
            :class="{ 'border-danger': errors.problemDescription }"
          ></textarea>
          <div class="flex justify-between mt-1 items-center">
            <p v-if="errors.problemDescription" class="text-danger text-small">{{ $t(errors.problemDescription) }}</p>
            <p :class="counterClass(form.problemDescription.length)" class="text-small ml-auto rtl:ml-0 rtl:mr-auto">{{ form.problemDescription.length }} / 1000</p>
          </div>
        </div>

        <!-- Status Dropdown -->
        <div>
          <label for="status" class="block text-body font-medium text-text-primary mb-2">
            {{ $t('modal.fields.status') }}
            <span class="text-danger">*</span>
          </label>
          <select
            id="status"
            v-model="form.status"
            class="w-full px-3 py-2 border border-border rounded-btn focus:outline-none focus:border-primary focus:ring-2 focus:ring-blue-100 transition-all duration-fast"
            :class="{ 'border-danger': errors.status }"
          >
            <option value="Pending">{{ $t('ticket.status.Pending') }}</option>
            <option value="Complete">{{ $t('ticket.status.Complete') }}</option>
          </select>
          <p v-if="errors.status" class="text-danger text-small mt-1">{{ $t(errors.status) }}</p>
        </div>

        <!-- Form Actions -->
        <div class="flex gap-3 mt-4">
          <button
            type="submit"
            :disabled="isSubmitting"
            class="flex-1 bg-primary hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-btn transition-all duration-base hover:shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <span v-if="!isSubmitting">{{ $t('common.edit') }}</span>
            <span v-else class="flex items-center gap-2">
              <svg class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ $t('modal.buttons.updating') }}
            </span>
          </button>
          <button
            type="button"
            @click="emit('close')"
            class="flex-1 bg-border hover:bg-border-accent text-text-primary font-medium py-2 px-4 rounded-btn transition-all duration-base"
          >
            {{ $t('common.cancel') }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useTicketStore } from '../stores/ticketStore';
import { useAuthStore } from '../stores/authStore';
import { validateTicketForm } from '../utils/validators';

const props = defineProps({
  ticket: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['close', 'updated']);

const ticketStore = useTicketStore();
const authStore = useAuthStore();

const form = ref({
  missdn: '',
  problemDescription: '',
  governorate: '',
  comments: '',
  status: ''
});

const errors = ref({});
const isSubmitting = ref(false);

const governorates = [
  'بغداد', 'البصرة', 'الموصل', 'كركوك', 'أربيل', 'السليمانية', 'دهوك',
  'الأنبار', 'صلاح الدين', 'ديالى', 'واسط', 'بابل', 'كربلاء', 'النجف',
  'المثنى', 'ذي قار', 'ميسان', 'نينوى'
];

onMounted(() => {
  // Pre-populate form with ticket data
  form.value = {
    missdn: props.ticket.missdn,
    problemDescription: props.ticket.problemDescription || '',
    governorate: props.ticket.governorate,
    comments: props.ticket.comments,
    status: props.ticket.status
  };
});

const counterClass = (len) => {
  const pct = (len / 1000) * 100;
  if (pct > 95) return 'text-danger';
  if (pct >= 80) return 'text-warning';
  return 'text-text-secondary';
};

const handleSubmit = async () => {
  errors.value = {};

  // Validate form
  const validationErrors = validateTicketForm(form.value);
  if (Object.keys(validationErrors).length > 0) {
    errors.value = validationErrors;
    return;
  }

  isSubmitting.value = true;

  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 300));

  // Update ticket
  ticketStore.updateTicket(props.ticket.id, form.value, authStore.currentUser);

  isSubmitting.value = false;

  // Close modal after 300ms
  setTimeout(() => {
    emit('updated');
  }, 300);
};

const normalizeDigits = (s) => {
  if (!s) return s;
  return s.replace(/[\u0660-\u0669\u06F0-\u06F9]/g, (d) => {
    return String(d.charCodeAt(0) & 0xF);
  });
};

const onMissdnInput = (e) => {
  let v = e.target.value || '';
  v = normalizeDigits(v);
  v = v.replace(/\D/g, '').slice(0, 10);
  form.value.missdn = v;
};
</script>
