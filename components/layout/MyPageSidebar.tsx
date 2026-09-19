"use client"

import Link from "next/link"
import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Skeleton } from "@/components/ui/skeleton"
import {
  ChevronDown,
  Settings,
  Ticket,
  Train,
  User,
} from "lucide-react"

interface MyPageSidebarProps {
  memberInfo?: {
    name: string
  }
  /** 회원 정보를 불러오는 중이면 이름 자리에 스켈레톤을 보여 줌 */
  isLoading?: boolean
}

export default function MyPageSidebar({ memberInfo, isLoading = false }: MyPageSidebarProps) {
  const [openSections, setOpenSections] = useState<{ [key: string]: boolean }>({
    ticketInfo: false,
    memberInfoManagement: false,
  })

  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  // 이름을 못 받았을 때(조회 실패 등) "회원 회원님"이 되지 않게 이름 없이 표시
  const greeting = memberInfo?.name ? `${memberInfo.name} 회원님` : "회원님"

  return (
    <div className="lg:w-80">
      {/* Profile Header */}
      <Card className="mb-6 bg-primary text-primary-foreground">
        <CardContent className="p-6 text-center">
          <div className="mb-4">
            <Train className="h-16 w-16 mx-auto mb-2 text-primary-foreground" />
            <h2 className="text-xl font-bold">마이페이지</h2>
            <p className="text-primary-foreground">마이페이지</p>
          </div>
        </CardContent>
      </Card>

      {/* User Info Card */}
      <Card className="mb-6">
        <CardContent className="p-4">
          {isLoading ? (
            <div role="status">
              <span className="sr-only">회원 정보를 불러오는 중</span>
              <Skeleton className="h-7 w-32" />
            </div>
          ) : (
            <h3 className="font-bold text-lg">{greeting}</h3>
          )}
        </CardContent>
      </Card>

      {/* Navigation Menu */}
      <Card>
        <CardContent className="p-0">
          <nav className="space-y-1">
            {/* 마이페이지 */}
            <Link
              href="/mypage"
              className="flex items-center space-x-3 px-4 py-3 hover:bg-muted transition-colors"
            >
              <User className="h-5 w-5 text-muted-foreground" />
              <span>마이페이지</span>
            </Link>

            {/* 승차권 정보 */}
            <Collapsible open={openSections.ticketInfo} onOpenChange={() => toggleSection("ticketInfo")}>
              <CollapsibleTrigger className="flex items-center justify-between w-full px-4 py-3 hover:bg-muted transition-colors">
                <div className="flex items-center space-x-3">
                  <Ticket className="h-5 w-5 text-muted-foreground" />
                  <span>승차권 정보</span>
                </div>
                <ChevronDown
                  className={`h-4 w-4 text-muted-foreground transition-transform ${
                    openSections.ticketInfo ? "rotate-180" : ""
                  }`}
                />
              </CollapsibleTrigger>
              <CollapsibleContent className="bg-muted">
                <Link
                  href="/ticket/purchased"
                  className="flex items-center space-x-3 px-8 py-2 text-sm text-muted-foreground hover:text-primary"
                >
                  <span>승차권 확인</span>
                </Link>
                <Link
                  href="/ticket/reservations"
                  className="flex items-center space-x-3 px-8 py-2 text-sm text-muted-foreground hover:text-primary"
                >
                  <span>예약승차권 조회/취소</span>
                </Link>
                <Link
                  href="/ticket/history"
                  className="flex items-center space-x-3 px-8 py-2 text-sm text-muted-foreground hover:text-primary"
                >
                  <span>승차권 구입이력</span>
                </Link>
              </CollapsibleContent>
            </Collapsible>

            {/* 회원정보관리 */}
            <Collapsible
              open={openSections.memberInfoManagement}
              onOpenChange={() => toggleSection("memberInfoManagement")}
            >
              <CollapsibleTrigger className="flex items-center justify-between w-full px-4 py-3 hover:bg-muted transition-colors">
                <div className="flex items-center space-x-3">
                  <Settings className="h-5 w-5 text-muted-foreground" />
                  <span>회원정보관리</span>
                </div>
                <ChevronDown
                  className={`h-4 w-4 text-muted-foreground transition-transform ${
                    openSections.memberInfoManagement ? "rotate-180" : ""
                  }`}
                />
              </CollapsibleTrigger>
              <CollapsibleContent className="bg-muted">
                <Link
                  href="/mypage/password/change"
                  className="flex items-center space-x-3 px-8 py-2 text-sm text-muted-foreground hover:text-primary"
                >
                  <span>비밀번호 변경</span>
                </Link>
                <Link
                  href="/mypage/email/change"
                  className="flex items-center space-x-3 px-8 py-2 text-sm text-muted-foreground hover:text-primary"
                >
                  <span>이메일 변경</span>
                </Link>
                <Link
                  href="/mypage/phone/change"
                  className="flex items-center space-x-3 px-8 py-2 text-sm text-muted-foreground hover:text-primary"
                >
                  <span>휴대폰 번호 변경</span>
                </Link>
                <Link
                  href="/mypage/withdraw"
                  className="flex items-center space-x-3 px-8 py-2 text-sm text-muted-foreground hover:text-primary"
                >
                  <span>회원탈퇴</span>
                </Link>
              </CollapsibleContent>
            </Collapsible>
          </nav>
        </CardContent>
      </Card>
    </div>
  )
}
