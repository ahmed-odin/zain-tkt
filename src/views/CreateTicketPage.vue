<template>
  <div>
    <div class="mx-auto mb-5 max-w-xl">
      <h2 class="text-h2 font-bold">{{ $t('pages.createTitle') }}</h2>
    </div>
    <CreateTicketModal inline @created="onCreated" @close="onClose" />
  </div>
</template>

<script setup>
import CreateTicketModal from '../components/CreateTicketModal.vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const onCreated = () => {
  router.push('/pending');
};

const onClose = () => {
  router.push('/pending');
};
</script>
