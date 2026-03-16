"use client"

import Link from "next/link"
import {useEffect, useState} from "react"
import {Button} from "@/components/ui/button"
import {Card, CardContent} from "@/components/ui/card"
import {
  Lock,
  Mail,
  Smartphone,
} from "lucide-react"
import { getMemberInfo } from "@/lib/api/user"
import type { MemberInfo } from "@/types/userType"
import MyPageSidebar from "@/components/layout/MyPageSidebar"
import AuthGuard from "@/components/auth/AuthGuard"

function MyPageContent() {
  const [memberInfo, setMemberInfo] = useState<MemberInfo | null>(null)
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    const fetchMemberInfo = async () => {
      try {
        const info = await getMemberInfo()
        setMemberInfo(info)
      } catch (error) {
        console.error('회원 정보 조회 실패:', error)
        // 에러 발생 시에도 페이지는 표시하되, 기본값 사용
      } finally {
        setLoading(false)
      }
    }

    fetchMemberInfo()
  }, [])

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

  // 회원 정보가 없을 때 기본값 사용
  const displayName = memberInfo?.name || "회원"
  const displayMemberId = memberInfo?.memberId || "로딩 중..."
  const displayEmail = memberInfo?.email || "인증 필요"
  const displayPhone = memberInfo?.phoneNumber || "인증 필요"

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Sidebar */}
          <MyPageSidebar memberInfo={memberInfo || undefined} />

          {/* Main Content */}
          <div className="flex-1">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">나의 기본정보</h1>
            </div>

            <Card>
              <CardContent className="p-6">
                <div className="space-y-2">
                  {/* 회원명 */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center py-5 border-b border-gray-100">
                    <div className="font-medium text-gray-700">회원명</div>
                    <div className="md:col-span-2">
                      <span className="text-lg">{displayName}</span>
                    </div>
                  </div>

                  {/* 멤버십 번호 */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center py-5 border-b border-gray-100">
                    <div className="font-medium text-gray-700">멤버십 번호</div>
                    <div className="md:col-span-2">
                      <span className="text-lg">{displayMemberId}</span>
                    </div>
                  </div>

                  {/* 비밀번호 */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center py-5 border-b border-gray-100">
                    <div className="font-medium text-gray-700">비밀번호</div>
                    <div className="md:col-span-2">
                      <Link href="/mypage/password/change">
                        <Button variant="outline" size="sm" className="h-8 px-4 text-sm rounded-full">
                          <Lock className="h-4 w-4 mr-2" />
                          비밀번호 변경
                        </Button>
                      </Link>
                    </div>
                  </div>

                  {/* 이메일 */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center py-5 border-b border-gray-100">
                    <div className="font-medium text-gray-700">이메일</div>
                    <div className="md:col-span-2">
                      <Link href="/mypage/email/change">
                        <Button variant="outline" size="sm" className="h-8 px-4 text-sm rounded-full">
                          <Mail className="h-4 w-4 mr-2" />
                          이메일 변경
                        </Button>
                      </Link>
                    </div>
                  </div>

                  {/* 휴대폰 번호 */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center py-5">
                    <div className="font-medium text-gray-700">휴대폰 번호</div>
                    <div className="md:col-span-2">
                      <Link href="/mypage/phone/change">
                        <Button variant="outline" size="sm" className="h-8 px-4 text-sm rounded-full">
                          <Smartphone className="h-4 w-4 mr-2" />
                          휴대폰 번호 변경
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function MyPage() {
  return (
    <AuthGuard>
      <MyPageContent />
    </AuthGuard>
  )
}
