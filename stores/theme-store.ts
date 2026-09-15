import { create } from "zustand";
import { DARK_THEME_QUERY, THEME_STORAGE_KEY } from "@/lib/theme";

/** 사용자가 고른 테마 설정 */
export type ThemePreference = "light" | "dark" | "system";
/** 실제로 화면에 적용되는 테마 */
export type Theme = "light" | "dark";

interface ThemeState {
  preference: ThemePreference;
  theme: Theme;
  initialized: boolean;
  setPreference: (preference: ThemePreference) => void;
  /** 라이트·다크를 직접 선택으로 저장·적용한다 (기존 API — `setPreference(theme)`과 같음) */
  setTheme: (theme: Theme) => void;
  /** 지금 적용된 테마의 반대를 직접 선택으로 저장한다. 시스템 설정 모드였다면 이후 운영체제 설정 변경은 따르지 않음 */
  toggleTheme: () => void;
  /** 저장된 설정으로 동기화하고, 시스템 설정 변경 구독을 시작한다. 반환값은 구독 해제 함수 */
  initializeTheme: () => () => void;
}

const isPreference = (value: string | null): value is ThemePreference =>
  value === "light" || value === "dark" || value === "system";

const systemTheme = (): Theme => {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return "light";
  return window.matchMedia(DARK_THEME_QUERY).matches ? "dark" : "light";
};

export const resolveTheme = (preference: ThemePreference): Theme =>
  preference === "system" ? systemTheme() : preference;

const applyTheme = (theme: Theme) => {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("dark", theme === "dark");
};

const readStoredPreference = (): ThemePreference => {
  if (typeof window === "undefined") return "system";
  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    // 저장값이 없으면 운영체제 설정을 따른다
    return isPreference(stored) ? stored : "system";
  } catch {
    // private 모드 등 localStorage 접근 불가 시 기본값
    return "system";
  }
};

export const useThemeStore = create<ThemeState>((set, get) => ({
  preference: "system",
  theme: "light",
  initialized: false,
  setPreference: (preference) => {
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, preference);
    } catch {
      // localStorage 쓰기 실패는 무시 (테마 적용은 진행)
    }
    const theme = resolveTheme(preference);
    applyTheme(theme);
    set({ preference, theme });
  },
  setTheme: (theme) => {
    get().setPreference(theme);
  },
  toggleTheme: () => {
    get().setTheme(get().theme === "dark" ? "light" : "dark");
  },
  // 클라이언트 마운트 후 저장된 설정으로 스토어 상태 동기화 (FOUC 스크립트가 class는 이미 반영)
  initializeTheme: () => {
    const preference = readStoredPreference();
    const theme = resolveTheme(preference);
    applyTheme(theme);
    set({ preference, theme, initialized: true });

    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return () => {};
    const media = window.matchMedia(DARK_THEME_QUERY);
    const handleChange = () => {
      if (get().preference !== "system") return;
      const next = systemTheme();
      applyTheme(next);
      set({ theme: next });
    };
    if (typeof media.addEventListener === "function") {
      media.addEventListener("change", handleChange);
      return () => media.removeEventListener("change", handleChange);
    }
    // Safari 13 이하는 MediaQueryList에 addEventListener가 없음 (Next.js 기본 지원 범위 Safari 12+)
    media.addListener(handleChange);
    return () => media.removeListener(handleChange);
  },
}));
