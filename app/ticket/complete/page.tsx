"use client"

import {useState, useEffect} from "react"
import {useRouter, useSearchParams} from "next/navigation"
import {Button} from "@/components/ui/button"
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card"
import {Badge} from "@/components/ui/badge"
import {Separator} from "@/components/ui/separator"
import {Calendar, CheckCircle, Clock, CreditCard, Download, Home, List, Train, User, ArrowRight, ArrowLeft} from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { TRAIN_TYPE } from "@/constants/trainType"
import { formatPrice, formatDate } from "@/lib/utils/format"

interface RoundtripCompleteData {
  departureStation: string
  arrivalStation: string
  departureDate: string
  returnDate: string
  passengers: any
  selectedOutbound: string
  selectedInbound: string
  outboundTrains: any[]
  inboundTrains: any[]
  bookingId: string
  totalPrice: number
  bookingTime: string
}

export default function PaymentCompletePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { isAuthenticated, isChecking } = useAuth({ redirectPath: "/ticket/complete" })
  const [reservationNumber] = useState("R" + Date.now().toString().slice(-8))
  const [isRoundtrip, setIsRoundtrip] = useState(false)
  const [roundtripData, setRoundtripData] = useState<RoundtripCompleteData | null>(null)

  // 왕복 예매 데이터 확인
  useEffect(() => {
    const roundtripCompleteData = localStorage.getItem('roundtripCompleteData')
    if (roundtripCompleteData) {
      try {
        const data = JSON.parse(roundtripCompleteData) as RoundtripCompleteData
        setRoundtripData(data)
        setIsRoundtrip(true)
      } catch (error) {
        console.error('왕복 예매 데이터 로드 실패:', error)
      }
    }
  }, [])

  // 결제 정보 (실제로는 이전 페이지나 서버에서 받아올 데이터)
  const [paymentData] = useState({
    departure: searchParams.get("departure") || "서울",
    arrival: searchParams.get("arrival") || "부산",
    date: searchParams.get("date") || "2024-01-15",
    time: searchParams.get("time") || "06:00",
    trainType: TRAIN_TYPE.KTX,
    trainNumber: "KTX-101",
    passengers: [
      { name: "홍길동", type: "어른", seat: "1호차 3A" },
      { name: "김영희", type: "어른", seat: "1호차 3B" },
    ],
    totalAmount: 118600,
    paymentMethod: "신용카드",
    cardNumber: "**** **** **** 1234",
  })

  const getSelectedOutboundTrain = () => {
    if (!roundtripData) return null
    return roundtripData.outboundTrains.find(train => train.id === roundtripData.selectedOutbound)
  }

  const getSelectedInboundTrain = () => {
    if (!roundtripData) return null
    return roundtripData.inboundTrains.find(train => train.id === roundtripData.selectedInbound)
  }

  if (isChecking) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-2xl mx-auto px-4 text-center text-gray-600">
          로그인 상태를 확인하고 있습니다...
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* 결제 완료 헤더 */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">결제가 완료되었습니다</h1>
          <p className="text-gray-600">
            {isRoundtrip ? "왕복 승차권 예약이 성공적으로 완료되었습니다." : "승차권 예약이 성공적으로 완료되었습니다."}
          </p>
        </div>

        {/* 예약 번호 */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">예약번호</p>
              <p className="text-2xl font-bold text-blue-600">
                {isRoundtrip ? roundtripData?.bookingId : reservationNumber}
              </p>
              <p className="text-xs text-gray-500 mt-2">※ 예약번호는 승차권 발권 및 변경/취소 시 필요합니다.</p>
            </div>
          </CardContent>
        </Card>

        {isRoundtrip && roundtripData ? (
          <>
            {/* 왕복 승차권 정보 */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Train className="w-5 h-5" />
                  왕복 승차권 정보
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* 가는 열차 */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <ArrowRight className="w-4 h-4 text-green-600" />
                    <span className="font-medium text-green-600">가는 열차</span>
                    <Badge variant="secondary">
                      {formatDate(roundtripData.departureDate)}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <p className="text-lg font-semibold">{roundtripData.departureStation}</p>
                        <p className="text-sm text-gray-600">출발</p>
                      </div>
                      <div className="flex-1 flex items-center justify-center">
                        <div className="w-8 h-0.5 bg-gray-300"></div>
                        <Train className="w-6 h-6 text-blue-600 mx-2" />
                        <div className="w-8 h-0.5 bg-gray-300"></div>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-semibold">{roundtripData.arrivalStation}</p>
                        <p className="text-sm text-gray-600">도착</p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">열차정보</p>
                      <p className="font-medium">
                        {getSelectedOutboundTrain()?.type} {getSelectedOutboundTrain()?.trainNumber}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">출발시간</p>
                      <p className="font-medium">{getSelectedOutboundTrain()?.departureTime}</p>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* 오는 열차 */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <ArrowLeft className="w-4 h-4 text-red-600" />
                    <span className="font-medium text-red-600">오는 열차</span>
                    <Badge variant="secondary">
                      {formatDate(roundtripData.returnDate)}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <p className="text-lg font-semibold">{roundtripData.arrivalStation}</p>
                        <p className="text-sm text-gray-600">출발</p>
                      </div>
                      <div className="flex-1 flex items-center justify-center">
                        <div className="w-8 h-0.5 bg-gray-300"></div>
                        <Train className="w-6 h-6 text-blue-600 mx-2" />
                        <div className="w-8 h-0.5 bg-gray-300"></div>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-semibold">{roundtripData.departureStation}</p>
                        <p className="text-sm text-gray-600">도착</p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">열차정보</p>
                      <p className="font-medium">
                        {getSelectedInboundTrain()?.type} {getSelectedInboundTrain()?.trainNumber}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">출발시간</p>
                      <p className="font-medium">{getSelectedInboundTrain()?.departureTime}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 승객 정보 */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  승객 정보
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(roundtripData.passengers).map(([type, count]) => {
                    if (count === 0) return null
                    const typeLabels: { [key: string]: string } = {
                      adult: '성인',
                      child: '어린이',
                      infant: '유아',
                      senior: '경로',
                      severelydisabled: '중증장애인',
                      mildlydisabled: '경증장애인',
                      veteran: '국가유공자'
                    }
                    return (
                      <div key={type} className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="font-medium text-gray-900">{typeLabels[type]}</div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* 결제 정보 */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  결제 정보
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">결제수단</span>
                  <span className="font-medium">신용카드</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">카드번호</span>
                  <span className="font-medium">**** **** **** 1234</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>총 결제금액</span>
                  <span className="text-blue-600">{formatPrice(roundtripData.totalPrice)}원</span>
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <>
            {/* 편도 승차권 정보 */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Train className="w-5 h-5" />
                  승차권 정보
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <p className="text-lg font-semibold">{paymentData.departure}</p>
                      <p className="text-sm text-gray-600">출발</p>
                    </div>
                    <div className="flex-1 flex items-center justify-center">
                      <div className="w-8 h-0.5 bg-gray-300"></div>
                      <Train className="w-6 h-6 text-blue-600 mx-2" />
                      <div className="w-8 h-0.5 bg-gray-300"></div>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-semibold">{paymentData.arrival}</p>
                      <p className="text-sm text-gray-600">도착</p>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-600">출발일</p>
                      <p className="font-medium">{formatDate(paymentData.date)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-600">출발시간</p>
                      <p className="font-medium">{paymentData.time}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">열차정보</p>
                    <p className="font-medium">
                      {paymentData.trainType} {paymentData.trainNumber}
                    </p>
                  </div>
                  <Badge variant="secondary">{paymentData.trainType}</Badge>
                </div>
              </CardContent>
            </Card>

            {/* 승객 정보 */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  승객 정보
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {paymentData.passengers.map((passenger, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{passenger.name}</p>
                        <p className="text-sm text-gray-600">{passenger.type}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{passenger.seat}</p>
                        <p className="text-sm text-gray-600">좌석</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* 결제 정보 */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  결제 정보
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">결제수단</span>
                  <span className="font-medium">{paymentData.paymentMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">카드번호</span>
                  <span className="font-medium">{paymentData.cardNumber}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>총 결제금액</span>
                  <span className="text-blue-600">{formatPrice(paymentData.totalAmount)}원</span>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* 액션 버튼들 */}
        <div className="space-y-3">
          <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={() => router.push("/ticket/reservations")}>
            <List className="w-4 h-4 mr-2" />
            예약 내역 보기
          </Button>

          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" onClick={() => window.print()}>
              <Download className="w-4 h-4 mr-2" />
              승차권 출력
            </Button>
            <Button variant="outline" onClick={() => router.push("/")}>
              <Home className="w-4 h-4 mr-2" />
              홈으로
            </Button>
          </div>
        </div>

        {/* 안내사항 */}
        <Card className="mt-6 bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <h3 className="font-semibold text-blue-800 mb-2">이용 안내</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• 승차권은 출발시간 20분 전까지 발권하셔야 합니다.</li>
              <li>• 예매 취소는 출발시간 20분 전까지 가능합니다.</li>
              <li>• 승차권은 모바일 앱이나 홈페이지에서 확인할 수 있습니다.</li>
              <li>• 문의사항은 고객센터(1544-1234)로 연락주세요.</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
