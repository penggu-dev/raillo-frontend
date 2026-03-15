"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, MapPin, ArrowRight, Receipt } from "lucide-react"
import { format } from "date-fns"
import { ko } from "date-fns/locale"
import { getTicketReceipt } from "@/lib/api/booking"
import type { TicketReceiptResponse } from "@/types/bookingType"
import { handleError } from "@/lib/utils/errorHandler"

type TicketReceiptDetail = TicketReceiptResponse["result"]

export default function TicketReceiptDetailPage() {
  const searchParams = useSearchParams()
  const { isAuthenticated, isChecking } = useAuth({ redirectPath: "/ticket/history" })
  const [receipt, setReceipt] = useState<TicketReceiptDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const ticketId = useMemo(() => {
    const raw = searchParams.get("ticketId")
    if (!raw) return null
    const parsed = Number(raw)
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null
  }, [searchParams])

  useEffect(() => {
    if (isChecking || !isAuthenticated) return

    const fetchReceipt = async () => {
      if (!ticketId) {
        setError("유효한 승차권 ID가 아닙니다.")
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const response = await getTicketReceipt(ticketId)
        setReceipt(response.result ?? null)
      } catch (err) {
        const errorMessage = handleError(err, "영수증 상세 조회 중 오류가 발생했습니다.", false)
        setError(errorMessage)
        setReceipt(null)
      } finally {
        setLoading(false)
      }
    }

    fetchReceipt()
  }, [isChecking, isAuthenticated, ticketId])

  const getCarTypeName = (carType: string) => {
    switch (carType) {
      case "STANDARD":
        return "일반실"
      case "FIRST_CLASS":
        return "특실"
      default:
        return carType
    }
  }

  const getPassengerTypeName = (passengerType: string) => {
    switch (passengerType) {
      case "ADULT":
        return "어른"
      case "CHILD":
        return "어린이"
      case "SENIOR":
        return "경로"
      case "DISABLED_HEAVY":
        return "중증장애인"
      case "DISABLED_LIGHT":
        return "경증장애인"
      case "VETERAN":
        return "국가유공자"
      case "INFANT":
        return "유아"
      default:
        return passengerType
    }
  }

  const getPaymentMethodName = (paymentMethod: string) => {
    switch (paymentMethod) {
      case "CARD":
        return "카드결제"
      case "BANK_TRANSFER":
      case "TRANSFER":
        return "계좌이체"
      case "EASY_PAY":
        return "간편결제"
      default:
        return paymentMethod
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return format(date, "yyyy년 MM월 dd일(EEEE)", { locale: ko })
  }

  const formatDateTime = (dateTimeString: string) => {
    const date = new Date(dateTimeString)
    return format(date, "yyyy년 MM월 dd일 HH:mm:ss", { locale: ko })
  }

  const formatTime = (timeString: string) => {
    return timeString.substring(0, 5)
  }

  const formatPrice = (amount: number) => `${amount.toLocaleString()}원`

  if (isChecking || !isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">인증을 확인하고 있습니다...</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">영수증 상세를 불러오고 있습니다...</p>
      </div>
    )
  }

  if (error || !receipt) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="text-red-600 mb-4">
          <p className="text-lg font-semibold">영수증 정보를 불러올 수 없습니다</p>
          <p className="text-sm">{error ?? "데이터가 없습니다."}</p>
        </div>
        <Link href="/ticket/history">
          <Button variant="outline">내역으로 돌아가기</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">영수증 상세</h2>
            <p className="text-gray-600">승차권 영수증 정보를 확인할 수 있습니다</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5 text-blue-600" />
                <span>승차권 정보</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">승차권 번호</span>
                <span className="font-mono font-medium">{receipt.ticketNumber}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">열차</span>
                <Badge variant="outline">{receipt.trainNumber}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">좌석</span>
                <span className="font-medium">
                  {receipt.carNumber}호차 {receipt.seatNumber} ({getCarTypeName(receipt.carType)})
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">승객</span>
                <span className="font-medium">{getPassengerTypeName(receipt.passengerType)}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-blue-600" />
                <span>운행 정보</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">운행일</span>
                <span className="font-medium">{formatDate(receipt.operationDate)}</span>
              </div>
              <div className="flex items-center justify-center gap-3 p-3 bg-gray-50 rounded-lg">
                <span className="font-semibold">{receipt.departureStationName}</span>
                <ArrowRight className="h-4 w-4 text-gray-400" />
                <span className="font-semibold">{receipt.arrivalStationName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">출발/도착</span>
                <span className="font-medium">
                  {formatTime(receipt.departureTime)} ~ {formatTime(receipt.arrivalTime)}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                <span>결제 정보</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">결제수단</span>
                <span className="font-medium">{getPaymentMethodName(receipt.paymentMethod)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">결제금액</span>
                <span className="text-lg font-bold text-blue-600">{formatPrice(receipt.amount)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">결제일시</span>
                <span className="font-medium">{formatDateTime(receipt.paidAt)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">발권일시</span>
                <span className="font-medium">{formatDateTime(receipt.ticketCreatedAt)}</span>
              </div>
            </CardContent>
          </Card>

          <div className="text-center">
            <Link href="/ticket/history">
              <Button variant="outline" className="px-8">
                내역으로 돌아가기
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
