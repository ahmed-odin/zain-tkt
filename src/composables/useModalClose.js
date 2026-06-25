import { onMounted, onUnmounted } from 'vue';

export function useModalClose(onClose) {
  const handleEscape = (e) => {
    if (e.key === 'Escape') onClose();
  };

  onMounted(() => document.addEventListener('keydown', handleEscape));
  onUnmounted(() => document.removeEventListener('keydown', handleEscape));
}
