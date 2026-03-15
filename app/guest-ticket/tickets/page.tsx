"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Train, MapPin, Clock, Calendar, User, ArrowRight, ChevronLeft, Download, Printer, Home, QrCode } from "lucide-react"
import { TRAIN_TYPE } from "@/constants/trainType"

export default function GuestTicketsPage() {
  // 예시 승차권 데이터
  const tickets = [
    {
      id: "T001",
      trainType: TRAIN_TYPE.KTX,
      trainNumber: "101",
      departure: {
        station: "서울",
        time: "08:00",
        date: "2024.06.16",
      },
      arrival: {
        station: "부산",
        time: "10:52",
        date: "2024.06.16",
      },
      seat: {
        car: "3",
        seat: "15A",
        class: "일반실",
      },
      passenger: {
        name: "김구름",
        phone: "010-1234-5678",
      },
      price: 59800,
      status: "사용가능",
      purchaseDate: "2024.06.15 14:30",
    },
    {
      id: "T002",
      trainType: TRAIN_TYPE.ITX_SAEMAUL,
      trainNumber: "1051",
      departure: {
        station: "서울",
        time: "14:20",
        date: "2024.06.18",
      },
      arrival: {
        station: "대전",
        time: "16:05",
        date: "2024.06.18",
      },
      seat: {
        car: "2",
        seat: "8B",
        class: "일반실",
      },
      passenger: {
        name: "김구름",
        phone: "010-1234-5678",
      },
      price: 23700,
      status: "사용가능",
      purchaseDate: "2024.06.16 09:15",
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "사용가능":
        return "bg-green-100 text-green-800"
      case "사용완료":
        return "bg-gray-100 text-gray-800"
      case "기간만료":
        return "bg-red-100 text-red-800"
      default:
        return "bg-blue-100 text-blue-800"
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b py-3">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-blue-600">
              <Home className="h-4 w-4" />
            </Link>
            <span>/</span>
            <span>비회원서비스</span>
            <span>/</span>
            <span className="text-blue-600">승차권 확인</span>
          </div>
          <Button variant="ghost" size="sm">
            <Printer className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Title */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">예매 승차권 목록</h2>
            <p className="text-gray-600">총 {tickets.length}건의 승차권이 조회되었습니다.</p>
          </div>

          {/* Tickets List */}
          <div className="space-y-6">
            {tickets.map((ticket) => (
              <Card key={ticket.id} className="overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Train className="h-6 w-6 text-blue-600" />
                      <div>
                        <CardTitle className="text-xl font-bold text-blue-900">
                          {ticket.trainType} {ticket.trainNumber}호
                        </CardTitle>
                        <p className="text-sm text-blue-700">예매번호: {ticket.id}</p>
                      </div>
                    </div>
                    <Badge className={getStatusColor(ticket.status)}>{ticket.status}</Badge>
                  </div>
                </CardHeader>

                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* 운행 정보 */}
                    <div className="space-y-4">
                      <h3 className="font-semibold text-gray-900 flex items-center">
                        <MapPin className="h-4 w-4 mr-2" />
                        운행 정보
                      </h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900">{ticket.departure.station}</p>
                            <p className="text-sm text-gray-600">{ticket.departure.date}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-blue-600 text-lg">{ticket.departure.time}</p>
                            <p className="text-xs text-gray-500">출발</p>
                          </div>
                        </div>
                        <div className="border-l-2 border-dashed border-gray-300 ml-2 h-4"></div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900">{ticket.arrival.station}</p>
                            <p className="text-sm text-gray-600">{ticket.arrival.date}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-red-600 text-lg">{ticket.arrival.time}</p>
                            <p className="text-xs text-gray-500">도착</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 좌석 정보 */}
                    <div className="space-y-4">
                      <h3 className="font-semibold text-gray-900">좌석 정보</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">좌석등급</span>
                          <span className="font-medium">{ticket.seat.class}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">호차</span>
                          <span className="font-medium">{ticket.seat.car}호차</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">좌석번호</span>
                          <span className="font-medium">{ticket.seat.seat}</span>
                        </div>
                      </div>
                    </div>

                    {/* 승객 및 구매 정보 */}
                    <div className="space-y-4">
                      <h3 className="font-semibold text-gray-900 flex items-center">
                        <User className="h-4 w-4 mr-2" />
                        승객 정보
                      </h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">이름</span>
                          <span className="font-medium">{ticket.passenger.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">연락처</span>
                          <span className="font-medium">{ticket.passenger.phone}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">구매일</span>
                          <span className="font-medium">{ticket.purchaseDate}</span>
                        </div>
                        <div className="flex justify-between border-t pt-2">
                          <span className="text-gray-600">결제금액</span>
                          <span className="font-bold text-lg text-blue-600">{ticket.price.toLocaleString()}원</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-3 mt-6 pt-6 border-t">
                    <Button variant="outline" size="sm" className="flex items-center space-x-2">
                      <Download className="h-4 w-4" />
                      <span>다운로드</span>
                    </Button>
                    <Button variant="outline" size="sm" className="flex items-center space-x-2">
                      <QrCode className="h-4 w-4" />
                      <span>QR코드</span>
                    </Button>
                    <Button variant="outline" size="sm" className="flex items-center space-x-2">
                      <Clock className="h-4 w-4" />
                      <span>운행정보</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Back Button */}
          <div className="mt-8 text-center">
            <Link href="/guest-ticket/search">
              <Button variant="outline" className="px-6">
                다시 조회하기
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
