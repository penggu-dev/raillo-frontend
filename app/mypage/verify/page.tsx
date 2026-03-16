"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft } from "lucide-react"
import { sendMemberEmailVerification, verifyMemberEmail } from "@/lib/api/user"
import AuthGuard from "@/components/auth/AuthGuard"
import { handleError } from "@/lib/utils/errorHandler"

function EmailVerificationPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState("")
  const [authCode, setAuthCode] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showVerification, setShowVerification] = useState(false)

  // 인증 용도 파악 및 유효성 검증
  const rawPurpose = searchParams.get('purpose') || 'general'
  
  // 유효한 purpose 값만 허용
  const validPurposes = ['email_change', 'password_change', 'phone_change', 'general']
  const verificationPurpose = validPurposes.includes(rawPurpose) ? rawPurpose : 'general'
  
  // 변조된 URL 감지 시 마이페이지로 리다이렉트
  useEffect(() => {
    if (!validPurposes.includes(rawPurpose)) {
      router.push('/mypage')
    }
  }, [rawPurpose, router])

  const handleSendVerificationCode = async () => {
    setIsSubmitting(true)
    try {
      const response = await sendMemberEmailVerification()
      if (response.result) {
        setEmail(response.result.email)
        alert("인증코드가 이메일로 발송되었습니다.")
        setShowVerification(true)
      }
    } catch (error: unknown) {
      console.error('인증코드 발송 실패:', error)
      handleError(error, "인증코드 발송에 실패했습니다. 다시 시도해주세요.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAuthCodeChange = (value: string) => {
    // 숫자만 허용, 6자리 제한
    const numericValue = value.replace(/[^0-9]/g, "").slice(0, 6)
    setAuthCode(numericValue)
  }

  const handleGoBack = () => {
    // 인증 상태 초기화
    sessionStorage.removeItem('emailVerified')
    sessionStorage.removeItem('emailVerifiedFor')
    // 마이페이지로 돌아가기
    router.push('/mypage')
  }

  const handleVerifyEmail = async () => {
    if (!authCode) {
      alert("인증코드를 입력해주세요.")
      return
    }

    if (authCode.length !== 6) {
      alert("인증코드는 6자리 숫자로 입력해주세요.")
      return
    }

    setIsSubmitting(true)
    try {
      const response = await verifyMemberEmail(email, authCode)
      if (response.result?.isVerified) {
        alert("이메일 인증이 완료되었습니다.")
        // 인증 성공 시 세션에 인증 상태 저장 (용도별로 구분)
        sessionStorage.setItem('emailVerified', 'true')
        sessionStorage.setItem('emailVerifiedFor', verificationPurpose)
        
        // 용도에 따라 적절한 페이지로 리다이렉트
        switch (verificationPurpose) {
          case 'email_change':
            router.push('/mypage/email/change')
            break
          case 'password_change':
            router.push('/mypage/password/change')
            break
          case 'phone_change':
            router.push('/mypage/phone/change')
            break
          default:
            router.push('/mypage')
        }
      } else {
        alert("인증코드가 올바르지 않습니다. 다시 확인해주세요.")
      }
    } catch (error: unknown) {
      console.error('이메일 인증 실패:', error)
      handleError(error, "이메일 인증에 실패했습니다. 다시 시도해주세요.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      <div className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          {/* 뒤로가기 버튼 */}
          <div className="mb-4">
            <Button
              onClick={handleGoBack}
              variant="ghost"
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>뒤로가기</span>
            </Button>
          </div>
          
          <Card>
            <CardContent className="p-8">
              <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-6">이메일 인증</h1>
                <div className="space-y-3 text-gray-700">
                  <p>• 회원정보 변경을 위해 이메일 인증이 필요합니다.</p>
                  <p>• 등록된 이메일로 인증코드가 발송됩니다.</p>
                </div>
              </div>

              {!showVerification ? (
                <div className="space-y-6">
                  <div className="text-center">
                    <p className="text-gray-600 mb-4">
                      인증코드를 발송하시겠습니까?
                    </p>
                    <Button
                      onClick={handleSendVerificationCode}
                      disabled={isSubmitting}
                      className="px-8 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full disabled:opacity-50"
                    >
                      {isSubmitting ? "처리 중..." : "인증코드 발송"}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="auth-code" className="text-sm font-medium text-gray-700">
                      인증코드 <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="auth-code"
                      type="text"
                      value={authCode}
                      onChange={(e) => handleAuthCodeChange(e.target.value)}
                      placeholder="인증코드 6자리 입력"
                      maxLength={6}
                      className="w-full"
                    />
                    <p className="text-xs text-gray-500">
                      {email}로 발송된 6자리 인증코드를 입력해주세요.
                    </p>
                  </div>

                  <div className="flex space-x-3">
                    <Button
                      onClick={handleVerifyEmail}
                      disabled={isSubmitting}
                      className="flex-1 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full disabled:opacity-50"
                    >
                      {isSubmitting ? "처리 중..." : "인증 확인"}
                    </Button>
                    <Button
                      onClick={handleSendVerificationCode}
                      disabled={isSubmitting}
                      variant="outline"
                      className="px-6 py-2 border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                    >
                      재발송
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default function EmailVerificationPage() {
  return (
    <AuthGuard>
      <EmailVerificationPageContent />
    </AuthGuard>
  )
}