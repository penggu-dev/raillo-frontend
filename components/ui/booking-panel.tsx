"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, CreditCard, X, Train } from "lucide-react"
import type { CarInfo } from "@/types/trainType"

interface TrainInfo {
  trainType: string
  trainNumber: string
  departureTime: string
  arrivalTime: string
  duration: string
  departureStation: string
  arrivalStation: string
  generalSeat: {
    available: boolean
    price: number
  }
  reservedSeat: {
    available: boolean
    price: number
  }
}

interface BookingPanelProps {
  isOpen: boolean
  onClose: () => void
  selectedTrain: TrainInfo | null
  selectedSeatType: string
  selectedSeats: string[]
  selectedCar: number
  onSeatSelection: () => void
  onBooking: () => void
  getTrainTypeColor: (trainType: string) => string
  getSeatTypeName: (seatType: string) => string
  formatPrice: (price: number) => string
  // 새로운 props 추가
  carList: CarInfo[]
  loadingCars: boolean
  // 좌석 정보 새로고침 함수 추가
  onRefreshSeats: () => void
}

export function BookingPanel({
  isOpen,
  onClose,
  selectedTrain,
  selectedSeatType,
  selectedSeats,
  selectedCar,
  onSeatSelection,
  onBooking,
  getTrainTypeColor,
  getSeatTypeName,
  formatPrice,
  carList,
  loadingCars,
  onRefreshSeats,
}: BookingPanelProps) {
  if (!isOpen || !selectedTrain) return null

  // 선택된 객차 정보 찾기
  const selectedCarInfo = carList.find(car => parseInt(car.carNumber) === selectedCar)

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={onClose} />

      {/* Bottom Panel */}
      <div className="fixed bottom-0 left-0 right-0 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out">
        <div className="container mx-auto px-4 py-6 max-w-6xl">
          {/* Panel Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <Badge className={`${getTrainTypeColor(selectedTrain.trainType)} px-3 py-1`}>
                {selectedTrain.trainType}
              </Badge>
              <span className="text-xl font-bold">{selectedTrain.trainNumber}</span>
              <span className="text-gray-600">열차 예매</span>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Train Schedule */}
            <div className="flex flex-col">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                <Clock className="h-4 w-4 mr-2" />
                열차 시각
              </h3>
              <div className="bg-gray-50 rounded-lg p-4 flex-1 flex items-center justify-center">
                <div className="w-full">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">출발</span>
                    <span className="font-semibold">{selectedTrain.departureTime}</span>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">도착</span>
                    <span className="font-semibold">{selectedTrain.arrivalTime}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">소요시간</span>
                    <span className="font-semibold">{selectedTrain.duration}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Car Information */}
            <div className="flex flex-col">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                <Train className="h-4 w-4 mr-2" />
                객차 정보
              </h3>
              <div className="bg-gray-50 rounded-lg p-4 flex-1 flex items-center justify-center">
                <div className="text-center w-full">
                  {loadingCars ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                      <span className="text-sm text-gray-600">로딩 중...</span>
                    </div>
                  ) : selectedCarInfo ? (
                    <>
                      <div className="text-sm text-gray-600 mb-1">선택된 객차</div>
                      <div className="text-lg font-semibold">{selectedCarInfo.carNumber}호차</div>
                      <div className="text-sm text-blue-600">
                        {selectedCarInfo.carType === "FIRST_CLASS" ? "특실" : "일반실"}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {selectedCarInfo.remainingSeats}/{selectedCarInfo.totalSeats}석
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="text-sm text-gray-600 mb-1">객차 정보</div>
                      <div className="text-lg font-semibold">{selectedCar}호차</div>
                      <div className="text-sm text-gray-500">정보 없음</div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Fare Information */}
            <div className="flex flex-col">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                <CreditCard className="h-4 w-4 mr-2" />
                운임 요금
              </h3>
              <div className="bg-gray-50 rounded-lg p-4 flex-1 flex items-center justify-center">
                <div className="text-center w-full">
                  <div className="text-sm text-gray-600 mb-1">{getSeatTypeName(selectedSeatType)} (1인 기준)</div>
                  <div className="text-2xl font-bold text-blue-600">
                    {formatPrice((selectedTrain as any)[selectedSeatType]?.price)}
                  </div>
                  {selectedSeats.length > 0 && (
                    <div className="text-sm text-gray-600 mt-1">
                      총 {formatPrice((selectedTrain as any)[selectedSeatType]?.price * selectedSeats.length)}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Seat Selection */}
            <div className="flex flex-col">
              <h3 className="font-semibold text-gray-900 mb-3">좌석 선택</h3>
              <div className="bg-gray-50 rounded-lg p-4 mb-3 flex-1 flex items-center justify-center">
                <div className="text-center w-full">
                  {selectedSeats.length > 0 ? (
                    <>
                      <div className="text-sm text-gray-600 mb-1">선택된 좌석</div>
                      <div className="text-lg font-semibold">{selectedCar}호차</div>
                      <div className="text-sm text-blue-600 font-medium">
                        {selectedSeats.join(", ")}
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="text-sm text-gray-600 mb-1">선택된 좌석</div>
                      <div className="text-lg font-semibold">{getSeatTypeName(selectedSeatType)}</div>
                      <div className="text-sm text-gray-500">좌석을 선택해주세요</div>
                    </>
                  )}
                </div>
              </div>
              <Button 
                onClick={() => {
                  // 좌석 선택 다이얼로그 열기
                  onSeatSelection()
                }} 
                variant="outline" 
                className="w-full h-10 text-base font-semibold"
              >
                {selectedSeats.length > 0 ? "좌석 변경" : "좌석 선택"}
              </Button>
            </div>
          </div>

          {/* Booking Section */}
          <div className="mt-6 pt-6 border-t">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-600">
                  총 {selectedSeats.length}명 / {selectedSeats.length > 0 ? 
                    formatPrice((selectedTrain as any)[selectedSeatType]?.price * selectedSeats.length) : 
                    formatPrice((selectedTrain as any)[selectedSeatType]?.price)
                  }
                </div>
              </div>
              <Button
                onClick={onBooking}
                disabled={selectedSeats.length === 0}
                className="px-8 py-3 text-base font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-lg disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                예매하기
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
} 
