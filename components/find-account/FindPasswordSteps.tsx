import { FileText, Info, Lock, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  FindAccountGuide,
  LoadingSubmitButton,
  StepBackButton,
} from "./FindAccountParts";

interface LookupStepProps {
  name: string;
  onNameChange: (value: string) => void;
  memberNo: string;
  onMemberNoChange: (value: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
}

/** 1단계 — 이름·회원번호로 조회 */
export function FindPasswordLookupStep({
  name,
  onNameChange,
  memberNo,
  onMemberNoChange,
  onSubmit,
  isLoading,
}: LookupStepProps) {
  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <p className="text-foreground">
          본인이름과 회원번호를 입력 후 조회하세요.
          <br />
          이메일 인증을 통해 본인 확인 후 새 비밀번호를 설정할 수 있습니다.
        </p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
        className="space-y-4"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label
              htmlFor="passwordName"
              className="text-sm font-medium text-foreground"
            >
              이름
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="passwordName"
                type="text"
                placeholder="본인이름을 입력하세요"
                value={name}
                onChange={(e) => onNameChange(e.target.value)}
                className="pl-10"
                disabled={isLoading}
                autoComplete="name"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="passwordMemberNumber"
              className="text-sm font-medium text-foreground"
            >
              회원번호
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="passwordMemberNumber"
                type="text"
                placeholder="코레일 회원번호를 입력하세요"
                value={memberNo}
                onChange={(e) => onMemberNoChange(e.target.value)}
                className="pl-10"
                disabled={isLoading}
                autoComplete="username"
              />
            </div>
          </div>
        </div>

        <LoadingSubmitButton isLoading={isLoading} loadingLabel="처리 중...">
          조회
        </LoadingSubmitButton>
      </form>

      <FindAccountGuide icon={FileText} title="비밀번호 찾기 안내" tone="muted">
        회원번호를 모르시는 경우 먼저 회원번호 찾기를 이용해 주세요. 본인 확인
        후 등록된 이메일로 인증 코드가 전송되며, 인증 완료 시 새 비밀번호를
        설정할 수 있습니다.
      </FindAccountGuide>
    </div>
  );
}

interface NewPasswordStepProps {
  newPassword: string;
  onNewPasswordChange: (value: string) => void;
  confirmPassword: string;
  onConfirmPasswordChange: (value: string) => void;
  onSubmit: () => void;
  onBack: () => void;
  isLoading: boolean;
}

/** 3단계 — 새 비밀번호 설정 */
export function FindPasswordNewPasswordStep({
  newPassword,
  onNewPasswordChange,
  confirmPassword,
  onConfirmPasswordChange,
  onSubmit,
  onBack,
  isLoading,
}: NewPasswordStepProps) {
  return (
    <div className="space-y-6">
      <StepBackButton onClick={onBack} disabled={isLoading}>
        {isLoading ? "처리 중..." : "뒤로가기"}
      </StepBackButton>

      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold text-foreground mb-2">
          새 비밀번호 설정
        </h3>
        <p className="text-foreground">새로운 비밀번호를 입력해주세요.</p>
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
            htmlFor="newPassword"
            className="text-sm font-medium text-foreground"
          >
            새 비밀번호
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="newPassword"
              type="password"
              placeholder="새 비밀번호를 입력하세요 (8자 이상)"
              value={newPassword}
              onChange={(e) => onNewPasswordChange(e.target.value)}
              className="pl-10"
              disabled={isLoading}
              autoComplete="new-password"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="confirmPassword"
            className="text-sm font-medium text-foreground"
          >
            새 비밀번호 확인
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="confirmPassword"
              type="password"
              placeholder="새 비밀번호를 다시 입력하세요"
              value={confirmPassword}
              onChange={(e) => onConfirmPasswordChange(e.target.value)}
              className="pl-10"
              disabled={isLoading}
              autoComplete="new-password"
            />
          </div>
        </div>

        <LoadingSubmitButton
          isLoading={isLoading}
          loadingLabel="비밀번호 변경 중..."
        >
          비밀번호 변경
        </LoadingSubmitButton>
      </form>

      <Alert variant="success" role="note">
        <Lock className="h-4 w-4" />
        <AlertTitle asChild>
          <h3 className="font-semibold">비밀번호 변경 안내</h3>
        </AlertTitle>
        <AlertDescription className="leading-relaxed">
          비밀번호는 8자 이상이어야 하며, 영문, 숫자, 특수문자를 포함하는 것을
          권장합니다. 비밀번호 변경 후 자동으로 로그인 페이지로 이동합니다.
        </AlertDescription>
      </Alert>
    </div>
  );
}

/** 4단계 — 변경 완료 */
export function FindPasswordDoneStep({ onLogin }: { onLogin: () => void }) {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="mx-auto w-20 h-20 bg-green-100 dark:bg-green-500/15 rounded-full flex items-center justify-center mb-6">
          <svg
            className="h-10 w-10 text-green-600 dark:text-green-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h3 className="text-2xl font-bold text-foreground mb-4">
          비밀번호 변경 완료!
        </h3>
        <p className="text-foreground text-lg mb-6">
          비밀번호가 성공적으로 변경되었습니다.
          <br />
          <span className="text-primary font-medium">
            3초 후 로그인 페이지로 이동합니다.
          </span>
        </p>
      </div>

      <div className="text-center">
        <Button onClick={onLogin} className="font-semibold px-8 py-3" size="lg">
          바로 로그인하기
        </Button>
      </div>

      <Alert variant="success" role="note" className="mt-6">
        <Info className="h-4 w-4" />
        <AlertTitle asChild>
          <h3 className="font-semibold">변경 완료 안내</h3>
        </AlertTitle>
        <AlertDescription className="leading-relaxed">
          새로운 비밀번호로 로그인하실 수 있습니다. 보안을 위해 정기적으로
          비밀번호를 변경하시는 것을 권장합니다.
        </AlertDescription>
      </Alert>
    </div>
  );
}
