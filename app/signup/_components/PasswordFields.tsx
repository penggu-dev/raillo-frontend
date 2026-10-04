"use client";

import { useState } from "react";
import { useWatch, type Control, type FieldErrors, type UseFormRegister } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Lock } from "lucide-react";
import type { SignupFormValues } from "@/lib/validation/signup";

interface PasswordFieldsProps {
  register: UseFormRegister<SignupFormValues>;
  control: Control<SignupFormValues>;
  errors: FieldErrors<SignupFormValues>;
}

/** 비밀번호·비밀번호 확인 — 칸마다 보기 토글, 확인 칸에 입력하는 대로 일치 여부 안내 */
export function PasswordFields({ register, control, errors }: PasswordFieldsProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const watchPassword = useWatch({ control, name: "password" });
  const watchConfirmPassword = useWatch({ control, name: "confirmPassword" });
  const passwordsMatch =
    watchPassword &&
    watchConfirmPassword &&
    watchPassword === watchConfirmPassword;

  return (
    <>
      <div className="space-y-2">
        <Label
          htmlFor="password"
          className="text-sm font-medium text-foreground"
        >
          비밀번호 <span className="text-red-600 dark:text-red-400">*</span>
        </Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="비밀번호를 입력하세요"
            {...register("password")}
            className={`pl-10 pr-10 ${errors.password ? "border-red-500 dark:border-red-400" : ""}`}
            aria-invalid={!!errors.password}
            aria-describedby={errors.password ? "password-error" : undefined}
            autoComplete="new-password"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? "비밀번호 숨기기" : "비밀번호 보기"}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
        {errors.password && (
          <p id="password-error" className="text-xs text-red-600 dark:text-red-400">
            {errors.password.message}
          </p>
        )}
        <p className="text-xs text-muted-foreground">
          8자 이상, 영문, 숫자, 특수문자를 포함해주세요.
        </p>
      </div>

      {/* 비밀번호 확인 */}
      <div className="space-y-2">
        <Label
          htmlFor="confirmPassword"
          className="text-sm font-medium text-foreground"
        >
          비밀번호 확인 <span className="text-red-600 dark:text-red-400">*</span>
        </Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            placeholder="비밀번호를 다시 입력하세요"
            {...register("confirmPassword")}
            className={`pl-10 pr-10 ${errors.confirmPassword ? "border-red-500 dark:border-red-400" : ""}`}
            aria-invalid={!!errors.confirmPassword}
            aria-describedby={errors.confirmPassword ? "confirmPassword-error" : undefined}
            autoComplete="new-password"
          />
          <button
            type="button"
            onClick={() =>
              setShowConfirmPassword(!showConfirmPassword)
            }
            aria-label={showConfirmPassword ? "비밀번호 확인 숨기기" : "비밀번호 확인 보기"}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            {showConfirmPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
        {errors.confirmPassword && (
          <p id="confirmPassword-error" className="text-xs text-red-600 dark:text-red-400">
            {errors.confirmPassword.message}
          </p>
        )}
        {watchConfirmPassword && !errors.confirmPassword && (
          <p
            className={`text-xs ${passwordsMatch ? "text-green-700 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
          >
            {passwordsMatch
              ? "비밀번호가 일치합니다."
              : "비밀번호가 일치하지 않습니다."}
          </p>
        )}
      </div>
    </>
  );
}
