"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Receipt } from "lucide-react"
import { getTickets } from "@/lib/api/booking"
import type { TicketResponse } from "@/types/bookingType"
import { handleError } from "@/lib/utils/errorHandler"
import BookingHistoryCard from "@/components/ticket/history/BookingHistoryCard"

type BookingHistoryItem = TicketResponse["result"][number]
type HistoryTab = "all" | "issued" | "cancelled"

export default function PaymentHistoryPage() {
  const { isAuthenticated, isChecking } = useAuth({ redirectPath: "/ticket/history" })
  const [bookings, setBookings] = useState<BookingHistoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<HistoryTab>("all")

  useEffect(() => {
    if (isChecking || !isAuthenticated) return

    const fetchBookings = async () => {
      try {
        setLoading(true)
        const response = await getTickets()
        setBookings(response.result ?? [])
      } catch (err) {
        const errorMessage = handleError(err, "예매 내역 조회 중 오류가 발생했습니다.", false)
        setError(errorMessage)
        setBookings([])
      } finally {
        setLoading(false)
      }
    }

    fetchBookings()
  }, [isChecking, isAuthenticated])

  const isIssuedBooking = (booking: BookingHistoryItem) =>
    booking.tickets.length > 0 && booking.tickets.every((ticket) => ticket.status === "ISSUED")

  const isCancelledBooking = (booking: BookingHistoryItem) =>
    booking.tickets.some(
      (ticket) => ticket.status === "CANCELLED" || ticket.status === "REFUNDED"
    )

  const filteredBookings = useMemo(() => {
    return bookings.filter((booking) => {
      if (activeTab === "issued") {
        return isIssuedBooking(booking)
      }
      if (activeTab === "cancelled") {
        return isCancelledBooking(booking)
      }
      return true
    })
  }, [activeTab, bookings])

  if (isChecking || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col">
        <div className="flex-1 container mx-auto px-4 py-16 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">인증을 확인하고 있습니다...</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col">
        <div className="flex-1 container mx-auto px-4 py-16 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">예매 내역을 불러오고 있습니다...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col">
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">예매 내역</h2>
            <p className="text-gray-600">예매번호와 영수증 상세를 확인할 수 있습니다</p>
          </div>

          <div className="mb-6">
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as HistoryTab)} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="all" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                  전체
                </TabsTrigger>
                <TabsTrigger value="issued" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                  발권완료
                </TabsTrigger>
                <TabsTrigger value="cancelled" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                  취소/환불
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="space-y-6">
            {error && (
              <Card className="border-red-200 bg-red-50">
                <CardContent className="p-4">
                  <p className="text-sm text-red-700">{error}</p>
                </CardContent>
              </Card>
            )}

            {filteredBookings.length === 0 ? (
              <Card className="border-gray-200">
                <CardContent className="p-16 text-center">
                  <div className="mx-auto mb-6 w-16 h-16 relative">
                    <Receipt className="w-full h-full text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {activeTab === "all" && "예매 내역이 없습니다."}
                    {activeTab === "issued" && "발권 완료된 내역이 없습니다."}
                    {activeTab === "cancelled" && "취소/환불 내역이 없습니다."}
                  </h3>
                  <p className="text-gray-500 mb-4">승차권을 예매하시면 내역이 여기에 표시됩니다.</p>
                  <Link href="/ticket/search">
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white">승차권 예매하기</Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              filteredBookings.map((booking) => (
                <BookingHistoryCard key={booking.bookingId} booking={booking} />
              ))
            )}
          </div>

          {filteredBookings.length > 0 && (
            <div className="mt-8 text-center">
              <p className="text-sm text-gray-500">총 {filteredBookings.length}건의 예매 내역</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
