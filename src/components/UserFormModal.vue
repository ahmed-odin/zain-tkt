<template>
  <div
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-40"
    @click.self="closeModal"
  >
    <div class="relative w-full max-w-md bg-white rounded-lg p-5" @click.stop>
      <button
        @click="closeModal"
        class="absolute top-4 right-4 rtl:right-auto rtl:left-4 text-gray-500 hover:text-gray-700 text-2xl cursor-pointer leading-none"
        aria-label="Close"
      >
        ✕
      </button>

      <h2 class="text-lg font-bold text-text-primary mb-4 pr-8 rtl:pr-0 rtl:pl-8">
        {{ isEdit ? $t('users.editUser') : $t('users.addUser') }}
      </h2>

      <form @submit.prevent="handleSubmit" class="flex flex-col gap-3 text-sm">
        <div class="flex flex-col gap-1">
          <label class="text-xs font-medium text-text-secondary">{{ $t('users.name') }} <span class="text-danger">*</span></label>
          <input
            v-model="form.name"
            type="text"
            class="rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
            :class="{ 'border-danger': errors.name }"
          />
          <p v-if="errors.name" class="text-xs text-danger">{{ $t(errors.name) }}</p>
        </div>

        <div class="flex flex-col gap-1">
          <label class="text-xs font-medium text-text-secondary">{{ $t('users.email') }} <span class="text-danger">*</span></label>
          <input
            v-model="form.email"
            type="email"
            class="rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
            :class="{ 'border-danger': errors.email }"
          />
          <p v-if="errors.email" class="text-xs text-danger">{{ $t(errors.email) }}</p>
        </div>

        <div class="flex flex-col gap-1">
          <label class="text-xs font-medium text-text-secondary">{{ $t('users.phone') }}</label>
          <input
            v-model="form.phone"
            type="text"
            class="rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
          />
        </div>

        <div class="flex flex-col gap-1">
          <label class="text-xs font-medium text-text-secondary">{{ $t('users.role') }} <span class="text-danger">*</span></label>
          <select
            v-model="form.role"
            class="rounded-lg border border-border bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none"
          >
            <option value="user">{{ $t('nav.roles.user') }}</option>
            <option value="staff">{{ $t('nav.roles.staff') }}</option>
            <option value="super_admin">{{ $t('nav.roles.super_admin') }}</option>
          </select>
        </div>

        <div v-if="!isEdit" class="flex flex-col gap-1">
          <label class="text-xs font-medium text-text-secondary">{{ $t('users.password') }} <span class="text-danger">*</span></label>
          <input
            v-model="form.password"
            type="password"
            autocomplete="new-password"
            class="rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
            :class="{ 'border-danger': errors.password }"
          />
          <p v-if="errors.password" class="text-xs text-danger">{{ $t(errors.password) }}</p>
        </div>

        <p v-if="submitError" class="rounded-md bg-red-50 p-2 text-xs text-danger">{{ submitError }}</p>

        <div class="flex gap-2 mt-2">
          <button
            type="submit"
            :disabled="isSubmitting"
            class="flex-1 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/90 disabled:opacity-60"
          >
            {{ $t('common.save') }}
          </button>
          <button
            type="button"
            @click="closeModal"
            class="flex-1 rounded-lg bg-gray-200 px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-300"
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
import { useUserStore } from '../stores/userStore';
import { useModalClose } from '../composables/useModalClose';

const props = defineProps({
  user: { type: Object, default: null }
});

const emit = defineEmits(['close', 'saved']);

const userStore = useUserStore();
const isEdit = computed(() => !!props.user);

const form = ref({
  name: '',
  email: '',
  phone: '',
  role: 'user',
  password: ''
});

const errors = ref({});
const submitError = ref('');
const isSubmitting = ref(false);

const closeModal = () => emit('close');
useModalClose(closeModal);

onMounted(() => {
  if (props.user) {
    form.value = {
      name: props.user.name || '',
      email: props.user.email || '',
      phone: props.user.phone || '',
      role: props.user.role || 'user',
      password: ''
    };
  }
});

const validate = () => {
  const e = {};
  if (!form.value.name.trim()) e.name = 'validation.requiredName';
  if (!form.value.email.trim()) e.email = 'validation.requiredEmail';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.value.email)) e.email = 'validation.invalidEmail';
  if (!isEdit.value && form.value.password.length < 6) e.password = 'validation.minPassword';
  return e;
};

const handleSubmit = async () => {
  submitError.value = '';
  errors.value = validate();
  if (Object.keys(errors.value).length) return;

  isSubmitting.value = true;
  const payload = {
    name: form.value.name.trim(),
    email: form.value.email.trim(),
    phone: form.value.phone.trim() || null,
    role: form.value.role
  };
  if (!isEdit.value) payload.password = form.value.password;

  const result = isEdit.value
    ? await userStore.updateUser(props.user.id, payload)
    : await userStore.createUser(payload);
  isSubmitting.value = false;

  if (result) {
    emit('saved');
  } else {
    submitError.value = userStore.error || 'Unable to save user';
  }
};
</script>
