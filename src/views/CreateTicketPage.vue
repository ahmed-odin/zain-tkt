<template>
  <div class="p-6">
    <h2 class="text-h2 font-bold mb-4">{{ $t('pages.createTitle') }}</h2>
    <CreateTicketModal @created="onCreated" />
  </div>
</template>

<script setup>
import CreateTicketModal from '../components/CreateTicketModal.vue';
import { useRouter } from 'vue-router';
const router = useRouter();
const onCreated = () => {
  router.push('/pending');
};
</script>
