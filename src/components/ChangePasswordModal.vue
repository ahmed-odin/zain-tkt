<template>
  <div
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-40"
    @click.self="closeModal"
  >
    <div class="relative w-full max-w-sm bg-white rounded-lg p-5" @click.stop>
      <button
        @click="closeModal"
        class="absolute top-4 right-4 rtl:right-auto rtl:left-4 text-gray-500 hover:text-gray-700 text-2xl cursor-pointer leading-none"
        aria-label="Close"
      >
        ✕
      </button>

      <h2 class="text-lg font-bold text-text-primary mb-1 pr-8 rtl:pr-0 rtl:pl-8">
        {{ $t('users.changePassword') }}
      </h2>
      <p class="text-xs text-text-secondary mb-4">{{ user.name }}</p>

      <form @submit.prevent="handleSubmit" class="flex flex-col gap-3 text-sm">
        <div class="flex flex-col gap-1">
          <label class="text-xs font-medium text-text-secondary">{{ $t('users.password') }} <span class="text-danger">*</span></label>
          <input
            v-model="password"
            type="password"
            autocomplete="new-password"
            class="rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
            :class="{ 'border-danger': error }"
          />
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-xs font-medium text-text-secondary">{{ $t('users.confirmPassword') }} <span class="text-danger">*</span></label>
          <input
            v-model="confirm"
            type="password"
            autocomplete="new-password"
            class="rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
            :class="{ 'border-danger': error }"
          />
          <p v-if="error" class="text-xs text-danger">{{ $t(error) }}</p>
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
import { ref } from 'vue';
import { useUserStore } from '../stores/userStore';
import { useModalClose } from '../composables/useModalClose';

const props = defineProps({
  user: { type: Object, required: true }
});

const emit = defineEmits(['close', 'saved']);

const userStore = useUserStore();
const password = ref('');
const confirm = ref('');
const error = ref('');
const submitError = ref('');
const isSubmitting = ref(false);

const closeModal = () => emit('close');
useModalClose(closeModal);

const handleSubmit = async () => {
  error.value = '';
  submitError.value = '';
  if (password.value.length < 6) { error.value = 'validation.minPassword'; return; }
  if (password.value !== confirm.value) { error.value = 'validation.passwordMismatch'; return; }

  isSubmitting.value = true;
  const result = await userStore.updateUser(props.user.id, { password: password.value });
  isSubmitting.value = false;

  if (result) emit('saved');
  else submitError.value = userStore.error || 'Unable to change password';
};
</script>
