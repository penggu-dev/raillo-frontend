"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Train, Plus } from "lucide-react"
import { useRouter } from "next/navigation"
import { TrainCard } from "./train-card"
import type { TrainSchedule, SeatType } from "@/types/trainType"

interface TrainListProps {
  displayedTrains: TrainSchedule[]
  totalResults: number
  selectedTrain: TrainSchedule | null
  loadingMore: boolean
  hasMoreTrains: boolean
  onSeatSelection: (train: TrainSchedule, seatType: SeatType) => void
  onLoadMore: () => void
  getTrainTypeColor: (trainType: string) => string
  formatPrice: (price: number) => string
  getSeatTypeName: (seatType: SeatType) => string
}

export function TrainList({
  displayedTrains,
  totalResults,
  selectedTrain,
  loadingMore,
  hasMoreTrains,
  onSeatSelection,
  onLoadMore,
  getTrainTypeColor,
  formatPrice,
  getSeatTypeName,
}: TrainListProps) {
  const router = useRouter()

  if (displayedTrains.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Train className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">검색 결과가 없습니다</h3>
          <p className="text-gray-600 mb-4">선택하신 조건에 맞는 열차가 없습니다.</p>
          <Button onClick={() => router.push("/")} variant="outline">
            다시 검색하기
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {displayedTrains.map((train) => (
        <TrainCard
          key={train.trainScheduleId}
          train={train}
          isSelected={selectedTrain?.trainScheduleId === train.trainScheduleId}
          onSeatSelection={onSeatSelection}
          getTrainTypeColor={getTrainTypeColor}
          formatPrice={formatPrice}
          getSeatTypeName={getSeatTypeName}
        />
      ))}

      {/* Load More Button */}
      {hasMoreTrains && (
        <div className="text-center py-6">
          <Button
            onClick={onLoadMore}
            disabled={loadingMore}
            variant="outline"
            size="lg"
            className="px-8"
          >
            {loadingMore ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                로딩 중...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                더보기
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  )
}
