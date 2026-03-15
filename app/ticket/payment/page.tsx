"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Label as UILabel } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  ArrowRight,
  AlertTriangle, 
  User,
  Loader2
} from "lucide-react"
import { useAuth } from '@/hooks/use-auth'
import { getReservationDetail } from '@/lib/api/booking'
import type { ReservationDetailResponse } from '@/types/bookingType'
import { processPaymentViaCard, processPaymentViaBankAccount } from '@/lib/api/payment'
import { handleError } from '@/lib/utils/errorHandler'
import { formatPrice, formatDate, formatTime } from "@/lib/utils/format"
import { getTrainTypeColor, getCarTypeName, getPassengerTypeName } from "@/lib/utils/ticketUtils"

export default function PaymentPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { isAuthenticated, isChecking } = useAuth({ redirectPath: '/ticket/payment' })
  
  // 상태 관리
  const [reservationData, setReservationData] = useState<ReservationDetailResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  
  // 결제 수단
  const [paymentMethod, setPaymentMethod] = useState("card")
  
  // 카드 결제 정보
  const [cardNumber1, setCardNumber1] = useState("")
  const [cardNumber2, setCardNumber2] = useState("")
  const [cardNumber3, setCardNumber3] = useState("")
  const [cardNumber4, setCardNumber4] = useState("")
  const [expiryMonth, setExpiryMonth] = useState("")
  const [expiryYear, setExpiryYear] = useState("25")
  const [rrn, setRrn] = useState("")
  const [cardPassword, setCardPassword] = useState("")
  const [installment, setInstallment] = useState("0")
  
  // 계좌이체 정보
  const [bankCode, setBankCode] = useState("")
  const [accountNumber, setAccountNumber] = useState("")
  const [accountHolderName, setAccountHolderName] = useState("")
  const [identificationNumber, setIdentificationNumber] = useState("")
  const [accountPassword, setAccountPassword] = useState("")
  
  // 약관 동의
  const [agreeTerms, setAgreeTerms] = useState(false)
  const [agreePersonalInfo, setAgreePersonalInfo] = useState(false)

  // URL 파라미터 또는 sessionStorage에서 예약 ID 추출
  const urlReservationId = searchParams.get('reservationId')
  const [reservationId, setReservationId] = useState<string | null>(null)

  useEffect(() => {
    // URL 파라미터가 있으면 우선 사용
    if (urlReservationId) {
      setReservationId(urlReservationId)
    } else {
      // sessionStorage에서 예약 ID 가져오기
      const tempReservationId = sessionStorage.getItem('tempReservationId')
      if (tempReservationId) {
        setReservationId(tempReservationId)
        // 사용 후 sessionStorage에서 제거
        sessionStorage.removeItem('tempReservationId')
      }
    }
  }, [urlReservationId])

  // 예약 정보 조회
  useEffect(() => {
    if (isChecking || !isAuthenticated) return
    
    if (!reservationId) {
      setError('예약 정보가 없습니다.')
      setLoading(false)
      return
    }

    const fetchReservation = async () => {
      try {
        setLoading(true)
        const response = await getReservationDetail(parseInt(reservationId))
        if (!response.result) {
          throw new Error("예약 상세 응답 데이터가 없습니다.")
        }
        setReservationData(response.result)
      } catch (err) {
        const errorMessage = handleError(err, '예약 정보 조회 중 오류가 발생했습니다.', false)
        setError(errorMessage)
        setReservationData(null)
      } finally {
        setLoading(false)
      }
    }

    fetchReservation()
  }, [isChecking, isAuthenticated, reservationId])

  const handleCardNumberChange = (value: string, field: number) => {
    const numericValue = value.replace(/[^0-9]/g, "").slice(0, 4)
    switch (field) {
      case 1: setCardNumber1(numericValue); break
      case 2: setCardNumber2(numericValue); break
      case 3: setCardNumber3(numericValue); break
      case 4: setCardNumber4(numericValue); break
    }
  }

  const validateCardPayment = () => {
    if (!cardNumber1 || !cardNumber2 || !cardNumber3 || !cardNumber4) {
      alert("카드 번호를 모두 입력해주세요.")
      return false
    }
    if (!expiryMonth || !expiryYear) {
      alert("유효기간을 입력해주세요.")
      return false
    }
    if (!rrn) {
      alert("주민등록번호 앞 6자리를 입력해주세요.")
      return false
    }
    if (!cardPassword) {
      alert("카드 비밀번호 앞 2자리를 입력해주세요.")
      return false
    }
    return true
  }

  const validateAccountPayment = () => {
    if (!bankCode) {
      alert("은행을 선택해주세요.")
      return false
    }
    if (!accountNumber) {
      alert("계좌번호를 입력해주세요.")
      return false
    }
    if (!accountHolderName) {
      alert("예금주명을 입력해주세요.")
      return false
    }
    if (!identificationNumber) {
      alert("주민등록번호 앞 6자리를 입력해주세요.")
      return false
    }
    if (!accountPassword) {
      alert("계좌 비밀번호를 입력해주세요.")
      return false
    }
    return true
  }

  const handlePayment = async () => {
    if (!reservationData) {
      alert("예약 정보를 불러올 수 없습니다.")
      return
    }

    if (!agreeTerms) {
      alert("이용약관에 동의해주세요.")
      return
    }

    if (paymentMethod === "card" && !agreePersonalInfo) {
      alert("개인정보 수집 및 이용동의에 동의해주세요.")
      return
    }

    setIsProcessing(true)

    try {
      if (paymentMethod === "card") {
        if (!validateCardPayment()) return

        const cardNumber = `${cardNumber1}-${cardNumber2}-${cardNumber3}-${cardNumber4}`
        const validThru = `${expiryMonth.padStart(2, '0')}${expiryYear}`

        const request = {
          reservationId: reservationData.reservationId,
          amount: reservationData.fare,
          cardNumber,
          validThru,
          rrn,
          installmentMonths: parseInt(installment),
          cardPassword: parseInt(cardPassword)
        }

        const result = await processPaymentViaCard(request)
        alert(`결제가 완료되었습니다!\n결제번호: ${result.paymentKey}`)
        router.push("/ticket/purchased")

      } else if (paymentMethod === "account") {
        if (!validateAccountPayment()) return

        const request = {
          reservationId: reservationData.reservationId,
          amount: reservationData.fare,
          bankCode,
          accountNumber,
          accountHolderName,
          identificationNumber,
          accountPassword
        }

        const result = await processPaymentViaBankAccount(request)
        alert(`결제가 완료되었습니다!\n결제번호: ${result.paymentKey}`)
        router.push("/ticket/purchased")
      }
    } catch (error: unknown) {
      const errorMessage = handleError(error, '결제 처리 중 오류가 발생했습니다.', false)
      setError(errorMessage)
      alert(errorMessage)
    } finally {
      setIsProcessing(false)
    }
  }

  // 로그인 상태 확인 중
  if (isChecking) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col">
        <div className="container mx-auto px-4 py-16 text-center flex-1">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">로그인 상태를 확인하고 있습니다...</p>
        </div>
      </div>
    )
  }

  // 로그인되지 않은 경우
  if (!isAuthenticated) {
    return null
  }

  // 로딩 중
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col">
        <div className="container mx-auto px-4 py-16 text-center flex-1">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">예약 정보를 불러오고 있습니다...</p>
        </div>
      </div>
    )
  }

  // 에러 또는 예약 정보 없음
  if (error || !reservationData) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col">
        <div className="container mx-auto px-4 py-16 text-center flex-1">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {error || "예약 정보를 찾을 수 없습니다"}
          </h3>
          <p className="text-gray-600 mb-4">
            예약 정보가 올바르지 않거나 만료되었을 수 있습니다.
          </p>
          <Button onClick={() => router.push("/ticket/reservations")} className="bg-blue-600 hover:bg-blue-700">
            예약 목록으로 이동
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Page Title */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">승차권 결제</h2>
            <p className="text-gray-600">안전한 결제를 위해 정확한 정보를 입력해주세요</p>
          </div>

          {/* 예약 정보 카드 */}
          <Card className="mb-6 border-l-4 border-blue-600">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                <div className="flex items-center space-x-3 mb-2 md:mb-0">
                  <Badge className={`${getTrainTypeColor(reservationData.trainName)} px-3 py-1`}>
                    {reservationData.trainName}
                  </Badge>
                  <span className="font-bold">{reservationData.trainNumber}</span>
                  <span className="text-gray-600">{formatDate(reservationData.operationDate)}</span>
                </div>
                <div className="text-xl font-bold text-red-600">{formatPrice(reservationData.fare)}</div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center space-x-2">
                  <span className="font-medium">{reservationData.departureStationName}</span>
                  <ArrowRight className="h-4 w-4 text-gray-400" />
                  <span className="font-medium">{reservationData.arrivalStationName}</span>
                  <span className="text-gray-600 ml-2">
                    ({formatTime(reservationData.departureTime)} ~ {formatTime(reservationData.arrivalTime)})
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  예약코드: {reservationData.reservationCode}
                </div>
              </div>

              {/* 좌석 정보 */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                  <User className="h-4 w-4 mr-2" />
                  좌석 정보
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {reservationData.seats.map((seat, index) => (
                    <div key={seat.seatReservationId} className="flex items-center justify-between p-2 bg-white rounded border">
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="text-xs">
                          {getCarTypeName(seat.carType)}
                        </Badge>
                        <span className="text-sm">
                          {seat.carNumber}호차 {seat.seatNumber}
                        </span>
                      </div>
                      <span className="text-sm text-gray-600">
                        {getPassengerTypeName(seat.passengerType)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 요금 상세 */}
              <div className="mt-4 pt-4 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">총 운임:</span>
                  <span className="font-bold text-red-600">{formatPrice(reservationData.fare)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 결제 수단 선택 */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-xl">결제수단 선택</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={paymentMethod} onValueChange={setPaymentMethod} className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger
                    value="card"
                    className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                  >
                    카드결제
                  </TabsTrigger>
                  <TabsTrigger
                    value="account"
                    className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                  >
                    계좌이체
                  </TabsTrigger>
                </TabsList>

                {/* 카드결제 탭 */}
                <TabsContent value="card">
                  <div className="space-y-6">
                    {/* 카드번호 */}
                    <div className="space-y-3">
                      <UILabel className="text-base font-medium">카드번호</UILabel>
                      <div className="flex space-x-2">
                        <Input
                          value={cardNumber1}
                          onChange={(e) => handleCardNumberChange(e.target.value, 1)}
                          maxLength={4}
                          placeholder="0000"
                          className="w-20 text-center"
                        />
                        <span className="flex items-center">-</span>
                        <Input
                          value={cardNumber2}
                          onChange={(e) => handleCardNumberChange(e.target.value, 2)}
                          maxLength={4}
                          placeholder="0000"
                          className="w-20 text-center"
                        />
                        <span className="flex items-center">-</span>
                        <Input
                          value={cardNumber3}
                          onChange={(e) => handleCardNumberChange(e.target.value, 3)}
                          maxLength={4}
                          placeholder="0000"
                          className="w-20 text-center"
                        />
                        <span className="flex items-center">-</span>
                        <Input
                          value={cardNumber4}
                          onChange={(e) => handleCardNumberChange(e.target.value, 4)}
                          maxLength={4}
                          placeholder="0000"
                          className="w-20 text-center"
                        />
                      </div>
                    </div>

                    {/* 유효기간 */}
                    <div className="space-y-3">
                      <UILabel className="text-base font-medium">유효기간</UILabel>
                      <div className="flex items-center space-x-2">
                        <Input
                          placeholder="MM"
                          value={expiryMonth}
                          onChange={(e) => setExpiryMonth(e.target.value.replace(/[^0-9]/g, "").slice(0, 2))}
                          maxLength={2}
                          className="w-20 text-center"
                        />
                        <span>월</span>
                        <Input
                          placeholder="YY"
                          value={expiryYear}
                          onChange={(e) => setExpiryYear(e.target.value.replace(/[^0-9]/g, "").slice(0, 2))}
                          maxLength={2}
                          className="w-20 text-center"
                        />
                        <span>년</span>
                      </div>
                    </div>

                    {/* 주민등록번호 */}
                    <div className="space-y-3">
                      <UILabel className="text-base font-medium">주민등록번호 앞 6자리</UILabel>
                      <Input
                        placeholder="000000"
                        value={rrn}
                        onChange={(e) => setRrn(e.target.value.replace(/[^0-9]/g, "").slice(0, 6))}
                        maxLength={6}
                        className="w-32"
                      />
                    </div>

                    {/* 할부 */}
                    <div className="space-y-3">
                      <UILabel className="text-base font-medium">할부개월</UILabel>
                      <Select value={installment} onValueChange={setInstallment}>
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">일시불</SelectItem>
                          <SelectItem value="2">2개월</SelectItem>
                          <SelectItem value="3">3개월</SelectItem>
                          <SelectItem value="6">6개월</SelectItem>
                          <SelectItem value="12">12개월</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* 카드 비밀번호 */}
                    <div className="space-y-3">
                      <UILabel className="text-base font-medium">카드 비밀번호 앞 2자리</UILabel>
                      <Input
                        value={cardPassword}
                        onChange={(e) => setCardPassword(e.target.value.replace(/[^0-9]/g, "").slice(0, 2))}
                        maxLength={2}
                        type="password"
                        placeholder="**"
                        className="w-20 text-center"
                      />
                    </div>

                    {/* 개인정보 동의 */}
                    <div className="space-y-4 border-t pt-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="agreePersonalInfo"
                          checked={agreePersonalInfo}
                          onCheckedChange={(checked) => setAgreePersonalInfo(checked === true)}
                        />
                        <UILabel htmlFor="agreePersonalInfo" className="text-sm">
                          [필수] 개인정보 수집 및 이용동의
                        </UILabel>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* 계좌이체 탭 */}
                <TabsContent value="account">
                  <div className="space-y-6">
                    {/* 은행 선택 */}
                    <div className="space-y-3">
                      <UILabel className="text-base font-medium">은행 선택</UILabel>
                      <Select value={bankCode} onValueChange={setBankCode}>
                        <SelectTrigger>
                          <SelectValue placeholder="은행을 선택하세요" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="001">한국은행</SelectItem>
                          <SelectItem value="002">산업은행</SelectItem>
                          <SelectItem value="003">기업은행</SelectItem>
                          <SelectItem value="004">국민은행</SelectItem>
                          <SelectItem value="007">수협은행</SelectItem>
                          <SelectItem value="011">농협은행</SelectItem>
                          <SelectItem value="020">우리은행</SelectItem>
                          <SelectItem value="023">SC제일은행</SelectItem>
                          <SelectItem value="027">한국씨티은행</SelectItem>
                          <SelectItem value="088">신한은행</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* 계좌번호 */}
                    <div className="space-y-3">
                      <UILabel className="text-base font-medium">계좌번호</UILabel>
                      <Input
                        placeholder="계좌번호를 입력하세요"
                        value={accountNumber}
                        onChange={(e) => setAccountNumber(e.target.value.replace(/[^0-9-]/g, ""))}
                      />
                    </div>

                    {/* 예금주명 */}
                    <div className="space-y-3">
                      <UILabel className="text-base font-medium">예금주명</UILabel>
                      <Input
                        placeholder="예금주명을 입력하세요"
                        value={accountHolderName}
                        onChange={(e) => setAccountHolderName(e.target.value)}
                      />
                    </div>

                    {/* 주민등록번호 */}
                    <div className="space-y-3">
                      <UILabel className="text-base font-medium">주민등록번호 앞 6자리</UILabel>
                      <Input
                        placeholder="주민등록번호 앞 6자리 (예: 123456)"
                        value={identificationNumber}
                        onChange={(e) => setIdentificationNumber(e.target.value.replace(/[^0-9]/g, "").slice(0, 6))}
                        maxLength={6}
                      />
                    </div>

                    {/* 계좌 비밀번호 */}
                    <div className="space-y-3">
                      <UILabel className="text-base font-medium">계좌 비밀번호 앞 2자리</UILabel>
                      <Input
                        type="password"
                        placeholder="계좌 비밀번호 앞 2자리"
                        value={accountPassword}
                        onChange={(e) => setAccountPassword(e.target.value.replace(/[^0-9]/g, "").slice(0, 2))}
                        maxLength={2}
                      />
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* 약관 동의 및 결제 버튼 */}
          <div className="space-y-6">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="terms" 
                checked={agreeTerms} 
                onCheckedChange={(checked) => setAgreeTerms(checked === true)} 
              />
              <UILabel htmlFor="terms" className="text-sm">
                [필수] 승차권 발권 및 이용약관에 동의합니다
              </UILabel>
            </div>

            <div className="text-center">
              <div className="mb-4">
                <span className="text-lg font-bold">결제하실 금액: </span>
                <span className="text-xl font-bold text-red-600">
                  {formatPrice(reservationData.fare)}
                </span>
              </div>
              
              <Button
                onClick={handlePayment}
                disabled={isProcessing || !agreeTerms}
                className="w-40 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3"
                size="lg"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    처리중...
                  </>
                ) : (
                  "결제하기"
                )}
              </Button>
            </div>
          </div>

          {/* 주의사항 */}
          <Card className="mt-8 bg-blue-50 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="space-y-2 text-sm text-blue-800">
                  <h3 className="font-semibold">결제 시 주의사항</h3>
                  <ul className="space-y-1 list-disc list-inside">
                    <li>결제 완료 후 승차권 변경 및 환불은 출발시간 20분 전까지 가능합니다.</li>
                    <li>결제 제한시간(10분) 내에 결제를 완료하지 않으면 예약이 자동 취소됩니다.</li>
                    <li>카드 정보는 안전하게 암호화되어 전송됩니다.</li>
                    <li>결제 완료 후 승차권은 모바일로 발급됩니다.</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
