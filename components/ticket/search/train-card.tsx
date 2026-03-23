"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Zap } from "lucide-react"
import type { TrainSchedule, SeatType } from "@/types/trainType"

interface TrainCardProps {
  train: TrainSchedule
  isSelected: boolean
  onSeatSelection: (train: TrainSchedule, seatType: SeatType) => void
  getTrainTypeColor: (trainType: string) => string
  formatPrice: (price: number) => string
  getSeatTypeName: (seatType: SeatType) => string
}

export function TrainCard({
  train,
  isSelected,
  onSeatSelection,
  getTrainTypeColor,
  formatPrice,
  getSeatTypeName,
}: TrainCardProps) {
  return (
    <Card
      className={`hover:shadow-lg transition-shadow ${
        isSelected ? "ring-2 ring-blue-500 bg-blue-50" : ""
      }`}
    >
      <CardContent className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
          {/* Train Info */}
          <div className="lg:col-span-4">
            <div className="flex items-center space-x-3 mb-2">
              <Badge className={`${getTrainTypeColor(train.trainName)} px-3 py-1`}>
                {train.trainName}
              </Badge>
              <span className="font-semibold text-lg">{train.trainNumber}</span>
              <Zap className="h-4 w-4 text-yellow-500" />
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span>{train.departureStationName}</span>
              <ArrowRight className="h-4 w-4" />
              <span>{train.arrivalStationName}</span>
            </div>
          </div>

          {/* Time Info */}
          <div className="lg:col-span-3">
            <div className="flex items-center space-x-2 mb-1">
              <span className="text-2xl font-bold text-blue-600">{train.departureTime.substring(0, 5)}</span>
              <ArrowRight className="h-4 w-4 text-gray-400" />
              <span className="text-2xl font-bold text-blue-600">{train.arrivalTime.substring(0, 5)}</span>
            </div>
            <div className="text-sm text-gray-600">{train.formattedTravelTime}</div>
          </div>

          {/* Seat Options */}
          <div className="lg:col-span-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:max-w-[340px] sm:ml-auto">
              {/* 일반실 */}
              <div className="border rounded-lg p-3">
                <div className="text-sm font-medium mb-1">일반실</div>
                <div className="text-lg font-bold text-blue-600 mb-2">
                  {formatPrice(train.standardSeat.fare)}
                </div>
                <Button
                  size="sm"
                  className="w-full"
                  disabled={!train.standardSeat.canReserve}
                  onClick={() => onSeatSelection(train, "standardSeat")}
                >
                  {train.standardSeat.canReserve ? "선택" : "매진"}
                </Button>
              </div>

              {/* 특실 */}
              <div className="border rounded-lg p-3">
                <div className="text-sm font-medium mb-1">특실</div>
                <div className="text-lg font-bold text-blue-600 mb-2">
                  {train.firstClassSeat ? formatPrice(train.firstClassSeat.fare) : "-"}
                </div>
                <Button
                  size="sm"
                  className="w-full"
                  disabled={!train.firstClassSeat?.canReserve}
                  onClick={() => onSeatSelection(train, "firstClassSeat")}
                >
                  {train.firstClassSeat?.canReserve ? "선택" : "매진"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
