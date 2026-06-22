<template>
  <div class="bg-white rounded-card shadow-card p-6 border border-border">
    <div class="flex items-start gap-4">
      <div :class="[
        'p-3 rounded-lg',
        color
      ]">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
        </svg>
      </div>
      <div class="flex-1">
        <p class="text-text-secondary text-small font-medium">{{ title }}</p>
        <p class="text-h2 font-bold" :class="textColor">{{ count }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    required: true
  },
  count: {
    type: Number,
    required: true
  },
  icon: {
    type: String,
    required: true
  },
  color: {
    type: String,
    default: 'bg-blue-100'
  },
  textColor: {
    type: String,
    default: 'text-primary'
  }
});
</script>

