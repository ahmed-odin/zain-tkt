import { ref, computed, watch } from 'vue';
import { localDayStartUtc, localDayEndUtc } from '../utils/dateFormatter';

/**
 * Server-driven search / date / user filtering + pagination.
 * @param {(params: object) => Promise<object|null>} fetchFn - returns the response `meta`
 */
export function useServerTickets(fetchFn) {
  const query = ref('');
  const dateFrom = ref('');
  const dateTo = ref('');
  const userFilter = ref('');
  const governorate = ref('');
  const page = ref(1);
  const pageSize = ref(20);

  const totalPages = ref(1);
  const total = ref(0);
  const isLoading = ref(false);

  let searchTimer = null;

  const buildParams = () => {
    const params = { page: page.value, per_page: pageSize.value };
    if (query.value.trim()) params.search = query.value.trim();
    if (dateFrom.value) params.date_from = localDayStartUtc(dateFrom.value);
    if (dateTo.value) params.date_to = localDayEndUtc(dateTo.value);
    if (userFilter.value.trim()) params.username = userFilter.value.trim();
    if (governorate.value) params.governorate = governorate.value;
    return params;
  };

  const load = async () => {
    isLoading.value = true;
    const meta = await fetchFn(buildParams());
    if (meta) {
      totalPages.value = meta.last_page || 1;
      total.value = meta.total || 0;
      // If the current page fell out of range (e.g. after deletes), step back.
      if (page.value > totalPages.value && totalPages.value >= 1) {
        page.value = totalPages.value;
        isLoading.value = false;
        return load();
      }
    }
    isLoading.value = false;
  };

  const reload = () => {
    page.value = 1;
    return load();
  };

  // Dropdown / date filters apply immediately.
  watch([dateFrom, dateTo, governorate, pageSize], () => {
    reload();
  });

  // Free-text filters (search + username) are debounced.
  watch([query, userFilter], () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => reload(), 350);
  });

  const goToPage = (p) => {
    if (p < 1 || p > totalPages.value || p === page.value) return;
    page.value = p;
    load();
  };

  const setPageSize = (size) => {
    pageSize.value = size; // watcher triggers reload
  };

  const hasActiveFilters = computed(
    () => !!(query.value || dateFrom.value || dateTo.value || userFilter.value || governorate.value)
  );

  const resetFilters = () => {
    query.value = '';
    dateFrom.value = '';
    dateTo.value = '';
    userFilter.value = '';
    governorate.value = '';
    reload();
  };

  return {
    query,
    dateFrom,
    dateTo,
    userFilter,
    governorate,
    page,
    pageSize,
    totalPages,
    total,
    isLoading,
    load,
    reload,
    goToPage,
    setPageSize,
    hasActiveFilters,
    resetFilters,
  };
}
