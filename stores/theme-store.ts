import { create } from "zustand";

export type Theme = "light" | "dark";

const STORAGE_KEY = "raillo-theme";

interface ThemeState {
  theme: Theme;
  initialized: boolean;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  initializeTheme: () => void;
}

const applyTheme = (theme: Theme) => {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("dark", theme === "dark");
};

const readStoredTheme = (): Theme => {
  if (typeof window === "undefined") return "light";
  try {
    return window.localStorage.getItem(STORAGE_KEY) === "dark" ? "dark" : "light";
  } catch {
    // private 모드 등 localStorage 접근 불가 시 기본값
    return "light";
  }
};

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: "light",
  initialized: false,
  setTheme: (theme) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // localStorage 쓰기 실패는 무시 (테마 적용은 진행)
    }
    applyTheme(theme);
    set({ theme });
  },
  toggleTheme: () => {
    get().setTheme(get().theme === "dark" ? "light" : "dark");
  },
  // 클라이언트 마운트 후 저장된 테마로 스토어 상태 동기화 (FOUC 스크립트가 class는 이미 반영)
  initializeTheme: () => {
    const theme = readStoredTheme();
    applyTheme(theme);
    set({ theme, initialized: true });
  },
}));
