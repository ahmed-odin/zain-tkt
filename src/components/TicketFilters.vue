<template>
  <div class="mb-4 flex flex-wrap items-end gap-3 rounded-xl border border-border bg-white p-3 shadow-card">
    <div class="flex flex-col gap-1">
      <label class="text-xs font-medium text-text-secondary">{{ $t('common.dateFrom') }}</label>
      <input
        type="date"
        v-model="dateFrom"
        class="rounded-lg border border-border bg-white px-2.5 py-1.5 text-sm text-text-primary focus:border-primary focus:outline-none"
      />
    </div>
    <div class="flex flex-col gap-1">
      <label class="text-xs font-medium text-text-secondary">{{ $t('common.dateTo') }}</label>
      <input
        type="date"
        v-model="dateTo"
        class="rounded-lg border border-border bg-white px-2.5 py-1.5 text-sm text-text-primary focus:border-primary focus:outline-none"
      />
    </div>
    <div class="flex flex-col gap-1">
      <label class="text-xs font-medium text-text-secondary">{{ $t('common.filterByUsername') }}</label>
      <SearchableSelect
        v-model="userFilter"
        :options="usernames"
        :placeholder="$t('common.usernamePlaceholder')"
      />
    </div>
    <div class="flex flex-col gap-1">
      <label class="text-xs font-medium text-text-secondary">{{ $t('common.filterByGovernorate') }}</label>
      <select
        v-model="governorate"
        class="min-w-[10rem] rounded-lg border border-border bg-white px-2.5 py-1.5 text-sm text-text-primary focus:border-primary focus:outline-none"
      >
        <option value="">{{ $t('common.allGovernorates') }}</option>
        <option v-for="g in governorates" :key="g" :value="g">{{ g }}</option>
      </select>
    </div>
    <button
      v-if="hasActiveFilters"
      type="button"
      @click="emit('reset')"
      class="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm text-text-secondary transition-colors hover:border-danger hover:text-danger"
    >
      <Icon icon="lucide:x" class="h-4 w-4" /> {{ $t('common.resetFilters') }}
    </button>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { Icon } from '@iconify/vue';
import SearchableSelect from './SearchableSelect.vue';

const dateFrom = defineModel('dateFrom', { type: String, default: '' });
const dateTo = defineModel('dateTo', { type: String, default: '' });
const userFilter = defineModel('userFilter', { type: String, default: '' });
const governorate = defineModel('governorate', { type: String, default: '' });

const props = defineProps({
  users: { type: Array, default: () => [] },
  governorates: { type: Array, default: () => [] },
  hasActiveFilters: { type: Boolean, default: false }
});

// Distinct usernames for the searchable dropdown.
const usernames = computed(() => {
  const set = new Set();
  props.users.forEach((u) => { if (u?.name) set.add(u.name); });
  return Array.from(set).sort((a, b) => a.localeCompare(b));
});

const emit = defineEmits(['reset']);
</script>
