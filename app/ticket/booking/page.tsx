"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { format } from "date-fns"
import { ko } from "date-fns/locale"
import {
  Train,
  Search,
  ArrowLeftRight,
} from "lucide-react"
import { StationSelector } from "@/components/ui/station-selector"
import { DateTimeSelector } from "@/components/ui/date-time-selector"
import { PassengerSelector } from "@/components/ui/passenger-selector"
import type { PassengerCounts } from "@/types/passengerType"

export default function TicketBookingPage() {
  const router = useRouter()
  const [departureStation, setDepartureStation] = useState("")
  const [arrivalStation, setArrivalStation] = useState("")
  const [departureDate, setDepartureDate] = useState<Date>(new Date())
  const [returnDate, setReturnDate] = useState<Date>(new Date())
  const [isRoundtrip, setIsRoundtrip] = useState(false)

  // 승객 정보 상태
  const [passengerCounts, setPassengerCounts] = useState<PassengerCounts>({
    adult: 1,
    child: 0,
    infant: 0,
    senior: 0,
    severelydisabled: 0,
    mildlydisabled: 0,
    veteran: 0,
  })

  // 왕복일 때 오는 날짜를 가는 날짜 다음날로 설정
  useEffect(() => {
    if (isRoundtrip) {
      const nextDay = new Date(departureDate)
      nextDay.setDate(nextDay.getDate() + 1)
      setReturnDate(nextDay)
    }
  }, [departureDate, isRoundtrip])

  const swapStations = () => {
    const temp = departureStation
    setDepartureStation(arrivalStation)
    setArrivalStation(temp)
  }

  const handleDepartureStationChange = (station: string) => {
    if (station === arrivalStation) {
      // 출발역과 도착역이 같으면 자동으로 바꾸기
      setArrivalStation(departureStation)
      setDepartureStation(station)
    } else {
      setDepartureStation(station)
    }
  }

  const handleArrivalStationChange = (station: string) => {
    if (station === departureStation) {
      // 출발역과 도착역이 같으면 자동으로 바꾸기
      setDepartureStation(arrivalStation)
      setArrivalStation(station)
    } else {
      setArrivalStation(station)
    }
  }

  const handleSearch = () => {
    if (!departureStation || !arrivalStation || !departureDate) {
      alert("출발역, 도착역, 출발일을 모두 선택해주세요.")
      return
    }

    if (isRoundtrip && !returnDate) {
      alert("오는 날짜를 선택해주세요.")
      return
    }

    if (isRoundtrip && returnDate <= departureDate) {
      alert("오는 날짜는 가는 날짜보다 늦어야 합니다.")
      return
    }

    // 가는 날짜가 오늘보다 이전인지 확인
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    if (departureDate < today) {
      alert("가는 날짜는 오늘 이후여야 합니다.")
      return
    }

    // 왕복일 때 오는 날짜가 가는 날짜보다 이전인지 확인
    if (isRoundtrip && returnDate <= departureDate) {
      alert("오는 날짜는 가는 날짜보다 늦어야 합니다.")
      return
    }

    // 검색 기록 저장
    const searchHistory = {
      departure: departureStation,
      arrival: arrivalStation,
      timestamp: Date.now()
    }
    
    // 기존 검색 기록 가져오기
    const existingHistory = localStorage.getItem('rail-o-search-history')
    let historyArray: any[] = []
    
    if (existingHistory) {
      try {
        historyArray = JSON.parse(existingHistory)
      } catch (error) {
        console.error('기존 검색 기록 파싱 실패:', error)
      }
    }
    
    // 중복 제거 (같은 출발역-도착역 조합이 있으면 제거)
    historyArray = historyArray.filter(item => 
      !(item.departure === searchHistory.departure && item.arrival === searchHistory.arrival)
    )
    
    // 새 기록을 맨 앞에 추가
    historyArray.unshift(searchHistory)
    
    // 최대 3개까지만 유지
    historyArray = historyArray.slice(0, 3)
    
    // 로컬 스토리지에 저장
    localStorage.setItem('rail-o-search-history', JSON.stringify(historyArray))

    // 검색 조건을 localStorage에 저장하여 새로고침 시에도 유지
    const searchData = {
      departureStation,
      arrivalStation,
      departureDate: `${departureDate.getFullYear()}-${(departureDate.getMonth() + 1).toString().padStart(2, '0')}-${departureDate.getDate().toString().padStart(2, '0')}`,
      departureHour: departureDate.getHours().toString().padStart(2, '0'),
      returnDate: isRoundtrip ? `${returnDate.getFullYear()}-${(returnDate.getMonth() + 1).toString().padStart(2, '0')}-${returnDate.getDate().toString().padStart(2, '0')}` : "",
      returnHour: isRoundtrip ? returnDate.getHours().toString().padStart(2, '0') : "",
      passengers: passengerCounts,
      tripType: isRoundtrip ? "roundtrip" : "oneway"
    }
    
    localStorage.setItem('searchData', JSON.stringify(searchData))
    
    // 검색 페이지로 이동
    router.push('/ticket/search')
  }

  const getTotalPassengers = () => {
    return Object.values(passengerCounts).reduce((sum, count) => sum + count, 0)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Page Title */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">승차권 예매</h2>
            <p className="text-gray-600">원하시는 열차를 검색하고 예매하세요</p>
          </div>

          {/* Booking Form */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Train className="h-5 w-5 text-blue-600" />
                <span>승차권 검색</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Trip Type */}
              <div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="roundtrip" 
                    checked={isRoundtrip} 
                    onCheckedChange={(checked) => setIsRoundtrip(checked as boolean)}
                  />
                  <Label htmlFor="roundtrip" className="text-base font-semibold">왕복 여행</Label>
                </div>
                <p className="text-sm text-gray-600 mt-1">체크하면 왕복 여행으로 검색됩니다.</p>
              </div>

              {/* Stations */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                <div className="md:col-span-2">
                  <StationSelector
                    value={departureStation}
                    onValueChange={handleDepartureStationChange}
                    placeholder="출발역을 선택하세요"
                    label="출발역"
                    variant="white"
                    otherStation={arrivalStation}
                    onBothStationsChange={(departure, arrival) => {
                      setDepartureStation(departure)
                      setArrivalStation(arrival)
                    }}
                  />
                </div>

                <div className="flex justify-center">
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    onClick={swapStations} 
                    className="p-2"
                  >
                    <ArrowLeftRight className="h-4 w-4" />
                  </Button>
                </div>

                <div className="md:col-span-2">
                  <StationSelector
                    value={arrivalStation}
                    onValueChange={handleArrivalStationChange}
                    placeholder="도착역을 선택하세요"
                    label="도착역"
                    variant="white"
                    otherStation={departureStation}
                    onBothStationsChange={(departure, arrival) => {
                      setDepartureStation(departure)
                      setArrivalStation(arrival)
                    }}
                  />
                </div>
              </div>

              {/* Date and Passengers */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {isRoundtrip ? (
                  <>
                    <div>
                      <DateTimeSelector
                        value={departureDate}
                        onValueChange={setDepartureDate}
                        placeholder="가는 날짜를 선택하세요"
                        label="가는 날짜"
                        variant="white"
                      />
                    </div>
                    <div>
                      <DateTimeSelector
                        value={returnDate}
                        onValueChange={setReturnDate}
                        placeholder="오는 날짜를 선택하세요"
                        label="오는 날짜"
                        variant="white"
                      />
                    </div>
                  </>
                ) : (
                  <div>
                    <DateTimeSelector
                      value={departureDate}
                      onValueChange={setDepartureDate}
                      placeholder="출발일을 선택하세요"
                      label="출발일"
                      variant="white"
                    />
                  </div>
                )}

                <div>
                  <PassengerSelector
                    value={passengerCounts}
                    onValueChange={setPassengerCounts}
                    placeholder="인원을 선택하세요"
                    label="인원"
                    simple={false}
                    variant="white"
                  />
                </div>
              </div>

              {/* Search Button */}
              <div className="pt-4">
                <Button
                  onClick={handleSearch}
                  size="lg"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 text-lg"
                >
                  <Search className="mr-2 h-5 w-5" />
                  {isRoundtrip ? "왕복 열차 조회하기" : "열차 조회하기"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Additional Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">예매 안내</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-gray-600">
                <p>• 승차권은 출발일 1개월 전부터 예매 가능합니다.</p>
                <p>• 예매 취소는 출발시간 20분 전까지 가능합니다.</p>
                <p>• 어린이는 만 6세~12세, 유아는 만 6세 미만, 경로는 만 65세 이상입니다.</p>
                <p>• 중증장애인은 1~3급, 경증장애인은 4~6급 장애인에게 적용됩니다.</p>
                {isRoundtrip && (
                  <p>• 왕복 예매 시 가는 열차와 오는 열차를 각각 선택하세요.</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">할인 혜택</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-gray-600">
                <p>• 어린이(6~12세): 40% 할인</p>
                <p>• 유아(6세 미만): 75% 할인</p>
                <p>• 경로(65세 이상): 30% 할인</p>
                <p>• 중증장애인: 50% 할인 (보호자 1인 포함)</p>
                <p>• 경증장애인: 30% 할인</p>
                <p>• 국가유공자: 50% 할인</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
