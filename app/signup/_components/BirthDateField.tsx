"use client";

import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface BirthDateFieldProps {
  /** 연·월·일을 모두 고르면 YYYY-MM-DD, 연이나 월을 바꿔 비면 "" */
  onChange: (birthDate: string) => void;
  error?: string;
}

/** 생년월일 — 연·월·일 선택 상자 세 개. 일 목록은 고른 연·월의 날 수만큼 */
export function BirthDateField({ onChange, error }: BirthDateFieldProps) {
  const currentYear = new Date().getFullYear();
  // 최근 해부터 — 연도를 미리 고르지 않으므로 목록이 열리는 위치가 곧 시작점
  const yearOptions = Array.from({ length: 100 }, (_, i) => currentYear - i);
  const monthOptions = Array.from({ length: 12 }, (_, i) => i + 1);

  // 기본값을 두지 않는다 — 올해가 미리 선택되면 월·일만 골라 올해 생년월일로 제출될 수 있음
  const [birthYear, setBirthYear] = useState<string>("");
  const [birthMonth, setBirthMonth] = useState<string>("");
  const [birthDay, setBirthDay] = useState<string>("");

  const getDayOptions = () => {
    if (!birthYear || !birthMonth) return [];
    const daysInMonth = new Date(
      parseInt(birthYear),
      parseInt(birthMonth),
      0,
    ).getDate();
    return Array.from({ length: daysInMonth }, (_, i) => i + 1);
  };
  const dayOptions = getDayOptions();

  const handleBirthDateChange = (
    type: "year" | "month" | "day",
    value: string,
  ) => {
    if (type === "year") {
      setBirthYear(value);
      setBirthMonth("");
      setBirthDay("");
      onChange("");
    } else if (type === "month") {
      setBirthMonth(value);
      setBirthDay("");
      onChange("");
    } else {
      setBirthDay(value);
      if (birthYear && birthMonth && value) {
        onChange(`${birthYear}-${birthMonth.padStart(2, "0")}-${value.padStart(2, "0")}`);
      }
    }
  };

  // 선택 상자 세 개를 묶음 이름으로 설명. 안쪽 span이 이전 라벨과 같은 줄 높이를 유지
  return (
    <fieldset className="space-y-2">
      <legend>
        <span className="text-sm font-medium leading-none text-foreground">
          생년월일 <span className="text-red-600 dark:text-red-400">*</span>
        </span>
      </legend>
      <div className="flex space-x-2">
        <div className="flex-1">
          <Select
            value={birthYear}
            onValueChange={(value) =>
              handleBirthDateChange("year", value)
            }
          >
            <SelectTrigger
              aria-label="출생 연도"
              aria-invalid={!!error}
              className={error ? "border-red-500 dark:border-red-400" : ""}
            >
              <SelectValue placeholder="년도" />
            </SelectTrigger>
            <SelectContent>
              {yearOptions.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}년
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1">
          <Select
            value={birthMonth}
            onValueChange={(value) =>
              handleBirthDateChange("month", value)
            }
          >
            <SelectTrigger
              aria-label="출생 월"
              aria-invalid={!!error}
              className={error ? "border-red-500 dark:border-red-400" : ""}
            >
              <SelectValue placeholder="월" />
            </SelectTrigger>
            <SelectContent>
              {monthOptions.map((month) => (
                <SelectItem key={month} value={month.toString()}>
                  {month}월
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1">
          <Select
            value={birthDay}
            onValueChange={(value) =>
              handleBirthDateChange("day", value)
            }
            disabled={dayOptions.length === 0}
          >
            <SelectTrigger
              aria-label="출생 일"
              aria-invalid={!!error}
              className={error ? "border-red-500 dark:border-red-400" : ""}
            >
              <SelectValue placeholder="일" />
            </SelectTrigger>
            <SelectContent>
              {dayOptions.map((day) => (
                <SelectItem key={day} value={day.toString()}>
                  {day}일
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      {error && (
        <p className="text-xs text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </fieldset>
  );
}
