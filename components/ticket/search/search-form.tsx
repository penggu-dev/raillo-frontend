"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ArrowRight } from "lucide-react"
import { DateTimeSelector } from "@/components/ticket/search/date-time-selector"
import { PassengerSelector } from "@/components/ticket/search/passenger-selector"
import { StationSelector } from "@/components/ticket/search/station-selector"
import type { PassengerCounts } from "@/types/passengerType"

interface SearchFormProps {
  departureStation: string
  arrivalStation: string
  date: Date | undefined
  returnDate?: Date | undefined
  passengerCounts: PassengerCounts
  isRoundtrip: boolean
  searchConditionsChanged: boolean
  onDepartureStationChange: (station: string) => void
  onArrivalStationChange: (station: string) => void
  onDateChange: (date: Date) => void
  onReturnDateChange?: (date: Date) => void
  onPassengerChange: (passengers: PassengerCounts) => void
  onSearch: () => void
  onBothStationsChange?: (departure: string, arrival: string) => void
}

export function SearchForm({
  departureStation,
  arrivalStation,
  date,
  returnDate,
  passengerCounts,
  isRoundtrip,
  searchConditionsChanged,
  onDepartureStationChange,
  onArrivalStationChange,
  onDateChange,
  onReturnDateChange,
  onPassengerChange,
  onSearch,
  onBothStationsChange,
}: SearchFormProps) {
  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            {/* 출발역 선택 */}
            <div className="flex items-center">
              <StationSelector
                value={departureStation}
                onValueChange={onDepartureStationChange}
                placeholder="출발역 선택"
                label=""
                otherStation={arrivalStation}
                onBothStationsChange={onBothStationsChange || ((departure, arrival) => {
                  onDepartureStationChange(departure)
                  onArrivalStationChange(arrival)
                })}
              />
            </div>

            <ArrowRight className="h-4 w-4 text-gray-400" />

            {/* 도착역 선택 */}
            <div className="flex items-center">
              <StationSelector
                value={arrivalStation}
                onValueChange={onArrivalStationChange}
                placeholder="도착역 선택"
                label=""
                otherStation={departureStation}
                onBothStationsChange={onBothStationsChange || ((departure, arrival) => {
                  onDepartureStationChange(departure)
                  onArrivalStationChange(arrival)
                })}
              />
            </div>

            <Separator orientation="vertical" className="hidden md:block h-6" />

            {/* Date Selection */}
            <div className="flex items-center space-x-2">
              {isRoundtrip ? (
                <>
                  {/* 가는 날짜 */}
                  <div className="flex items-center">
                    <span className="text-sm text-gray-600 mr-2 flex items-center h-full">가는 날</span>
                    <DateTimeSelector
                      value={date}
                      onValueChange={onDateChange}
                      placeholder="가는 날짜 선택"
                      label=""
                    />
                  </div>

                  {/* 오는 날짜 */}
                  <div className="flex items-center">
                    <span className="text-sm text-gray-600 mr-2 flex items-center h-full">오는 날</span>
                    <DateTimeSelector
                      value={returnDate}
                      onValueChange={onReturnDateChange || onDateChange}
                      placeholder="오는 날짜 선택"
                      label=""
                    />
                  </div>
                </>
              ) : (
                <DateTimeSelector
                  value={date}
                  onValueChange={onDateChange}
                  placeholder="날짜 선택"
                  label=""
                />
              )}
            </div>

            <Separator orientation="vertical" className="hidden md:block h-6" />

            {/* Passenger Selection */}
            <div className="flex items-center">
              <PassengerSelector
                value={passengerCounts}
                onValueChange={onPassengerChange}
                placeholder="인원 선택"
                label=""
                simple={false}
              />
            </div>
          </div>

          <Button
            onClick={onSearch}
            disabled={Object.values(passengerCounts).reduce((sum, c) => sum + c, 0) === 0}
            variant={searchConditionsChanged ? "default" : "outline"}
            className={searchConditionsChanged ? "bg-blue-600 hover:bg-blue-700 text-white" : ""}
          >
            {searchConditionsChanged ? "검색 조건 적용" : "검색하기"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
