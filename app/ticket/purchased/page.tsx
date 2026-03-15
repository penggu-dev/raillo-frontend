"use client"

import { useState, useEffect } from "react"
import { useAuth } from '@/hooks/use-auth'
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

import { Train, MapPin, ArrowRight, User } from "lucide-react"
import { getTickets } from '@/lib/api/booking'
import { handleError } from '@/lib/utils/errorHandler'
import { differenceInMinutes, parse } from "date-fns"
import { formatDate, formatTime } from "@/lib/utils/format"
import { getTrainTypeColor, getCarTypeName } from "@/lib/utils/ticketUtils"

interface Ticket {
  bookingId: number
  bookingCode: string
  operationDate: string
  departureStationName: string
  departureTime: string
  arrivalStationName: string
  arrivalTime: string
  trainNumber: string
  trainName: string
  tickets: {
    ticketId: number
    ticketNumber: string
    status: string
    passengerType: string
    carNumber: number
    carType: string
    seatNumber: string
  }[]
}

export default function PurchasedTicketsPage() {
  const { isAuthenticated, isChecking } = useAuth({ redirectPath: '/ticket/purchased' })
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 승차권 목록 조회
  useEffect(() => {
    // 로그인 상태가 확인된 후에만 승차권 목록을 조회
    if (isChecking || !isAuthenticated) return

    const fetchTickets = async () => {
      try {
        setLoading(true)
        const response = await getTickets()
        setTickets(response.result ?? [])
      } catch (err) {
        const errorMessage = handleError(err, '승차권 목록 조회 중 오류가 발생했습니다.', false)
        setError(errorMessage)
        setTickets([])
      } finally {
        setLoading(false)
      }
    }

    fetchTickets()
  }, [isChecking, isAuthenticated])

  // 소요 시간 계산 함수
  const getDuration = (departure: string, arrival: string) => {
    // "HH:mm:ss" 형식
    const dep = parse(departure, "HH:mm:ss", new Date())
    const arr = parse(arrival, "HH:mm:ss", new Date())
    let diff = differenceInMinutes(arr, dep)
    if (diff < 0) diff += 24 * 60 // 자정 넘는 경우
    const hours = Math.floor(diff / 60)
    const minutes = diff % 60
    return `${hours > 0 ? hours + "시간 " : ""}${minutes}분`
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

  // 로딩 중인 경우
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">승차권을 불러오고 있습니다...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col">
      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Page Title */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">승차권 확인</h2>
          </div>

          {/* Content */}
          <div className="w-full">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900">승차권</h2>
            </div>

            <div className="space-y-6">
              {/* Error Message */}
              {error && (
                <Card className="border-red-200 bg-red-50">
                  <CardContent className="p-4">
                    <p className="text-sm text-red-700">{error}</p>
                  </CardContent>
                </Card>
              )}

              {/* Ticket List or Empty State */}
              {tickets.length === 0 ? (
                <Card className="border-gray-200">
                  <CardContent className="p-16 text-center">
                    {/* Ticket Icon */}
                    <div className="mx-auto mb-6 w-24 h-16 relative">
                      <svg
                        viewBox="0 0 100 60"
                        className="w-full h-full text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        {/* Ticket outline */}
                        <path
                          d="M10 10 L90 10 L90 50 L10 50 Z"
                          fill="none"
                          stroke="currentColor"
                          strokeDasharray="3,2"
                        />
                        {/* Perforation line */}
                        <line
                          x1="50"
                          y1="10"
                          x2="50"
                          y2="50"
                          stroke="currentColor"
                          strokeDasharray="2,2"
                          strokeWidth="1"
                        />
                        {/* Small circles for perforation */}
                        <circle cx="50" cy="15" r="1" fill="currentColor" />
                        <circle cx="50" cy="25" r="1" fill="currentColor" />
                        <circle cx="50" cy="35" r="1" fill="currentColor" />
                        <circle cx="50" cy="45" r="1" fill="currentColor" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">발권하신 승차권이 없습니다.</h3>
                  </CardContent>
                </Card>
              ) : (
                tickets.map((ticket) => {
                  return (
                    <Card key={ticket.bookingId} className="border-2 border-blue-300 bg-gradient-to-r from-blue-50 to-white shadow-lg">
                      <CardContent className="p-6">
                        {/* 승차권 헤더 */}
                        <div className="border-b-2 border-blue-200 pb-4 mb-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                                <Train className="h-6 w-6 text-white" />
                              </div>
                              <div>
                                <div className="flex items-center space-x-2">
                                  <Badge className={`${getTrainTypeColor(ticket.trainName)} px-3 py-1 text-sm font-bold`}>
                                    {ticket.trainName}
                                  </Badge>
                                  <span className="text-xl font-bold text-gray-900">{ticket.trainNumber}</span>
                                </div>
                                <div className="text-sm text-gray-600 mt-1">
                                  {formatDate(ticket.operationDate)}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-xs text-gray-500">예매번호: {ticket.bookingCode}</div>
                            </div>
                          </div>
                        </div>

                        {/* 승차권 본문 */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          {/* 운행 정보 */}
                          <div className="bg-white rounded-lg p-4 border border-gray-200">
                            <h4 className="font-bold text-gray-900 mb-3 flex items-center">
                              <MapPin className="h-4 w-4 mr-2 text-blue-600" />
                              운행 정보
                            </h4>
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <div className="text-center flex-1">
                                  <div className="text-2xl font-bold text-blue-600">{formatTime(ticket.departureTime)}</div>
                                  <div className="text-sm text-gray-600 mt-1">{ticket.departureStationName}</div>
                                </div>
                                <div className="flex items-center mx-4">
                                  <div className="w-16 h-0.5 bg-blue-300"></div>
                                  <ArrowRight className="h-4 w-4 text-blue-400 mx-1" />
                                  <div className="w-16 h-0.5 bg-blue-300"></div>
                                </div>
                                <div className="text-center flex-1">
                                  <div className="text-2xl font-bold text-blue-600">{formatTime(ticket.arrivalTime)}</div>
                                  <div className="text-sm text-gray-600 mt-1">{ticket.arrivalStationName}</div>
                                </div>
                              </div>
                              <div className="text-center">
                                <span className="text-sm text-blue-600 bg-blue-100 px-3 py-1 rounded-full">
                                  소요시간 {getDuration(ticket.departureTime, ticket.arrivalTime)}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* 좌석 정보 */}
                          <div className="bg-white rounded-lg p-4 border border-gray-200">
                            <h4 className="font-bold text-gray-900 mb-3 flex items-center">
                              <User className="h-4 w-4 mr-2 text-green-600" />
                              좌석 정보
                            </h4>
                            <div className="space-y-2">
                              {(() => {
                                // 호차별로 좌석 그룹화
                                const seatsByCar = ticket.tickets.reduce<Record<number, { carType: string; seats: string[] }>>((acc, item) => {
                                  if (!acc[item.carNumber]) {
                                    acc[item.carNumber] = { carType: item.carType, seats: [] }
                                  }
                                  acc[item.carNumber].seats.push(item.seatNumber)
                                  return acc
                                }, {})

                                return Object.entries(seatsByCar).map(([carNumber, value]) => (
                                  <div key={carNumber} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                    <div className="flex items-center space-x-2">
                                      <Badge variant="outline" className="text-xs">
                                        {getCarTypeName(value.carType)}
                                      </Badge>
                                      <span className="font-medium text-gray-900">
                                        {carNumber}호차({value.seats.join(', ')})
                                      </span>
                                    </div>
                                  </div>
                                ))
                              })()}
                            </div>
                          </div>
                        </div>

                        {/* 승차권 하단 정보 */}
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <div className="flex items-center space-x-4">
                              <span>승차권 발권완료</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })
              )}
            </div>

          </div>
        </div>
      </main>
    </div>
  )
}
