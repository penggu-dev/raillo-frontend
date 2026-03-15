"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from '@/hooks/use-auth'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Clock, ArrowRight, X, AlertTriangle, Info, CreditCard } from "lucide-react"
import { formatPrice, formatDate, formatTime } from "@/lib/utils/format"
import { getTrainTypeColor } from "@/lib/utils/ticketUtils"
import { getReservationList, deleteReservation } from '@/lib/api/booking'
import type { PendingBookingCartItem } from '@/types/bookingType'
import { handleError } from '@/lib/utils/errorHandler'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"



export default function ReservationsPage() {
  const router = useRouter()
  const { isAuthenticated, isChecking } = useAuth({ redirectPath: '/ticket/reservations' })
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [selectedReservation, setSelectedReservation] = useState<string | null>(null)
  const [reservations, setReservations] = useState<PendingBookingCartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 예약 목록 조회
  useEffect(() => {
    // 로그인 상태가 확인된 후에만 예약 목록을 조회
    if (isChecking || !isAuthenticated) return

    const fetchReservations = async () => {
      try {
        setLoading(true)
        const response = await getReservationList()
        if (response.result) {
          setReservations(response.result)
        } else {
          setReservations([])
        }
      } catch (err) {
        const errorMessage = handleError(err, '예약 목록 조회 중 오류가 발생했습니다.', false)
        setError(errorMessage)
        setReservations([])
      } finally {
        setLoading(false)
      }
    }

    fetchReservations()
  }, [isChecking, isAuthenticated])

  const getTotalPrice = (reservation: PendingBookingCartItem) => {
    return reservation.totalFare ?? reservation.fare ?? 0
  }

  const getSeatSummary = (seats: PendingBookingCartItem['seats']) => {
    const seatType = seats[0]?.carType === "FIRST_CLASS" ? "특실" : "일반실"
    return `${seatType} ${seats.length}매`
  }

  const isExpired = (expiresAt?: string) => {
    if (!expiresAt) return false
    return new Date(expiresAt) <= new Date()
  }

  const handleCancelReservation = (pendingBookingId: string) => {
    setSelectedReservation(pendingBookingId)
    setShowCancelDialog(true)
  }

  const confirmCancelReservation = async () => {
    if (selectedReservation) {
      try {
        await deleteReservation(selectedReservation)
        alert("예약이 취소되었습니다.")
        // 예약 목록 다시 조회
        const response = await getReservationList()
        if (response.result) {
          setReservations(response.result)
        }
      } catch (err) {
        handleError(err, '예약 취소 중 오류가 발생했습니다.')
      }
    }
    setShowCancelDialog(false)
    setSelectedReservation(null)
  }

  const handlePayment = (reservation: PendingBookingCartItem) => {
    if (!reservation.pendingBookingId) {
      alert("결제 가능한 예약 정보가 없습니다.")
      return
    }

    router.push(`/ticket/reservation?pendingBookingId=${encodeURIComponent(reservation.pendingBookingId)}`)
  }

  // 로그인 상태 확인 중이거나 인증되지 않은 경우 로딩 표시
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
        <p className="text-gray-600">예약 목록을 불러오고 있습니다...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="text-red-600 mb-4">
          <p className="text-lg font-semibold">예약 목록을 불러올 수 없습니다</p>
          <p className="text-sm">{error}</p>
        </div>
        <Button onClick={() => router.push('/')} variant="outline">
          홈으로 돌아가기
        </Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Page Title */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-between mb-4">
              <div></div>
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">예약승차권 조회</h2>
                <p className="text-gray-600">예약한 승차권을 확인하고 결제하거나 취소할 수 있습니다</p>
              </div>
              <div></div>
            </div>
          </div>

          {/* Notice */}
          <Card className="mb-8 bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2 text-blue-700">
                <Info className="h-5 w-5" />
                <span className="font-medium">결제 기한이 지난 목록은 자동 삭제됩니다</span>
              </div>
            </CardContent>
          </Card>

          {/* Reservation List */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-gray-900">예약 내역</h3>

            {(() => {
              const validReservations = reservations.filter(reservation => !isExpired(reservation.expiresAt))

              if (reservations.length === 0) {
                return (
                  <Card>
                    <CardContent className="p-12 text-center">
                      <Clock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">예약 내역이 없습니다</h3>
                      <p className="text-gray-600 mb-6">새로운 예약을 진행하세요.</p>
                      <Link href="/ticket/booking">
                        <Button className="bg-blue-600 hover:bg-blue-700">승차권 예매하기</Button>
                      </Link>
                    </CardContent>
                  </Card>
                )
              }

              if (validReservations.length === 0) {
                return (
                  <Card>
                    <CardContent className="p-12 text-center">
                      <Clock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">유효한 예약이 없습니다</h3>
                      <p className="text-gray-600 mb-6">결제 기한이 지난 예약은 자동으로 삭제됩니다.</p>
                      <Link href="/ticket/booking">
                        <Button className="bg-blue-600 hover:bg-blue-700">승차권 예매하기</Button>
                      </Link>
                    </CardContent>
                  </Card>
                )
              }

              return validReservations.map((reservation) => (
                <Card
                  key={reservation.pendingBookingId}
                  className="border-blue-200"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <Badge className={`${getTrainTypeColor(reservation.trainName)} px-3 py-1`}>
                          {reservation.trainName}
                        </Badge>
                        <span className="text-lg font-bold">{reservation.trainNumber}</span>
                        <span className="text-gray-600">{formatDate(reservation.operationDate)}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-blue-600">{formatPrice(getTotalPrice(reservation))}</div>
                        <div className="text-xs text-gray-500">예약번호: {reservation.pendingBookingId}</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      {/* Route Info */}
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          운행 정보
                        </h4>
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">{reservation.departureStationName}</span>
                            <ArrowRight className="h-3 w-3 text-gray-400" />
                            <span className="font-medium">{reservation.arrivalStationName}</span>
                          </div>
                          <div className="text-sm text-gray-600">
                            {formatTime(reservation.departureTime)} ~ {formatTime(reservation.arrivalTime)}
                          </div>
                        </div>
                      </div>

                      {/* Seat Info */}
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">좌석 정보</h4>
                        <div className="space-y-1">
                          <div className="text-sm font-medium">
                            {getSeatSummary(reservation.seats)}
                          </div>
                        </div>
                      </div>

                      {/* Payment Deadline */}
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          결제 기한
                        </h4>
                        <div className="space-y-1">
                          <div className="text-sm">
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end space-x-2 pt-4 border-t">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCancelReservation(reservation.pendingBookingId)}
                        className="text-red-600 border-red-600 hover:bg-red-50"
                      >
                        <X className="h-4 w-4 mr-1" />
                        예약취소
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handlePayment(reservation)}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <CreditCard className="h-4 w-4 mr-1" />
                        결제하기
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            })()}
          </div>

          {/* Notice */}
          <Card className="mt-8 bg-yellow-50 border-yellow-200">
            <CardContent className="p-6">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div className="space-y-2 text-sm text-yellow-800">
                  <h3 className="font-semibold">예약승차권 조회 안내</h3>
                  <ul className="space-y-1 list-disc list-inside">
                    <li>예약 후 10분 이내에 결제하지 않으면 자동으로 취소됩니다.</li>
                    <li>결제 기한이 지난 예약은 자동으로 삭제됩니다.</li>
                    <li>예약 취소는 결제 기한 내에만 가능합니다.</li>
                    <li>예약번호는 예약 완료 시 발급된 번호입니다.</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Cancel Reservation Dialog */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>예약 취소</AlertDialogTitle>
            <AlertDialogDescription>
              선택한 예약을 취소하시겠습니까?
              <br />
              취소된 예약은 복구할 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction onClick={confirmCancelReservation} className="bg-red-600 hover:bg-red-700">
              확인
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
