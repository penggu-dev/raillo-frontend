"use client";

import { useEffect } from "react";
import { useThemeStore } from "@/stores/theme-store";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const initializeTheme = useThemeStore((state) => state.initializeTheme);

  // 저장된 설정 동기화 + 시스템 설정 변경 구독 (언마운트 시 해제)
  useEffect(() => initializeTheme(), [initializeTheme]);

  return <>{children}</>;
}
