"use client";

import Link from "next/link";
import { Controller, type Control, type FieldErrors } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import type { SignupFormValues } from "@/lib/validation/signup";

interface TermsAgreementProps {
  control: Control<SignupFormValues>;
  errors: FieldErrors<SignupFormValues>;
}

/** 약관 동의 — 필수 두 개(이용약관·개인정보)와 선택 하나(마케팅) */
export function TermsAgreement({ control, errors }: TermsAgreementProps) {
  return (
    <div className="space-y-4 pt-6 border-t border-border">
      <h3 className="text-lg font-semibold text-foreground">
        약관 동의
      </h3>

      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <Controller
            name="terms"
            control={control}
            render={({ field }) => (
              <Checkbox
                id="terms"
                aria-invalid={!!errors.terms}
                aria-describedby={errors.terms ? "terms-error" : undefined}
                checked={field.value === true}
                onCheckedChange={(checked) =>
                  field.onChange(checked ? true : undefined)
                }
              />
            )}
          />
          <Label htmlFor="terms" className="text-sm text-foreground">
            <span className="text-red-600 dark:text-red-400">[필수]</span> 이용약관에
            동의합니다.
          </Label>
          <Link
            href="#"
            className="text-primary hover:text-primary-active text-sm"
          >
            보기
          </Link>
        </div>
        {errors.terms && (
          <p id="terms-error" className="text-xs text-red-600 dark:text-red-400 ml-6">
            {errors.terms.message}
          </p>
        )}

        <div className="flex items-center space-x-2">
          <Controller
            name="privacy"
            control={control}
            render={({ field }) => (
              <Checkbox
                id="privacy"
                aria-invalid={!!errors.privacy}
                aria-describedby={errors.privacy ? "privacy-error" : undefined}
                checked={field.value === true}
                onCheckedChange={(checked) =>
                  field.onChange(checked ? true : undefined)
                }
              />
            )}
          />
          <Label
            htmlFor="privacy"
            className="text-sm text-foreground"
          >
            <span className="text-red-600 dark:text-red-400">[필수]</span> 개인정보
            수집 및 이용에 동의합니다.
          </Label>
          <Link
            href="#"
            className="text-primary hover:text-primary-active text-sm"
          >
            보기
          </Link>
        </div>
        {errors.privacy && (
          <p id="privacy-error" className="text-xs text-red-600 dark:text-red-400 ml-6">
            {errors.privacy.message}
          </p>
        )}

        <div className="flex items-center space-x-2">
          <Controller
            name="marketing"
            control={control}
            render={({ field }) => (
              <Checkbox
                id="marketing"
                checked={field.value}
                onCheckedChange={(checked) =>
                  field.onChange(checked === true)
                }
              />
            )}
          />
          <Label
            htmlFor="marketing"
            className="text-sm text-foreground"
          >
            [선택] 마케팅 정보 수신에 동의합니다.
          </Label>
        </div>
      </div>
    </div>
  );
}
