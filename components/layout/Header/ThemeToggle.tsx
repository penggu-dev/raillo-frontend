"use client";

import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useThemeStore } from "@/stores/theme-store";

const ThemeToggle = () => {
  const theme = useThemeStore((state) => state.theme);
  const initialized = useThemeStore((state) => state.initialized);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);

  const isDark = theme === "dark";

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      // 초기화 전에는 저장된 테마를 아직 모르므로 반대 모드 아이콘/라벨 노출 방지
      disabled={!initialized}
      aria-label={
        !initialized
          ? "테마 전환"
          : isDark
            ? "라이트 모드로 전환"
            : "다크 모드로 전환"
      }
    >
      {initialized ? isDark ? <Sun /> : <Moon /> : null}
    </Button>
  );
};

export default ThemeToggle;
