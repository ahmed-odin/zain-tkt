<template>
  <div>
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
