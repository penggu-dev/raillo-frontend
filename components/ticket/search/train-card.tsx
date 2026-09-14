"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowRight, Zap } from "lucide-react"
import type { TrainSchedule, SeatType } from "@/types/trainType"
import { TrainTypeBadge } from "@/components/ticket/TrainTypeBadge";

interface TrainCardProps {
  train: TrainSchedule
  isSelected: boolean
  /** trigger: 닫은 뒤 포커스를 돌려줄 버튼 (Safari는 클릭해도 버튼에 포커스를 주지 않아 activeElement로 추정하지 않는다) */
  onSeatSelection: (train: TrainSchedule, seatType: SeatType, trigger: HTMLElement) => void
  formatPrice: (price: number) => string
  getSeatTypeName: (seatType: SeatType) => string
}

export function TrainCard({
  train,
  isSelected,
  onSeatSelection,
  formatPrice,
  getSeatTypeName,
}: TrainCardProps) {
  return (
    <Card
      className={`shadow-elev-sm transition-all duration-200 hover:shadow-elev-md ${
        isSelected ? "border-primary ring-[3px] ring-secondary" : ""
      }`}
    >
      <CardContent className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
          {/* Train Info */}
          <div className="lg:col-span-4">
            <div className="flex items-center space-x-3 mb-2">
              <TrainTypeBadge trainName={train.trainName} />
              <span className="font-semibold text-lg">{train.trainNumber}</span>
              <Zap className="h-4 w-4 text-yellow-500 dark:text-yellow-400" />
            </div>
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <span>{train.departureStationName}</span>
              <ArrowRight className="h-4 w-4" />
              <span>{train.arrivalStationName}</span>
            </div>
          </div>

          {/* Time Info */}
          <div className="lg:col-span-3">
            <div className="flex items-center space-x-2 mb-1">
              <span className="text-2xl font-bold tracking-tight text-primary">{train.departureTime.substring(0, 5)}</span>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
              <span className="text-2xl font-bold tracking-tight text-primary">{train.arrivalTime.substring(0, 5)}</span>
            </div>
            <div className="text-sm text-muted-foreground">{train.formattedTravelTime}</div>
          </div>

          {/* Seat Options */}
          <div className="lg:col-span-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:max-w-[340px] sm:ml-auto">
              {/* 일반실 */}
              <div className="rounded-lg border bg-muted p-3">
                <div className="text-sm font-medium mb-1">일반실</div>
                <div className={`text-lg font-bold mb-2 ${train.standardSeat.canReserve ? "text-primary" : "text-muted-foreground"}`}>
                  {formatPrice(train.standardSeat.fare)}
                </div>
                <Button
                  size="sm"
                  className="w-full"
                  disabled={!train.standardSeat.canReserve}
                  onClick={(event) => onSeatSelection(train, "standardSeat", event.currentTarget)}
                >
                  {train.standardSeat.canReserve ? "선택" : "매진"}
                </Button>
              </div>

              {/* 특실 */}
              <div className="rounded-lg border bg-muted p-3">
                <div className="text-sm font-medium mb-1">특실</div>
                <div className={`text-lg font-bold mb-2 ${train.firstClassSeat?.canReserve ? "text-primary" : "text-muted-foreground"}`}>
                  {train.firstClassSeat ? formatPrice(train.firstClassSeat.fare) : "-"}
                </div>
                <Button
                  size="sm"
                  className="w-full"
                  disabled={!train.firstClassSeat?.canReserve}
                  onClick={(event) => onSeatSelection(train, "firstClassSeat", event.currentTarget)}
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
