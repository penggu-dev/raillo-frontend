"use client"

import Link from "next/link"
import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Train, ChevronLeft, Home, ChevronRight, ChevronUp, ChevronDown, Printer } from "lucide-react"
import { format } from "date-fns"
import { ko } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { TRAIN_TYPE } from "@/constants/trainType"
import { useToast } from "@/hooks/useToast"

export default function GuestBookingPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [name, setName] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [password, setPassword] = useState("")
  const [passwordConfirm, setPasswordConfirm] = useState("")
  const [agreeTerms, setAgreeTerms] = useState(false)
  const [showNotice, setShowNotice] = useState(false)

  // URL에서 예약 정보 가져오기 (실제로는 이전 페이지에서 전달받음)
  const trainInfo = {
    trainType: searchParams.get("trainType") || TRAIN_TYPE.KTX,
    trainNumber: searchParams.get("trainNumber") || "101",
    departure: searchParams.get("departure") || "서울",
    arrival: searchParams.get("arrival") || "부산",
    date: searchParams.get("date") || "2025-06-02",
    time: searchParams.get("time") || "06:00",
    seatType: searchParams.get("seatType") || "일반실",
    price: searchParams.get("price") || "59800",
  }

  const handlePhoneNumberChange = (value: string) => {
    // 숫자만 입력 허용
    const numericValue = value.replace(/[^0-9]/g, "")
    setPhoneNumber(numericValue)
  }

  const handlePasswordChange = (value: string) => {
    // 숫자만 입력 허용, 5자리 제한
    const numericValue = value.replace(/[^0-9]/g, "").slice(0, 5)
    setPassword(numericValue)
  }

  const handlePasswordConfirmChange = (value: string) => {
    // 숫자만 입력 허용, 5자리 제한
    const numericValue = value.replace(/[^0-9]/g, "").slice(0, 5)
    setPasswordConfirm(numericValue)
  }

  const handleCancel = () => {
    router.back()
  }

  const handleNext = () => {
    // 유효성 검사
    if (!name.trim()) {
      toast({ title: "입력 오류", description: "이름을 입력해주세요.", variant: "destructive" })
      return
    }

    if (!phoneNumber || phoneNumber.length < 10) {
      toast({ title: "입력 오류", description: "올바른 전화번호를 입력해주세요.", variant: "destructive" })
      return
    }

    if (!password || password.length !== 5) {
      toast({ title: "입력 오류", description: "비밀번호는 숫자 5자리로 입력해주세요.", variant: "destructive" })
      return
    }

    if (password !== passwordConfirm) {
      toast({ title: "입력 오류", description: "비밀번호가 일치하지 않습니다.", variant: "destructive" })
      return
    }

    if (!agreeTerms) {
      toast({ title: "입력 오류", description: "개인정보 수집 및 이용에 동의해주세요.", variant: "destructive" })
      return
    }

    // 비회원 예매 정보를 세션에 저장하고 결제 페이지로 이동
    const guestBookingData = {
      name,
      phoneNumber,
      password,
      trainInfo,
      isGuest: true,
    }

    // 실제로는 세션 스토리지나 상태 관리에 저장
    sessionStorage.setItem("guestBookingData", JSON.stringify(guestBookingData))

    // 결제 페이지로 이동
    router.push("/ticket/payment")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Blue Header Section */}
      <div className="bg-blue-500 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold">비회원 예매</h1>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Home className="h-4 w-4" />
            <Link href="/" className="hover:text-blue-600">
              홈
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-blue-600">비회원 예매</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Information Text */}
          <div className="text-center mb-8">
            <p className="text-lg text-gray-700 mb-2">
              아래 입력하시는 정보는 승차권 확인, 반환, 재발권 시 필요한 정보입니다. 정확히 입력해 주세요.
            </p>
            <p className="text-sm text-red-600">*표시 필수입력 항목</p>
          </div>

          {/* Form Card */}
          <Card className="mb-6">
            <CardContent className="p-8">
              <div className="space-y-6">
                {/* Name Field */}
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-base font-medium">
                    이름<span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="본인 이름을 입력"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="h-12 text-base bg-blue-50 border-blue-200"
                  />
                </div>

                {/* Phone Number Field */}
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber" className="text-base font-medium">
                    전화번호<span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="phoneNumber"
                    type="tel"
                    placeholder="'-' 를 제외, 전화번호 입력"
                    value={phoneNumber}
                    onChange={(e) => handlePhoneNumberChange(e.target.value)}
                    maxLength={11}
                    className="h-12 text-base bg-blue-50 border-blue-200"
                  />
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-base font-medium">
                    비밀번호<span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="숫자 5자리 입력"
                    value={password}
                    onChange={(e) => handlePasswordChange(e.target.value)}
                    maxLength={5}
                    className="h-12 text-base bg-blue-50 border-blue-200"
                  />
                </div>

                {/* Password Confirmation Field */}
                <div className="space-y-2">
                  <Label htmlFor="passwordConfirm" className="text-base font-medium">
                    비밀번호 확인<span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="passwordConfirm"
                    type="password"
                    placeholder="숫자 5자리 입력"
                    value={passwordConfirm}
                    onChange={(e) => handlePasswordConfirmChange(e.target.value)}
                    maxLength={5}
                    className="h-12 text-base bg-blue-50 border-blue-200"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Terms Agreement */}
          <div className="mb-6">
            <div className="flex items-center space-x-3">
              <Checkbox
                id="agreeTerms"
                checked={agreeTerms}
                onCheckedChange={(checked) => setAgreeTerms(checked === true)}
              />
              <Label htmlFor="agreeTerms" className="text-base">
                [필수] 개인정보 수집 및 이용 동의함
              </Label>
              <Button variant="outline" size="sm" className="text-sm">
                약관보기
              </Button>
            </div>
          </div>

          {/* Notice Section */}
          <Card className="mb-8">
            <Collapsible open={showNotice} onOpenChange={setShowNotice}>
              <CollapsibleTrigger className="w-full">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">안내</h3>
                    {showNotice ? (
                      <ChevronUp className="h-5 w-5 text-gray-500" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-500" />
                    )}
                  </div>
                </CardContent>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="pt-0 pb-4 px-4">
                  <div className="text-sm text-gray-600">
                    <p>• 비회원 발권 시 결제는 카드결제와 간편결제만 가능합니다.</p>
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-center space-x-4">
            <Button variant="outline" size="lg" onClick={handleCancel} className="px-8 py-3 text-base rounded-full">
              취소
            </Button>
            <Button
              size="lg"
              onClick={handleNext}
              className="px-8 py-3 text-base bg-blue-600 hover:bg-blue-700 rounded-full"
            >
              다음
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
