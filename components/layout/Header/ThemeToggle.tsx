"use client";

import { useState } from "react";
import { Check, Monitor, Moon, Sun, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useThemeStore, type ThemePreference } from "@/stores/theme-store";

const OPTIONS: { value: ThemePreference; label: string; icon: LucideIcon }[] = [
  { value: "light", label: "라이트", icon: Sun },
  { value: "dark", label: "다크", icon: Moon },
  { value: "system", label: "시스템 설정", icon: Monitor },
];

const ThemeToggle = () => {
  const preference = useThemeStore((state) => state.preference);
  const theme = useThemeStore((state) => state.theme);
  const initialized = useThemeStore((state) => state.initialized);
  const setPreference = useThemeStore((state) => state.setPreference);
  const [open, setOpen] = useState(false);

  const current = OPTIONS.find((option) => option.value === preference) ?? OPTIONS[2];
  // 시스템 설정일 때도 버튼 아이콘은 실제 적용된 테마를 보여준다
  const TriggerIcon = preference === "system" ? (theme === "dark" ? Moon : Sun) : current.icon;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          // 초기화 전에는 저장된 설정을 아직 모르므로 잘못된 아이콘/라벨 노출 방지
          disabled={!initialized}
          aria-label={initialized ? `테마 설정: ${current.label}` : "테마 설정"}
        >
          {initialized ? <TriggerIcon /> : null}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-44 p-1">
        <div role="group" aria-label="테마">
          {OPTIONS.map(({ value, label, icon: Icon }) => {
            const selected = value === preference;
            return (
              <button
                key={value}
                type="button"
                aria-pressed={selected}
                onClick={() => {
                  setPreference(value);
                  setOpen(false); // 닫히면 포커스는 트리거로 돌아감
                }}
                className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Icon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                <span className="flex-1 text-left">{label}</span>
                {selected ? <Check className="h-4 w-4 text-primary" aria-hidden="true" /> : null}
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default ThemeToggle;
