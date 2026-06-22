import { formatDateTime, getCurrentDateTime, truncateString } from '../utils/dateFormatter';

export function useFormatting() {
  return {
    formatDateTime,
    getCurrentDateTime,
    truncateString
  };
}
