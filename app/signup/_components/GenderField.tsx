"use client";

import { Controller, type Control } from "react-hook-form";
import { Button } from "@/components/ui/button";
import type { SignupFormValues } from "@/lib/validation/signup";

interface GenderFieldProps {
  control: Control<SignupFormValues>;
  error?: string;
}

/** 성별 — 버튼 두 개, 고른 버튼의 선택 상태를 낭독기에 알린다 */
export function GenderField({ control, error }: GenderFieldProps) {
  return (
    <fieldset className="space-y-2" aria-describedby={error ? "gender-error" : undefined}>
      <legend>
        <span className="text-sm font-medium leading-none text-foreground">
          성별 <span className="text-red-600 dark:text-red-400">*</span>
        </span>
      </legend>
      <Controller
        name="gender"
        control={control}
        render={({ field }) => (
          <div className="flex space-x-4">
            <Button
              type="button"
              variant={field.value === "M" ? "default" : "outline"}
              aria-pressed={field.value === "M"}
              onClick={() => field.onChange("M")}
              className="flex-1"
            >
              남성
            </Button>
            <Button
              type="button"
              variant={field.value === "F" ? "default" : "outline"}
              aria-pressed={field.value === "F"}
              onClick={() => field.onChange("F")}
              className="flex-1"
            >
              여성
            </Button>
          </div>
        )}
      />
      {error && (
        <p id="gender-error" className="text-xs text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </fieldset>
  );
}
