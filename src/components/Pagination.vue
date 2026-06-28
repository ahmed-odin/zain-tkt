<template>
  <div class="flex flex-col items-center justify-between gap-3 px-2 py-3 sm:flex-row">
    <!-- Range + page size -->
    <div class="flex items-center gap-3 text-sm text-text-secondary">
      <span>{{ $t('pagination.showing', { from: rangeFrom, to: rangeTo, total }) }}</span>
      <label class="flex items-center gap-1.5">
        <span class="hidden sm:inline">{{ $t('pagination.perPage') }}</span>
        <select
          :value="pageSize"
          @change="emit('update:pageSize', Number($event.target.value))"
          class="rounded-lg border border-border bg-white px-2 py-1 text-sm focus:border-primary focus:outline-none"
        >
          <option v-for="size in pageSizeOptions" :key="size" :value="size">{{ size }}</option>
        </select>
      </label>
    </div>

    <!-- Page buttons -->
    <nav class="flex items-center gap-1">
      <button
        type="button"
        :disabled="page <= 1"
        @click="emit('update:page', page - 1)"
        class="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-text-secondary transition-colors hover:bg-bg-secondary disabled:cursor-not-allowed disabled:opacity-40"
        :aria-label="$t('pagination.prev')"
      >
        <Icon icon="lucide:chevron-right" class="h-4 w-4 rtl:hidden" />
        <Icon icon="lucide:chevron-left" class="hidden h-4 w-4 rtl:block" />
      </button>

      <template v-for="(item, idx) in items" :key="idx">
        <span v-if="item === '...'" class="px-2 text-gray-400">…</span>
        <button
          v-else
          type="button"
          @click="emit('update:page', item)"
          class="flex h-8 min-w-8 items-center justify-center rounded-lg border px-2 text-sm transition-colors"
          :class="item === page
            ? 'border-primary bg-primary text-white'
            : 'border-border text-text-secondary hover:bg-bg-secondary'"
        >
          {{ item }}
        </button>
      </template>

      <button
        type="button"
        :disabled="page >= totalPages"
        @click="emit('update:page', page + 1)"
        class="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-text-secondary transition-colors hover:bg-bg-secondary disabled:cursor-not-allowed disabled:opacity-40"
        :aria-label="$t('pagination.next')"
      >
        <Icon icon="lucide:chevron-left" class="h-4 w-4 rtl:hidden" />
        <Icon icon="lucide:chevron-right" class="hidden h-4 w-4 rtl:block" />
      </button>
    </nav>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { Icon } from '@iconify/vue';

const props = defineProps({
  page: { type: Number, required: true },
  totalPages: { type: Number, required: true },
  pageSize: { type: Number, default: 20 },
  total: { type: Number, default: 0 },
  pageSizeOptions: { type: Array, default: () => [10, 20, 50, 100] }
});

const emit = defineEmits(['update:page', 'update:pageSize']);

const rangeFrom = computed(() => (props.total === 0 ? 0 : (props.page - 1) * props.pageSize + 1));
const rangeTo = computed(() => Math.min(props.page * props.pageSize, props.total));

// Build "1 … 4 5 6 … 10" with the current page surrounded by neighbours.
const items = computed(() => {
  const total = props.totalPages;
  const current = props.page;
  const delta = 1;

  if (total <= 1) return [1];

  const range = [];
  for (let i = Math.max(2, current - delta); i <= Math.min(total - 1, current + delta); i++) {
    range.push(i);
  }

  const result = [1];
  if (range.length && range[0] > 2) result.push('...');
  result.push(...range);
  if (range.length && range[range.length - 1] < total - 1) result.push('...');
  result.push(total);
  return result;
});
</script>
