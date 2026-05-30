import { LOCAL_STORAGE_KEYS } from "@/constants/storageKeys";
import { SEARCH_HISTORY_MAX } from "@/constants/validation";

export type SearchHistoryItem = {
  departure: string;
  arrival: string;
  timestamp: number;
};

export const saveSearchHistory = (departure: string, arrival: string): void => {
  const existing = localStorage.getItem(LOCAL_STORAGE_KEYS.SEARCH_HISTORY);

  let history: SearchHistoryItem[] = [];

  if (existing) {
    try {
      const parsed = JSON.parse(existing);
      if (Array.isArray(parsed)) history = parsed;
    } catch {
      history = [];
    }
  }

  history = history.filter(
    (item) => !(item.departure === departure && item.arrival === arrival),
  );

  history.unshift({ departure, arrival, timestamp: Date.now() });
  history.slice(0, SEARCH_HISTORY_MAX);

  localStorage.setItem(
    LOCAL_STORAGE_KEYS.SEARCH_HISTORY,
    JSON.stringify(history),
  );
};

export const getSearchHistory = (): SearchHistoryItem[] => {
  const existing = localStorage.getItem(LOCAL_STORAGE_KEYS.SEARCH_HISTORY);

  if (!existing) return [];

  try {
    const parsed = JSON.parse(existing);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};
