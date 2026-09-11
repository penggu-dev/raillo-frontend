"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Home, Printer, Smartphone, Monitor, ChevronUp } from "lucide-react"

export default function FindPasswordVerifyPage() {
  const router = useRouter()

  const handleVerification = (method: string) => {
    // 실제로는 인증 프로세스를 거치지만, 여기서는 바로 비밀번호 변경 페이지로 이동
    router.push("/find-account/reset-password")
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Page Header */}
      <div className="bg-primary text-primary-foreground py-6">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl font-bold text-center">본인 인증하여 찾기</h1>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="bg-card border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Home className="h-4 w-4" />
              <Link href="/" className="hover:text-primary">
                홈
              </Link>
              <span>/</span>
              <Link href="/find-account" className="hover:text-primary">
                회원번호/비밀번호 찾기
              </Link>
              <span>/</span>
              <span className="text-foreground">본인 인증하여 찾기</span>
            </div>
            <Button variant="outline" size="sm" className="flex items-center space-x-1">
              <Printer className="h-4 w-4" />
              <span>인쇄</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Card className="shadow-lg">
            <CardContent className="p-8">
              <div className="mb-8">
                <h1 className="text-2xl font-bold text-foreground mb-4">본인 인증하여 찾기</h1>
                <div className="text-muted-foreground">
                  <p className="mb-2">
                    • 본인확인서비스 <span className="text-red-600 dark:text-red-400 font-medium">(I-PIN, 휴대전화)</span>를 통하여 본인을
                    확인하는 방법입니다.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                {/* 아이핀 인증 */}
                <div className="text-center">
                  <div className="mb-6">
                    <div className="w-32 h-32 mx-auto mb-4 bg-blue-50 dark:bg-blue-500/10 rounded-lg flex items-center justify-center">
                      <Monitor className="h-16 w-16 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold mb-4">아이핀(I-PIN) 으로 인증</h3>
                    <Button
                      onClick={() => handleVerification("ipin")}
                      variant="outline"
                      className="px-8 py-2 rounded-full border-primary text-primary hover:bg-secondary"
                    >
                      아이핀으로 확인하기
                    </Button>
                  </div>
                </div>

                {/* 휴대전화 인증 */}
                <div className="text-center">
                  <div className="mb-6">
                    <div className="w-32 h-32 mx-auto mb-4 bg-blue-50 dark:bg-blue-500/10 rounded-lg flex items-center justify-center">
                      <Smartphone className="h-16 w-16 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold mb-4">휴대전화로 인증</h3>
                    <Button
                      onClick={() => handleVerification("phone")}
                      variant="outline"
                      className="px-8 py-2 rounded-full border-primary text-primary hover:bg-secondary"
                    >
                      휴대전화로 확인하기
                    </Button>
                  </div>
                </div>
              </div>

              {/* 안내 섹션 */}
              <div className="bg-muted rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">안내</h3>
                  <ChevronUp className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="space-y-4 text-sm text-muted-foreground">
                  <div>
                    <span className="font-medium text-primary">• 아이핀(i-PIN)이란?</span> 인터넷상에서 고객님의
                    주민번호를 대신하여 본인임을 확인 받을 수 있는 사이버 신원 확인 수단입니다. 아이핀 발급기관에서
                    아이핀을 발급 후 아이핀 아이디와 패스워드를 이용하시면 주민번호를 이용하지 않아도 회원가입 및 기타
                    서비스의 이용이 가능합니다.
                    <br />
                    <span className="text-muted-foreground">(관련법령 : 개인정보보호법 제24조)</span>
                  </div>
                  <div>
                    <span className="font-medium text-primary">• 휴대전화 인증</span> 주민번호 대체수단으로
                    주민등록번호 대신 본인명의로 등록 된 휴대전화 정보를 통해 본인확인을 하게 됩니다.
                  </div>
                </div>
              </div>

              {/* 추가 링크 */}
              <div className="mt-8 pt-6 border-t border-border">
                <div className="flex justify-center space-x-6 text-sm">
                  <Link href="/find-account" className="text-primary hover:text-primary-active font-semibold">
                    이전으로
                  </Link>
                  <span className="text-muted-foreground opacity-40">|</span>
                  <Link href="/login" className="text-primary hover:text-primary-active font-semibold">
                    로그인하기
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
