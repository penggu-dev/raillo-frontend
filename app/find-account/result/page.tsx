"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { User, CheckCircle, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import PageLayout from "@/components/layout/PageLayout";
import { SESSION_STORAGE_KEYS } from "@/constants/storageKeys";
import LoadingSpinner from "@/components/common/LoadingSpinner";

export default function FindAccountResultPage() {
  const [memberNo, setMemberNo] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // sessionStorage에서 회원번호 가져오기
    const memberNoFromStorage = sessionStorage.getItem(
      SESSION_STORAGE_KEYS.FOUND_MEMBER_NUMBER,
    );

    if (memberNoFromStorage) {
      setMemberNo(memberNoFromStorage);
      setIsLoading(false);
      sessionStorage.removeItem(SESSION_STORAGE_KEYS.FOUND_MEMBER_NUMBER);
    } else {
      // sessionStorage에 회원번호가 없으면 이전 페이지로 리다이렉트
      router.push("/find-account");
    }
  }, [router]);

  const handleLogin = () => {
    // 회원번호를 sessionStorage에 저장하여 로그인 페이지에서 사용할 수 있도록 함
    sessionStorage.setItem(SESSION_STORAGE_KEYS.FOUND_MEMBER_NUMBER, memberNo);
    router.push("/login");
  };

  const handleFindPassword = () => {
    // 회원번호를 sessionStorage에 저장하여 비밀번호 찾기에서 사용할 수 있도록 함
    sessionStorage.setItem(SESSION_STORAGE_KEYS.FOUND_MEMBER_NUMBER, memberNo);
    router.push("/find-account");
  };

  if (isLoading) {
    return (
      <PageLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto text-center">
            <LoadingSpinner className="mx-auto mb-4" />
            <p className="text-muted-foreground">결과를 불러오는 중...</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* 뒤로가기 버튼 */}
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={() => router.push("/find-account")}
              className="flex items-center space-x-2 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>뒤로가기</span>
            </Button>
          </div>

          <Card className="shadow-lg">
            <CardContent className="p-8 text-center">
              {/* Success Icon */}
              <div className="mb-6">
                <div className="w-20 h-20 mx-auto mb-4 bg-green-100 dark:bg-green-500/15 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
                </div>
              </div>

              {/* Success Message */}
              <div className="mb-8">
                <h1 className="text-2xl font-bold text-foreground mb-2">
                  회원번호 찾기 완료
                </h1>
                <p className="text-muted-foreground">
                  회원님의 RAILLO 회원번호를 찾았습니다.
                </p>
              </div>

              {/* Member Number */}
              <div className="mb-8 p-6 bg-muted rounded-lg">
                <h3 className="text-sm font-medium text-foreground mb-3">
                  RAILLO 회원번호
                </h3>
                <div className="text-2xl font-bold text-primary font-mono">
                  {memberNo}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <Button
                  onClick={handleLogin}
                  className="w-full font-semibold py-3"
                  size="lg"
                >
                  로그인하기
                </Button>
                <Button
                  onClick={handleFindPassword}
                  variant="outline"
                  className="w-full border-primary text-primary hover:bg-secondary font-semibold py-3"
                  size="lg"
                >
                  비밀번호 찾기
                </Button>
              </div>

              {/* Additional Info */}
              <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-500/10 rounded-lg">
                <div className="flex items-start space-x-3">
                  <User className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                  <div className="text-left">
                    <h3 className="font-semibold text-foreground mb-1">
                      안내사항
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      회원번호를 기억해 두시고, 로그인 시 사용해 주세요.
                      <br />
                      비밀번호를 잊으셨다면 비밀번호 찾기를 이용해 주세요.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageLayout>
  );
}
