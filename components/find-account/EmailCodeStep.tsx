import { Mail } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AUTH_CODE_LENGTH } from "@/constants/validation";
import {
  FindAccountGuide,
  LoadingSubmitButton,
  StepBackButton,
} from "./FindAccountParts";

interface EmailCodeStepProps {
  /** 인증 코드 입력 id — 탭마다 다르다 */
  inputId: string;
  email: string;
  authCode: string;
  onAuthCodeChange: (value: string) => void;
  onSubmit: () => void;
  onBack: () => void;
  isLoading: boolean;
}

/** 이메일 인증 단계 — 회원번호 찾기·비밀번호 찾기가 함께 쓴다 */
export function EmailCodeStep({
  inputId,
  email,
  authCode,
  onAuthCodeChange,
  onSubmit,
  onBack,
  isLoading,
}: EmailCodeStepProps) {
  return (
    <div className="space-y-6">
      <StepBackButton onClick={onBack} disabled={isLoading} />

      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold text-foreground mb-2">
          이메일 인증
        </h3>
        <p className="text-foreground">
          <span className="font-medium">{email}</span>로 인증 코드를
          전송했습니다.
          <br />
          이메일을 확인하여 인증 코드를 입력해주세요.
        </p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
        className="space-y-4"
      >
        <div className="space-y-2">
          <Label
            htmlFor={inputId}
            className="text-sm font-medium text-foreground"
          >
            인증 코드
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id={inputId}
              type="text"
              placeholder="인증 코드 6자리를 입력하세요"
              value={authCode}
              onChange={(e) => onAuthCodeChange(e.target.value)}
              className={`pl-10 ${authCode.length === AUTH_CODE_LENGTH ? "border-green-600 focus:border-green-600 dark:border-green-400 dark:focus:border-green-400" : ""}`}
              maxLength={AUTH_CODE_LENGTH}
              disabled={isLoading}
              autoComplete="one-time-code"
            />
            {authCode.length > 0 && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-muted-foreground">
                {authCode.length}/{AUTH_CODE_LENGTH}
              </div>
            )}
          </div>
        </div>

        <LoadingSubmitButton isLoading={isLoading} loadingLabel="인증 중...">
          인증 확인
        </LoadingSubmitButton>
      </form>

      <FindAccountGuide icon={Mail} title="인증 코드 안내" tone="primary">
        이메일로 전송된 6자리 인증 코드를 입력해주세요. 인증 코드는 5분간
        유효합니다.
      </FindAccountGuide>
    </div>
  );
}
