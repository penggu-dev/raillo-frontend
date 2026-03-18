"use client"

import Link from "next/link"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileText, User, Lock, Mail, ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import PageLayout from "@/components/layout/PageLayout"
import { findMemberNo, verifyMemberNo, findPassword, verifyPassword, changePassword } from "@/lib/api/auth"
import { handleError } from "@/lib/utils/errorHandler"
import { useToast } from "@/hooks/use-toast"

export default function FindAccountPage() {
  const [memberName, setMemberName] = useState("")
  const [memberPhone, setMemberPhone] = useState("")
  const [passwordName, setPasswordName] = useState("")
  const [passwordMemberNumber, setPasswordMemberNumber] = useState("")
  const [activeTab, setActiveTab] = useState("member")
  
  // 회원번호 찾기 관련 상태
  const [isLoading, setIsLoading] = useState(false)
  const [showVerification, setShowVerification] = useState(false)
  const [userEmail, setUserEmail] = useState("")
  const [authCode, setAuthCode] = useState("")
  const [memberNo, setMemberNo] = useState("")

  // 비밀번호 찾기 관련 상태
  const [showPasswordVerification, setShowPasswordVerification] = useState(false)
  const [showPasswordChange, setShowPasswordChange] = useState(false)
  const [showPasswordSuccess, setShowPasswordSuccess] = useState(false)
  const [passwordUserEmail, setPasswordUserEmail] = useState("")
  const [passwordAuthCode, setPasswordAuthCode] = useState("")
  const [temporaryToken, setTemporaryToken] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const loginRedirectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const router = useRouter()
  const { toast } = useToast()

  // 페이지 로드 시 URL 파라미터와 sessionStorage에서 상태 복원
  useEffect(() => {
    // URL 파라미터에서 탭 확인
    const urlParams = new URLSearchParams(window.location.search)
    const tabParam = urlParams.get('tab')
    
    if (tabParam === 'password') {
      setActiveTab('password')
    } else if (tabParam === 'member') {
      setActiveTab('member')
    }
    // 기본값은 member (회원번호 찾기)
    
    // sessionStorage에서 비밀번호 찾기 상태 복원
    const tempToken = sessionStorage.getItem('tempPasswordToken')
    const tempEmail = sessionStorage.getItem('tempPasswordEmail')
    
    if (tempToken && tempEmail) {
      setTemporaryToken(tempToken)
      setPasswordUserEmail(tempEmail)
      setShowPasswordChange(true)
      setActiveTab('password') // 비밀번호 변경 화면이면 비밀번호 탭으로
    }
  }, [])

  useEffect(() => {
    return () => {
      if (loginRedirectTimeoutRef.current) {
        clearTimeout(loginRedirectTimeoutRef.current)
      }
    }
  }, [])

  const handleFindMember = async () => {
    if (!memberName || !memberPhone) {
      toast({ title: "입력 오류", description: "이름과 휴대폰번호를 모두 입력해주세요.", variant: "destructive" })
      return
    }

    if (memberPhone.length !== 11) {
      toast({ title: "입력 오류", description: "휴대폰번호는 11자리여야 합니다.", variant: "destructive" })
      return
    }

    if (isLoading) return

    setIsLoading(true)

    try {
      const response = await findMemberNo({
        name: memberName,
        phoneNumber: memberPhone
      })

      if (response.result) {
        setUserEmail(response.result.email)
        setShowVerification(true)
      }
    } catch (error: unknown) {
      toast({ title: "오류", description: handleError(error, "회원번호 찾기에 실패했습니다."), variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyAuthCode = async (skipLengthCheck = false) => {
    if (!authCode) {
      toast({ title: "입력 오류", description: "인증 코드를 입력해주세요.", variant: "destructive" })
      return
    }

    if (!skipLengthCheck && authCode.length !== 6) {
      toast({ title: "입력 오류", description: "인증 코드는 6자리여야 합니다.", variant: "destructive" })
      return
    }

    if (isLoading) return

    setIsLoading(true)

    try {
      const response = await verifyMemberNo({
        email: userEmail,
        authCode: authCode
      })

      // 성공 응답 처리 (result가 있거나 성공 메시지가 있는 경우)
      if (response.result && response.result.memberNo) {
        setMemberNo(response.result.memberNo)
        // 회원번호를 sessionStorage에 저장 (브라우저 세션 동안만 유지)
        sessionStorage.setItem('foundMemberNo', response.result.memberNo)
        // 회원번호 찾기 결과 페이지로 이동
        router.push('/find-account/result')
      } else {
        // 응답은 성공했지만 예상한 데이터가 없는 경우
        console.error('Unexpected response format:', response)
        toast({ title: "오류", description: "인증은 성공했지만 회원번호를 찾을 수 없습니다. 다시 시도해주세요.", variant: "destructive" })
      }
    } catch (error: unknown) {
      console.error('Verification error:', error)
      toast({ title: "오류", description: handleError(error, "인증 코드 검증에 실패했습니다."), variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  // 인증 코드 입력 처리 (숫자만 허용)
  const handleAuthCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '') // 숫자만 허용
    setAuthCode(value)
  }

  // 버튼 클릭 시 인증
  const handleVerifyAuthCodeClick = () => {
    handleVerifyAuthCode(false)
  }

  // 휴대폰 번호 입력 처리 (숫자만 허용, 11자리 제한)
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '') // 숫자만 허용
    if (value.length <= 11) { // 11자리 제한
      setMemberPhone(value)
    }
  }

  const handleBackToFind = () => {
    setShowVerification(false)
    setAuthCode("")
    setUserEmail("")
  }

  const handleFindPassword = async () => {
    if (!passwordName || !passwordMemberNumber) {
      toast({ title: "입력 오류", description: "이름과 회원번호를 모두 입력해주세요.", variant: "destructive" })
      return
    }

    if (isLoading) return

    setIsLoading(true)

    try {
      const response = await findPassword({
        name: passwordName,
        memberNo: passwordMemberNumber
      })

      if (response.result) {
        setPasswordUserEmail(response.result.email)
        setShowPasswordVerification(true)
      }
    } catch (error: unknown) {
      toast({ title: "오류", description: handleError(error, "비밀번호 찾기에 실패했습니다."), variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyPasswordAuthCode = async (skipLengthCheck = false) => {
    if (!passwordAuthCode) {
      toast({ title: "입력 오류", description: "인증 코드를 입력해주세요.", variant: "destructive" })
      return
    }

    if (!skipLengthCheck && passwordAuthCode.length !== 6) {
      toast({ title: "입력 오류", description: "인증 코드는 6자리여야 합니다.", variant: "destructive" })
      return
    }

    if (isLoading) return

    setIsLoading(true)

    try {
      const response = await verifyPassword({
        email: passwordUserEmail,
        authCode: passwordAuthCode
      })

      // 성공 응답 처리 (result가 있고 temporaryToken이 있는 경우)
      if (response.result && response.result.temporaryToken) {
        const token = response.result.temporaryToken
        setTemporaryToken(token)
        // 임시 토큰을 sessionStorage에 저장 (페이지 새로고침 시에도 유지)
        sessionStorage.setItem('tempPasswordToken', token)
        sessionStorage.setItem('tempPasswordEmail', passwordUserEmail)
        setShowPasswordChange(true)
      } else {
        // 응답은 성공했지만 예상한 데이터가 없는 경우
        console.error('Unexpected response format:', response)
        toast({ title: "오류", description: "인증은 성공했지만 임시 토큰을 받을 수 없습니다. 다시 시도해주세요.", variant: "destructive" })
      }
    } catch (error: unknown) {
      console.error('Password verification error:', error)
      toast({ title: "오류", description: handleError(error, "인증 코드 검증에 실패했습니다."), variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  // 비밀번호 찾기 인증 코드 입력 처리 (숫자만 허용)
  const handlePasswordAuthCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '') // 숫자만 허용
    setPasswordAuthCode(value)
  }

  // 비밀번호 찾기 버튼 클릭 시 인증
  const handleVerifyPasswordAuthCodeClick = () => {
    handleVerifyPasswordAuthCode(false)
  }

  const handleChangePassword = async () => {
    if (!newPassword || !confirmPassword) {
      toast({ title: "입력 오류", description: "새 비밀번호와 확인 비밀번호를 모두 입력해주세요.", variant: "destructive" })
      return
    }

    if (newPassword !== confirmPassword) {
      toast({ title: "입력 오류", description: "새 비밀번호와 확인 비밀번호가 일치하지 않습니다.", variant: "destructive" })
      return
    }

    if (newPassword.length < 8) {
      toast({ title: "입력 오류", description: "비밀번호는 8자 이상이어야 합니다.", variant: "destructive" })
      return
    }

    if (isLoading) return

    setIsLoading(true)

    try {
      // sessionStorage에서 임시 토큰 가져오기 (상태보다 우선)
      const token = sessionStorage.getItem('tempPasswordToken') || temporaryToken
      
      if (!token) {
        toast({ title: "오류", description: "임시 토큰이 만료되었습니다. 다시 인증해주세요.", variant: "destructive" })
        handleBackToPasswordFind()
        return
      }

      // 임시 토큰을 사용하여 비밀번호 변경 요청
      const response = await changePassword({
        newPassword: newPassword
      }, token)

      // API 호출이 성공했다면 (catch 블록에 들어가지 않았다면) 성공으로 간주
      // 성공 상태로 변경
      setShowPasswordSuccess(true)
      // 임시 토큰과 관련 데이터 삭제
      setTemporaryToken("")
      sessionStorage.removeItem('tempPasswordToken')
      sessionStorage.removeItem('tempPasswordEmail')
      
      // 3초 후 로그인 페이지로 자동 이동
      loginRedirectTimeoutRef.current = setTimeout(() => {
        router.push('/login')
      }, 3000)
    } catch (error: unknown) {
      console.error('Password change error:', error)
      toast({ title: "오류", description: handleError(error, "비밀번호 변경에 실패했습니다."), variant: "destructive" })
      // 에러 발생 시 임시 토큰 삭제 (보안상)
      setTemporaryToken("")
      sessionStorage.removeItem('tempPasswordToken')
      sessionStorage.removeItem('tempPasswordEmail')
    } finally {
      setIsLoading(false)
    }
  }

  const handleBackToPasswordFind = () => {
    setShowPasswordVerification(false)
    setShowPasswordChange(false)
    setShowPasswordSuccess(false)
    setPasswordAuthCode("")
    setPasswordUserEmail("")
    setTemporaryToken("")
    setNewPassword("")
    setConfirmPassword("")
    // sessionStorage에서도 관련 데이터 삭제
    sessionStorage.removeItem('tempPasswordToken')
    sessionStorage.removeItem('tempPasswordEmail')
  }



  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Page Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">회원번호/비밀번호 찾기</h1>
            <p className="text-gray-600">본인확인을 통해 회원정보를 찾으실 수 있습니다</p>
          </div>

          <Card className="bg-white shadow-lg">
            <CardContent className="p-8">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-8 h-14">
                  <TabsTrigger
                    value="member"
                    className="text-base font-medium py-4 px-6 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md"
                  >
                    회원번호 찾기
                  </TabsTrigger>
                  <TabsTrigger
                    value="password"
                    className="text-base font-medium py-4 px-6 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md"
                  >
                    비밀번호 찾기
                  </TabsTrigger>
                </TabsList>

                {/* 회원번호 찾기 */}
                <TabsContent value="member" className="space-y-6">
                  {!showVerification ? (
                    <>
                      <div className="text-center mb-6">
                        <p className="text-gray-700">
                          본인이름과 회원가입 시 입력한 휴대전화 번호로 회원번호를 찾으실 수 있습니다.
                          <br />
                          이메일 인증을 통해 본인 확인 후 회원번호를 확인할 수 있습니다.
                        </p>
                      </div>

                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="memberName" className="text-sm font-medium text-gray-700">
                              이름
                            </Label>
                            <div className="relative">
                              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                              <Input
                                id="memberName"
                                type="text"
                                placeholder="본인이름을 입력하세요"
                                value={memberName}
                                onChange={(e) => setMemberName(e.target.value)}
                                className="pl-10"
                                disabled={isLoading}
                              />
                            </div>
                          </div>

                                                  <div className="space-y-2">
                          <Label htmlFor="memberPhone" className="text-sm font-medium text-gray-700">
                            휴대폰번호
                          </Label>
                          <Input
                            id="memberPhone"
                            type="tel"
                            placeholder="휴대폰번호를 -없이 입력하세요 (11자리)"
                            value={memberPhone}
                            onChange={handlePhoneChange}
                            maxLength={11}
                            disabled={isLoading}
                          />
                        </div>
                        </div>

                        <div className="text-center pt-4">
                          <Button
                            onClick={handleFindMember}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3"
                            size="lg"
                            disabled={isLoading}
                          >
                            {isLoading ? (
                              <div className="flex items-center justify-center">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                처리 중...
                              </div>
                            ) : (
                              "회원번호 찾기"
                            )}
                          </Button>
                        </div>
                      </div>

                      {/* 안내 사항 */}
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-start space-x-3">
                          <FileText className="h-5 w-5 text-blue-600 mt-1 flex-shrink-0" />
                          <div>
                            <h3 className="font-semibold text-gray-900 mb-1">회원번호 찾기 안내</h3>
                            <p className="text-sm text-gray-600 leading-relaxed">
                              등록된 이메일 주소로 인증 코드가 전송됩니다. 이메일을 확인하여 6자리 인증 코드를 입력해주세요.
                              <br />
                              휴대폰번호가 변경되었거나 회원정보와 일치하지 않는 경우 고객센터로 문의해주세요.
                            </p>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* 뒤로가기 버튼 */}
                      <div className="mb-4">
                        <Button
                          variant="ghost"
                          onClick={handleBackToFind}
                          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
                          disabled={isLoading}
                        >
                          <ArrowLeft className="h-4 w-4" />
                          <span>뒤로가기</span>
                        </Button>
                      </div>

                      <div className="text-center mb-6">
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">이메일 인증</h3>
                        <p className="text-gray-700">
                          <span className="font-medium">{userEmail}</span>로 인증 코드를 전송했습니다.
                          <br />
                          이메일을 확인하여 인증 코드를 입력해주세요.
                        </p>
                      </div>

                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="authCode" className="text-sm font-medium text-gray-700">
                            인증 코드
                          </Label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                              id="authCode"
                              type="text"
                              placeholder="인증 코드 6자리를 입력하세요"
                              value={authCode}
                              onChange={handleAuthCodeChange}
                              className={`pl-10 ${authCode.length === 6 ? 'border-green-500 focus:border-green-500' : ''}`}
                              maxLength={6}
                              disabled={isLoading}
                            />
                            {authCode.length > 0 && (
                              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-400">
                                {authCode.length}/6
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="text-center pt-4">
                          <Button
                            onClick={handleVerifyAuthCodeClick}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3"
                            size="lg"
                            disabled={isLoading}
                          >
                            {isLoading ? (
                              <div className="flex items-center justify-center">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                인증 중...
                              </div>
                            ) : (
                              "인증 확인"
                            )}
                          </Button>
                        </div>
                      </div>

                      {/* 안내 사항 */}
                      <div className="bg-blue-50 rounded-lg p-4">
                        <div className="flex items-start space-x-3">
                          <Mail className="h-5 w-5 text-blue-600 mt-1 flex-shrink-0" />
                          <div>
                            <h3 className="font-semibold text-gray-900 mb-1">인증 코드 안내</h3>
                            <p className="text-sm text-gray-600 leading-relaxed">
                              이메일로 전송된 6자리 인증 코드를 입력해주세요. 인증 코드는 5분간 유효합니다.
                            </p>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </TabsContent>

                {/* 비밀번호 찾기 */}
                <TabsContent value="password" className="space-y-6">
                  {!showPasswordVerification && !showPasswordChange && !showPasswordSuccess ? (
                    <>
                      <div className="text-center mb-6">
                        <p className="text-gray-700">
                          본인이름과 회원번호를 입력 후 조회하세요.
                          <br />
                          이메일 인증을 통해 본인 확인 후 새 비밀번호를 설정할 수 있습니다.
                        </p>
                      </div>

                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="passwordName" className="text-sm font-medium text-gray-700">
                              이름
                            </Label>
                            <div className="relative">
                              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                              <Input
                                id="passwordName"
                                type="text"
                                placeholder="본인이름을 입력하세요"
                                value={passwordName}
                                onChange={(e) => setPasswordName(e.target.value)}
                                className="pl-10"
                                disabled={isLoading}
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="passwordMemberNumber" className="text-sm font-medium text-gray-700">
                              회원번호
                            </Label>
                            <div className="relative">
                              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                              <Input
                                id="passwordMemberNumber"
                                type="text"
                                placeholder="코레일 회원번호를 입력하세요"
                                value={passwordMemberNumber}
                                onChange={(e) => setPasswordMemberNumber(e.target.value)}
                                className="pl-10"
                                disabled={isLoading}
                              />
                            </div>
                          </div>
                        </div>

                        <div className="text-center pt-4">
                          <Button
                            onClick={handleFindPassword}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3"
                            size="lg"
                            disabled={isLoading}
                          >
                            {isLoading ? (
                              <div className="flex items-center justify-center">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                처리 중...
                              </div>
                            ) : (
                              "조회"
                            )}
                          </Button>
                        </div>
                      </div>

                      {/* 안내 사항 */}
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-start space-x-3">
                          <FileText className="h-5 w-5 text-blue-600 mt-1 flex-shrink-0" />
                          <div>
                            <h3 className="font-semibold text-gray-900 mb-1">비밀번호 찾기 안내</h3>
                            <p className="text-sm text-gray-600 leading-relaxed">
                              회원번호를 모르시는 경우 먼저 회원번호 찾기를 이용해 주세요. 본인 확인 후 등록된 이메일로
                              인증 코드가 전송되며, 인증 완료 시 새 비밀번호를 설정할 수 있습니다.
                            </p>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : showPasswordVerification && !showPasswordChange && !showPasswordSuccess ? (
                    <>
                      {/* 뒤로가기 버튼 */}
                      <div className="mb-4">
                        <Button
                          variant="ghost"
                          onClick={handleBackToPasswordFind}
                          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
                          disabled={isLoading}
                        >
                          <ArrowLeft className="h-4 w-4" />
                          <span>뒤로가기</span>
                        </Button>
                      </div>

                      <div className="text-center mb-6">
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">이메일 인증</h3>
                        <p className="text-gray-700">
                          <span className="font-medium">{passwordUserEmail}</span>로 인증 코드를 전송했습니다.
                          <br />
                          이메일을 확인하여 인증 코드를 입력해주세요.
                        </p>
                      </div>

                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="passwordAuthCode" className="text-sm font-medium text-gray-700">
                            인증 코드
                          </Label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                              id="passwordAuthCode"
                              type="text"
                              placeholder="인증 코드 6자리를 입력하세요"
                              value={passwordAuthCode}
                              onChange={handlePasswordAuthCodeChange}
                              className={`pl-10 ${passwordAuthCode.length === 6 ? 'border-green-500 focus:border-green-500' : ''}`}
                              maxLength={6}
                              disabled={isLoading}
                            />
                            {passwordAuthCode.length > 0 && (
                              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-400">
                                {passwordAuthCode.length}/6
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="text-center pt-4">
                          <Button
                            onClick={handleVerifyPasswordAuthCodeClick}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3"
                            size="lg"
                            disabled={isLoading}
                          >
                            {isLoading ? (
                              <div className="flex items-center justify-center">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                인증 중...
                              </div>
                            ) : (
                              "인증 확인"
                            )}
                          </Button>
                        </div>
                      </div>

                      {/* 안내 사항 */}
                      <div className="bg-blue-50 rounded-lg p-4">
                        <div className="flex items-start space-x-3">
                          <Mail className="h-5 w-5 text-blue-600 mt-1 flex-shrink-0" />
                          <div>
                            <h3 className="font-semibold text-gray-900 mb-1">인증 코드 안내</h3>
                            <p className="text-sm text-gray-600 leading-relaxed">
                              이메일로 전송된 6자리 인증 코드를 입력해주세요. 인증 코드는 5분간 유효합니다.
                            </p>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : showPasswordChange && !showPasswordSuccess ? (
                    <>
                      {/* 뒤로가기 버튼 */}
                      <div className="mb-4">
                        <Button
                          variant="ghost"
                          onClick={handleBackToPasswordFind}
                          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
                          disabled={isLoading}
                        >
                          <ArrowLeft className="h-4 w-4" />
                          <span>{isLoading ? "처리 중..." : "뒤로가기"}</span>
                        </Button>
                      </div>

                      <div className="text-center mb-6">
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">새 비밀번호 설정</h3>
                        <p className="text-gray-700">
                          새로운 비밀번호를 입력해주세요.
                        </p>
                      </div>

                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="newPassword" className="text-sm font-medium text-gray-700">
                            새 비밀번호
                          </Label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                              id="newPassword"
                              type="password"
                              placeholder="새 비밀번호를 입력하세요 (8자 이상)"
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                              className="pl-10"
                              disabled={isLoading}
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                            새 비밀번호 확인
                          </Label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                              id="confirmPassword"
                              type="password"
                              placeholder="새 비밀번호를 다시 입력하세요"
                              value={confirmPassword}
                              onChange={(e) => setConfirmPassword(e.target.value)}
                              className="pl-10"
                              disabled={isLoading}
                            />
                          </div>
                        </div>

                        <div className="text-center pt-4">
                          <Button
                            onClick={handleChangePassword}
                            className={`font-semibold px-8 py-3 ${
                              isLoading 
                                ? 'bg-gray-400 cursor-not-allowed' 
                                : 'bg-blue-600 hover:bg-blue-700 text-white'
                            }`}
                            size="lg"
                            disabled={isLoading}
                          >
                            {isLoading ? (
                              <div className="flex items-center justify-center">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                비밀번호 변경 중...
                              </div>
                            ) : (
                              "비밀번호 변경"
                            )}
                          </Button>
                        </div>
                      </div>

                      {/* 안내 사항 */}
                      <div className="bg-green-50 rounded-lg p-4">
                        <div className="flex items-start space-x-3">
                          <Lock className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
                          <div>
                            <h3 className="font-semibold text-gray-900 mb-1">비밀번호 변경 안내</h3>
                            <p className="text-sm text-gray-600 leading-relaxed">
                              비밀번호는 8자 이상이어야 하며, 영문, 숫자, 특수문자를 포함하는 것을 권장합니다.
                              비밀번호 변경 후 자동으로 로그인 페이지로 이동합니다.
                            </p>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* 비밀번호 변경 성공 화면 */}
                      <div className="text-center mb-8">
                        <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                          <svg className="h-10 w-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-4">비밀번호 변경 완료!</h3>
                        <p className="text-gray-700 text-lg mb-6">
                          비밀번호가 성공적으로 변경되었습니다.
                          <br />
                          <span className="text-blue-600 font-medium">3초 후 로그인 페이지로 이동합니다.</span>
                        </p>
                      </div>

                      <div className="text-center">
                        <Button
                          onClick={() => router.push('/login')}
                          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3"
                          size="lg"
                        >
                          바로 로그인하기
                        </Button>
                      </div>

                      {/* 안내 사항 */}
                      <div className="bg-green-50 rounded-lg p-4 mt-6">
                        <div className="flex items-start space-x-3">
                          <svg className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <div>
                            <h3 className="font-semibold text-gray-900 mb-1">변경 완료 안내</h3>
                            <p className="text-sm text-gray-600 leading-relaxed">
                              새로운 비밀번호로 로그인하실 수 있습니다. 보안을 위해 정기적으로 비밀번호를 변경하시는 것을 권장합니다.
                            </p>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </TabsContent>
              </Tabs>

              {/* 추가 링크 */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="flex justify-center space-x-6 text-sm">
                  <Link href="/login" className="text-blue-600 hover:text-blue-700 font-semibold">
                    로그인하기
                  </Link>
                  <span className="text-gray-300">|</span>
                  <Link href="/signup" className="text-blue-600 hover:text-blue-700 font-semibold">
                    회원가입하기
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageLayout>
  )
}
