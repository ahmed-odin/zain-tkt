<template>
  <div ref="root" class="relative">
    <div class="relative">
      <input
        type="text"
        :value="isOpen ? query : modelValue"
        :placeholder="placeholder"
        @focus="open"
        @input="onInput"
        @keydown.escape="close"
        @keydown.enter.prevent="selectFirst"
        class="w-full min-w-[10rem] rounded-lg border border-border bg-white py-1.5 pl-2.5 pr-8 text-sm text-text-primary placeholder:text-text-light focus:border-primary focus:outline-none rtl:pl-8 rtl:pr-2.5"
      />
      <button
        v-if="modelValue"
        type="button"
        @click="clear"
        class="absolute right-2 top-1/2 -translate-y-1/2 text-text-light hover:text-text-secondary rtl:right-auto rtl:left-2"
        aria-label="Clear"
      >
        <Icon icon="lucide:x" class="h-3.5 w-3.5" />
      </button>
      <Icon
        v-else
        icon="lucide:chevron-down"
        class="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-text-light rtl:right-auto rtl:left-2"
      />
    </div>

    <ul
      v-if="isOpen && filtered.length"
      class="absolute z-20 mt-1 max-h-56 w-full overflow-y-auto rounded-lg border border-border bg-white py-1 shadow-card"
    >
      <li
        v-for="option in filtered"
        :key="option"
        @mousedown.prevent="select(option)"
        class="cursor-pointer px-3 py-1.5 text-sm text-text-primary hover:bg-bg-secondary"
        :class="{ 'bg-bg-tertiary text-primary': option === modelValue }"
      >
        {{ option }}
      </li>
    </ul>
    <div
      v-else-if="isOpen && query"
      class="absolute z-20 mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-text-light shadow-card"
    >
      {{ $t('common.noResults') }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { Icon } from '@iconify/vue';

const props = defineProps({
  modelValue: { type: String, default: '' },
  options: { type: Array, default: () => [] },
  placeholder: { type: String, default: '' }
});

const emit = defineEmits(['update:modelValue']);

const root = ref(null);
const isOpen = ref(false);
const query = ref('');

const filtered = computed(() => {
  const q = query.value.trim().toLowerCase();
  if (!q) return props.options;
  return props.options.filter((o) => o.toLowerCase().includes(q));
});

const open = () => {
  query.value = props.modelValue;
  isOpen.value = true;
};

const close = () => {
  isOpen.value = false;
  query.value = '';
};

const onInput = (e) => {
  query.value = e.target.value;
  isOpen.value = true;
};

const select = (option) => {
  emit('update:modelValue', option);
  close();
};

const selectFirst = () => {
  if (filtered.value.length) select(filtered.value[0]);
};

const clear = () => {
  emit('update:modelValue', '');
  close();
};

const onClickOutside = (e) => {
  if (root.value && !root.value.contains(e.target)) close();
};

onMounted(() => document.addEventListener('mousedown', onClickOutside));
onUnmounted(() => document.removeEventListener('mousedown', onClickOutside));
</script>
