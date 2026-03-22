"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { updatePhoneNumber } from "@/lib/api/members"
import { useRouter } from "next/navigation"
import MyPageSidebar from "@/components/layout/MyPageSidebar"
import { useGetMemberInfo } from "@/hooks/useUser"
import AuthGuard from "@/components/auth/AuthGuard"
import { handleError } from "@/lib/utils/errorHandler"
import { useToast } from "@/hooks/useToast"

function PhoneChangePageContent() {
  const router = useRouter()
  const { toast } = useToast()

  // 이메일 인증 체크
  useEffect(() => {
    const emailVerified = sessionStorage.getItem('emailVerified')
    const emailVerifiedFor = sessionStorage.getItem('emailVerifiedFor')

    // 휴대폰 번호 변경용 인증이 완료되지 않았거나, 다른 용도로 인증된 경우
    if (!emailVerified || emailVerifiedFor !== 'phone_change') {
      router.push('/mypage/verify?purpose=phone_change')
    }
  }, [router])
  
  const { data: memberInfo = null, isLoading: loading } = useGetMemberInfo()
  const [phoneNumber1, setPhoneNumber1] = useState("")
  const [phoneNumber2, setPhoneNumber2] = useState("")
  const [phoneNumber3, setPhoneNumber3] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">페이지를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  const handlePhoneChange = async () => {
    if (!phoneNumber1 || !phoneNumber2 || !phoneNumber3) {
      toast({ title: "입력 오류", description: "휴대폰 번호를 모두 입력해주세요.", variant: "destructive" })
      return
    }

    const fullPhoneNumber = `${phoneNumber1}${phoneNumber2}${phoneNumber3}`
    const phoneRegex = /^01[0-9]{9}$/
    if (!phoneRegex.test(fullPhoneNumber)) {
      toast({ title: "입력 오류", description: "올바른 휴대폰 번호 형식을 입력해주세요.", variant: "destructive" })
      return
    }

    setIsSubmitting(true)
    try {
      await updatePhoneNumber(fullPhoneNumber)
      toast({ description: "휴대폰 번호 변경이 성공적으로 처리되었습니다." })
      // 변경 완료 후 인증 상태 삭제
      sessionStorage.removeItem('emailVerified')
      sessionStorage.removeItem('emailVerifiedFor')
      router.push("/mypage")
    } catch (error: unknown) {
      console.error('휴대폰 번호 변경 실패:', error)
      toast({ title: "오류", description: handleError(error, "휴대폰 번호 변경에 실패했습니다. 다시 시도해주세요."), variant: "destructive" })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Sidebar */}
          <MyPageSidebar memberInfo={memberInfo || undefined} />

          {/* Main Content */}
          <div className="flex-1">
            <Card>
              <CardContent className="p-8">
                <div className="mb-8">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">휴대폰 번호 변경</h2>
                  <div className="space-y-2 text-gray-700">
                    <p>• 로그인에 사용할 휴대폰 번호를 변경합니다.</p>
                    <p>• 변경된 휴대폰 번호로 회원정보의 휴대폰 번호가 자동 변경됩니다.</p>
                  </div>
                </div>

                <div className="mb-8">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">새 휴대폰 번호 입력</h3>
                  <div className="space-y-3 text-sm text-gray-700 mb-6">
                    <p>• 변경할 휴대폰 번호를 입력해주세요.</p>
                    <p>• 입력하신 휴대폰 번호로 인증 SMS가 발송됩니다.</p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">새 휴대폰 번호</label>
                      <div className="flex items-center space-x-2">
                        <Input
                          type="text"
                          value={phoneNumber1}
                          onChange={(e) => setPhoneNumber1(e.target.value)}
                          placeholder="010"
                          className="w-20 text-center"
                          maxLength={3}
                        />
                        <span className="text-gray-500">-</span>
                        <Input
                          type="text"
                          value={phoneNumber2}
                          onChange={(e) => setPhoneNumber2(e.target.value)}
                          placeholder="0000"
                          className="w-24 text-center"
                          maxLength={4}
                        />
                        <span className="text-gray-500">-</span>
                        <Input
                          type="text"
                          value={phoneNumber3}
                          onChange={(e) => setPhoneNumber3(e.target.value)}
                          placeholder="0000"
                          className="w-24 text-center"
                          maxLength={4}
                        />
                      </div>
                    </div>

                    <Button
                      onClick={handlePhoneChange}
                      disabled={isSubmitting}
                      className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full disabled:opacity-50"
                    >
                      {isSubmitting ? "처리 중..." : "휴대폰 번호 변경"}
                    </Button>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="font-medium text-yellow-800 mb-2">주의사항</h4>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    <li>• 휴대폰 번호 변경 후 기존 휴대폰 번호로는 로그인할 수 없습니다.</li>
                    <li>• 변경된 휴대폰 번호로 인증 SMS가 발송되므로 정확히 입력해주세요.</li>
                    <li>• 인증 SMS를 확인하여 변경을 완료해주세요.</li>
                    <li>• 멤버십 비밀번호와 휴대폰 번호를 동일하게 설정할 수 없습니다.</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function PhoneChangePage() {
  return (
    <AuthGuard>
      <PhoneChangePageContent />
    </AuthGuard>
  )
} 