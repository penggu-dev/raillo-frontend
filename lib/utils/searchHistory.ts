import { LOCAL_STORAGE_KEYS } from "@/constants/storageKeys";
import { SEARCH_HISTORY_MAX } from "@/constants/validation";

export type SearchHistoryItem = {
  departure: string;
  arrival: string;
  timestamp: number;
};

// 검색 기록 저장 함수
// 출발점과 도착점을 파라미터로 받아
// 중복된 사항이 있는지 확인 및 제거한 후
// 기존에 있던 항목 앞에 새 검색 항목을 추가
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
  history = history.slice(0, SEARCH_HISTORY_MAX);

  localStorage.setItem(
    LOCAL_STORAGE_KEYS.SEARCH_HISTORY,
    JSON.stringify(history),
  );
};

// 로컬스토리지에서 검색 항목을 불러옴
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
