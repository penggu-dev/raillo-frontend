"use client"

import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Train, Home, Printer, Eye, EyeOff, User, Mail, Lock, Phone } from "lucide-react"
import { signup } from "@/lib/api/signup"
import type { SignupRequest } from "@/types/authType"
import { validateSignupForm, formatPhoneNumber, removePhoneNumberFormatting, SignupFormData, Agreements, ValidationErrors } from "@/lib/validation/signup"
import { handleError } from '@/lib/utils/errorHandler'

export default function SignupPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<ValidationErrors>({})
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phoneNumber: "",
    birthDate: "",
    gender: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [agreements, setAgreements] = useState<Agreements>({
    terms: false,
    privacy: false,
    marketing: false,
  })

  // 생년월일 옵션들
  const currentYear = new Date().getFullYear()
  const yearOptions = Array.from({ length: 100 }, (_, i) => currentYear - i).reverse()
  const monthOptions = Array.from({ length: 12 }, (_, i) => i + 1)
  const [birthYear, setBirthYear] = useState<string>(currentYear.toString())
  const [birthMonth, setBirthMonth] = useState<string>('')
  const [birthDay, setBirthDay] = useState<string>('')

  // 날짜 옵션 계산
  const getDayOptions = () => {
    if (!birthYear || !birthMonth) return []
    const year = parseInt(birthYear)
    const month = parseInt(birthMonth)
    const daysInMonth = new Date(year, month, 0).getDate()
    return Array.from({ length: daysInMonth }, (_, i) => i + 1)
  }

  const dayOptions = getDayOptions()

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
    
    // 필드 수정 시 해당 에러 초기화
    if (errors[field as keyof ValidationErrors]) {
      setErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }))
    }
  }

  const handleBirthDateChange = (type: 'year' | 'month' | 'day', value: string) => {
    if (type === 'year') {
      setBirthYear(value)
      setBirthMonth('')
      setBirthDay('')
      setFormData(prev => ({ ...prev, birthDate: '' }))
    } else if (type === 'month') {
      setBirthMonth(value)
      setBirthDay('')
      setFormData(prev => ({ ...prev, birthDate: '' }))
    } else if (type === 'day') {
      setBirthDay(value)
    }

    // 생년월일 조합
    if (type === 'day' && birthYear && birthMonth && value) {
      const formattedMonth = birthMonth.padStart(2, '0')
      const formattedDay = value.padStart(2, '0')
      const newBirthDate = `${birthYear}-${formattedMonth}-${formattedDay}`
      setFormData(prev => ({ ...prev, birthDate: newBirthDate }))
    }

    // 생년월일 에러 초기화
    if (errors.birthDate) {
      setErrors((prev) => ({
        ...prev,
        birthDate: undefined,
      }))
    }
  }

  const handlePhoneChange = (value: string) => {
    const formatted = formatPhoneNumber(value)
    setFormData((prev) => ({
      ...prev,
      phoneNumber: formatted,
    }))
    
    // 휴대폰 번호 에러 초기화
    if (errors.phoneNumber) {
      setErrors((prev) => ({
        ...prev,
        phoneNumber: undefined,
      }))
    }
  }

  const handleAgreementChange = (field: string, checked: boolean) => {
    setAgreements((prev) => ({
      ...prev,
      [field]: checked,
    }))
    
    // 약관 동의 에러 초기화
    if (errors[field as keyof ValidationErrors]) {
      setErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }))
    }
  }

  const handleSubmit = async () => {
    // 폼 데이터 조합
    const signupFormData: SignupFormData = {
      name: formData.name,
      email: formData.email,
      password: formData.password,
      confirmPassword: formData.confirmPassword,
      phoneNumber: formData.phoneNumber,
      birthDate: formData.birthDate,
      gender: formData.gender,
    }

    // 유효성 검사
    const validationErrors = validateSignupForm(signupFormData, agreements)
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    setIsLoading(true)

    try {
      // 휴대폰 번호에서 하이픈 제거
      const phoneNumbersOnly = removePhoneNumberFormatting(formData.phoneNumber)

      if (formData.gender !== "M" && formData.gender !== "F") {
        throw new Error("성별 정보가 올바르지 않습니다.")
      }

      const signupData: SignupRequest = {
        name: formData.name,
        phoneNumber: phoneNumbersOnly,
        password: formData.password,
        email: formData.email,
        birthDate: formData.birthDate,
        gender: formData.gender,
      }

      const response = await signup(signupData)
      
      // 회원번호 추출
      const memberNo = response?.memberNo || '회원번호 없음'
      
      // localStorage에 회원번호 저장
      localStorage.setItem('signupMemberNo', memberNo)
      
      // 완료 페이지로 이동
      router.push("/signup/complete")
    } catch (error: unknown) {
      handleError(error, "회원가입에 실패했습니다.")
    } finally {
      setIsLoading(false)
    }
  }

  const passwordsMatch = formData.password && formData.confirmPassword && formData.password === formData.confirmPassword

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card className="bg-white shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-gray-900">회원가입</CardTitle>
              <CardDescription className="text-gray-600">RAILLO 회원이 되어 더 많은 혜택을 누리세요</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 성명 */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                  성명 <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="성명을 입력하세요"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className={`pl-10 ${errors.name ? "border-red-500" : ""}`}
                  />
                </div>
                {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
              </div>

              {/* 이메일 주소 */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  이메일 주소 <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="이메일 주소를 입력하세요"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className={`pl-10 ${errors.email ? "border-red-500" : ""}`}
                  />
                </div>
                {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
              </div>

              {/* 비밀번호 */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                  비밀번호 <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="비밀번호를 입력하세요"
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    className={`pl-10 pr-10 ${errors.password ? "border-red-500" : ""}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
                <p className="text-xs text-gray-500">8자 이상, 영문, 숫자, 특수문자를 포함해주세요.</p>
              </div>

              {/* 비밀번호 확인 */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                  비밀번호 확인 <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="비밀번호를 다시 입력하세요"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                    className={`pl-10 pr-10 ${errors.confirmPassword ? "border-red-500" : ""}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="text-xs text-red-500">{errors.confirmPassword}</p>}
                {formData.confirmPassword && !errors.confirmPassword && (
                  <p className={`text-xs ${passwordsMatch ? "text-green-600" : "text-red-500"}`}>
                    {passwordsMatch ? "비밀번호가 일치합니다." : "비밀번호가 일치하지 않습니다."}
                  </p>
                )}
              </div>

              {/* 휴대폰 번호 */}
              <div className="space-y-2">
                <Label htmlFor="phoneNumber" className="text-sm font-medium text-gray-700">
                  휴대폰 번호 <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="phoneNumber"
                    type="tel"
                    placeholder="휴대폰 번호를 입력하세요 (예: 010-1234-5678)"
                    value={formData.phoneNumber}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    className={`pl-10 ${errors.phoneNumber ? "border-red-500" : ""}`}
                  />
                </div>
                {errors.phoneNumber && <p className="text-xs text-red-500">{errors.phoneNumber}</p>}
              </div>

              {/* 생년월일 */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                  생년월일 <span className="text-red-500">*</span>
                </Label>
                <div className="flex space-x-2">
                  <div className="flex-1">
                    <select
                      value={birthYear}
                      onChange={(e) => handleBirthDateChange('year', e.target.value)}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.birthDate ? "border-red-500" : ""}`}
                    >
                      <option value="">년도</option>
                      {yearOptions.map((year) => (
                        <option key={year} value={year.toString()}>
                          {year}년
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex-1">
                    <select
                      value={birthMonth}
                      onChange={(e) => handleBirthDateChange('month', e.target.value)}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.birthDate ? "border-red-500" : ""}`}
                    >
                      <option value="">월</option>
                      {monthOptions.map((month) => (
                        <option key={month} value={month.toString()}>
                          {month}월
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex-1">
                    <select
                      value={birthDay}
                      onChange={(e) => handleBirthDateChange('day', e.target.value)}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.birthDate ? "border-red-500" : ""}`}
                    >
                      <option value="">일</option>
                      {dayOptions.map((day) => (
                        <option key={day} value={day.toString()}>
                          {day}일
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                {errors.birthDate && <p className="text-xs text-red-500">{errors.birthDate}</p>}
              </div>

              {/* 성별 */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                  성별 <span className="text-red-500">*</span>
                </Label>
                <div className="flex space-x-4">
                  <Button
                    type="button"
                    variant={formData.gender === "M" ? "default" : "outline"}
                    onClick={() => {
                      handleInputChange("gender", "M")
                      // 성별 에러 초기화
                      if (errors.gender) {
                        setErrors((prev) => ({
                          ...prev,
                          gender: undefined,
                        }))
                      }
                    }}
                    className={`flex-1 ${formData.gender === "M" ? "bg-blue-600 text-white" : "border-gray-300"}`}
                  >
                    남성
                  </Button>
                  <Button
                    type="button"
                    variant={formData.gender === "F" ? "default" : "outline"}
                    onClick={() => {
                      handleInputChange("gender", "F")
                      // 성별 에러 초기화
                      if (errors.gender) {
                        setErrors((prev) => ({
                          ...prev,
                          gender: undefined,
                        }))
                      }
                    }}
                    className={`flex-1 ${formData.gender === "F" ? "bg-blue-600 text-white" : "border-gray-300"}`}
                  >
                    여성
                  </Button>
                </div>
                {errors.gender && <p className="text-xs text-red-500">{errors.gender}</p>}
              </div>

              {/* 약관 동의 */}
              <div className="space-y-4 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">약관 동의</h3>

                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="terms"
                      checked={agreements.terms}
                      onCheckedChange={(checked) => handleAgreementChange("terms", checked as boolean)}
                    />
                    <Label htmlFor="terms" className="text-sm text-gray-700">
                      <span className="text-red-500">[필수]</span> 이용약관에 동의합니다.
                    </Label>
                    <Link href="#" className="text-blue-600 hover:text-blue-700 text-sm">
                      보기
                    </Link>
                  </div>
                  {errors.terms && <p className="text-xs text-red-500 ml-6">{errors.terms}</p>}

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="privacy"
                      checked={agreements.privacy}
                      onCheckedChange={(checked) => handleAgreementChange("privacy", checked as boolean)}
                    />
                    <Label htmlFor="privacy" className="text-sm text-gray-700">
                      <span className="text-red-500">[필수]</span> 개인정보 수집 및 이용에 동의합니다.
                    </Label>
                    <Link href="#" className="text-blue-600 hover:text-blue-700 text-sm">
                      보기
                    </Link>
                  </div>
                  {errors.privacy && <p className="text-xs text-red-500 ml-6">{errors.privacy}</p>}

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="marketing"
                      checked={agreements.marketing}
                      onCheckedChange={(checked) => handleAgreementChange("marketing", checked as boolean)}
                    />
                    <Label htmlFor="marketing" className="text-sm text-gray-700">
                      [선택] 마케팅 정보 수신에 동의합니다.
                    </Label>
                  </div>
                </div>
              </div>

              {/* 회원가입 버튼 */}
              <Button
                onClick={handleSubmit}
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 mt-8"
                size="lg"
              >
                {isLoading ? "회원가입 중..." : "회원가입 완료"}
              </Button>

              {/* 추가 링크 */}
              <div className="text-center pt-4">
                <p className="text-sm text-gray-600">
                  이미 RAILLO 회원이신가요?{" "}
                  <Link href="/login" className="text-blue-600 hover:text-blue-700 font-semibold">
                    로그인하기
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
