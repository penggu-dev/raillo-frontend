"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Monitor, Smartphone, ChevronUp } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import MyPageSidebar from "@/components/layout/MyPageSidebar";

interface IdentityVerificationPageProps {
  redirectPath: string;
}

export default function IdentityVerificationPage({
  redirectPath,
}: IdentityVerificationPageProps) {
  const router = useRouter();
  const { isChecking, isAuthenticated } = useAuth();

  const handleVerification = () => {
    router.push(redirectPath);
  };

  if (isChecking) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">페이지를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <MyPageSidebar />

          <div className="flex-1">
            <Card>
              <CardContent className="p-8">
                <div className="mb-8">
                  <h1 className="text-2xl font-bold text-gray-900 mb-4">
                    본인 인증하여 찾기
                  </h1>
                  <div className="text-gray-600">
                    <p className="mb-2">
                      • 본인확인서비스{" "}
                      <span className="text-red-500 font-medium">
                        (I-PIN, 휴대전화)
                      </span>
                      를 통하여 본인을 확인하는 방법입니다.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                  <div className="text-center">
                    <div className="mb-6">
                      <div className="w-32 h-32 mx-auto mb-4 bg-blue-50 rounded-lg flex items-center justify-center">
                        <Monitor className="h-16 w-16 text-blue-600" />
                      </div>
                      <h3 className="text-lg font-semibold mb-4">
                        아이핀(I-PIN) 으로 인증
                      </h3>
                      <Button
                        onClick={handleVerification}
                        variant="outline"
                        className="px-8 py-2 rounded-full border-blue-600 text-blue-600 hover:bg-blue-50"
                      >
                        아이핀으로 확인하기
                      </Button>
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="mb-6">
                      <div className="w-32 h-32 mx-auto mb-4 bg-blue-50 rounded-lg flex items-center justify-center">
                        <Smartphone className="h-16 w-16 text-blue-600" />
                      </div>
                      <h3 className="text-lg font-semibold mb-4">
                        휴대전화로 인증
                      </h3>
                      <Button
                        onClick={handleVerification}
                        variant="outline"
                        className="px-8 py-2 rounded-full border-blue-600 text-blue-600 hover:bg-blue-50"
                      >
                        휴대전화로 확인하기
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">안내</h3>
                    <ChevronUp className="h-5 w-5 text-gray-400" />
                  </div>
                  <div className="space-y-4 text-sm text-gray-600">
                    <div>
                      <span className="font-medium text-blue-600">
                        • 아이핀(i-PIN)이란?
                      </span>{" "}
                      인터넷상에서 고객님의 주민번호를 대신하여 본인임을 확인 받을 수
                      있는 사이버 신원 확인 수단입니다. 아이핀 발급기관에서 아이핀을
                      발급 후 아이핀 아이디와 패스워드를 이용하시면 주민번호를
                      이용하지 않아도 회원가입 및 기타 서비스의 이용이 가능합니다.
                      <br />
                      <span className="text-gray-500">
                        (관련법령 : 개인정보보호법 제24조)
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-blue-600">
                        • 휴대전화 인증
                      </span>{" "}
                      주민번호 대체수단으로 주민등록번호 대신 본인명의로 등록 된
                      휴대전화 정보를 통해 본인확인을 하게 됩니다.
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
