<template>
  <div class="overflow-x-auto rounded-xl border border-gray-100 bg-white shadow-sm">
    <table class="min-w-[920px] w-full text-sm" dir="rtl">
      <thead class="bg-gradient-to-r from-blue-50 to-blue-100 border-b-2 border-blue-200">
        <tr>
          <th
            v-for="col in columns"
            :key="`h-${col}`"
            class="px-6 py-4 border-r border-gray-200 last:border-r-0"
          >
            <div class="h-4 w-16 rounded bg-blue-200/60 animate-pulse"></div>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in rows" :key="`r-${row}`" class="border-b border-gray-100">
          <td
            v-for="col in columns"
            :key="`c-${row}-${col}`"
            class="px-6 py-4 border-r border-gray-100 last:border-r-0"
          >
            <div
              class="h-4 rounded bg-gray-200 animate-pulse"
              :style="{ width: cellWidth(row, col) }"
            ></div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
const props = defineProps({
  columns: { type: Number, default: 8 },
  rows: { type: Number, default: 6 }
});

// Vary widths a little so the placeholder feels organic instead of a uniform grid.
const widths = ['40%', '70%', '55%', '85%', '60%', '50%', '75%', '45%', '65%', '80%'];
const cellWidth = (row, col) => widths[(row + col) % widths.length];
</script>
