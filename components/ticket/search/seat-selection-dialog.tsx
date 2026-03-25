"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X } from "lucide-react"
import type { CarInfo, SeatDetail, TrainSchedule, SeatType } from "@/types/trainType"
import { TrainSeatGrid, type SeatGridItem } from "@/components/ticket/search/TrainSeatGrid"

interface SeatSelectionDialogProps {
  isOpen: boolean
  onClose: () => void
  selectedTrain: TrainSchedule | null
  selectedSeatType: SeatType
  selectedSeats: string[]
  onSeatClick: (seatNumber: string) => void
  onApply: (selectedSeats: string[], selectedCar: number) => void
  getSeatTypeName: (seatType: SeatType) => string
  getTotalPassengers: () => number
  // 새로운 props 추가
  carList: CarInfo[]
  seatList: SeatDetail[]
  loadingCars: boolean
  loadingSeats: boolean
  onCarSelect: (carId: string) => void
  // 좌석 정보 새로고침 함수 추가
  onRefreshSeats: () => void
}

export function SeatSelectionDialog({
  isOpen,
  onClose,
  selectedTrain,
  selectedSeatType,
  selectedSeats,
  onSeatClick,
  onApply,
  getSeatTypeName,
  getTotalPassengers,
  carList,
  seatList,
  loadingCars,
  loadingSeats,
  onCarSelect,
  onRefreshSeats,
}: SeatSelectionDialogProps) {
  const [selectedCar, setSelectedCar] = useState<CarInfo | null>(null)
  const [selectionError, setSelectionError] = useState<string | null>(null)
  const onCarSelectRef = useRef(onCarSelect)
  
  // onCarSelect 함수를 ref에 저장
  useEffect(() => {
    onCarSelectRef.current = onCarSelect
  }, [onCarSelect])

  useEffect(() => {
    if (!isOpen) {
      setSelectionError(null)
    }
  }, [isOpen])
  
  // 다이얼로그가 열릴 때마다 초기화
  useEffect(() => {
    if (isOpen && carList.length > 0) {
      // 선택된 좌석 타입에 맞는 첫 번째 객차 선택
      const suitableCar = carList.find(car => {
        if (selectedSeatType === "firstClassSeat") {
          return car.carType === "FIRST_CLASS"
        } else if (selectedSeatType === "standardSeat") {
          return car.carType === "STANDARD"
        }
        return true
      })

      // 적절한 객차를 찾지 못한 경우, 좌석 타입에 맞는 객차만 필터링해서 첫 번째 선택
      if (!suitableCar) {
        const filteredCars = carList.filter(car => {
          if (selectedSeatType === "firstClassSeat") {
            return car.carType === "FIRST_CLASS"
          } else if (selectedSeatType === "standardSeat") {
            return car.carType === "STANDARD"
          }
          return true
        })

        if (filteredCars.length > 0) {
          setSelectedCar(filteredCars[0])
        }
      } else {
        setSelectedCar(suitableCar)
      }
      
      // selectedCar가 설정되면 자동으로 onCarSelect가 호출되므로 
      // 여기서는 onRefreshSeats를 호출하지 않음
    }
  }, [isOpen, carList, selectedSeatType])

  // selectedCar가 변경될 때만 onCarSelect 호출 (중복 방지)
  const lastSelectedCarId = useRef<string | null>(null)
  
  useEffect(() => {
    if (selectedCar && isOpen) {
      const carId = selectedCar.id.toString()
      
      // 같은 객차가 이미 선택된 경우 중복 호출 방지
      if (lastSelectedCarId.current === carId) {
        return
      }
      
      lastSelectedCarId.current = carId
      onCarSelectRef.current(carId)
    }
  }, [selectedCar, isOpen])
  
  // 객차 변경 핸들러
  const handleCarChange = (carId: string) => {
    const car = carList.find(c => c.id.toString() === carId)
    if (car) {
      setSelectedCar(car)
      setSelectionError(null)
      // 객차 변경 시 선택된 좌석 초기화
      selectedSeats.forEach(seat => {
        onSeatClick(seat)
      })
    }
  }

  // 좌석 타입에 따른 객차 필터링
  const getFilteredCars = () => {
    return carList.filter(car => {
      if (selectedSeatType === "firstClassSeat") {
        return car.carType === "FIRST_CLASS"
      } else if (selectedSeatType === "standardSeat") {
        return car.carType === "STANDARD"
      }
      return true
    })
  }

  // 좌석 배열 생성 (API 데이터 기반)
  const generateSeatGrid = (): SeatGridItem[] => {
    if (!seatList.length) return []

    const seats: SeatGridItem[] = []
    for (const seat of seatList) {
      const match = seat.seatNumber.match(/^(\d+)([A-Z])$/)
      if (match) {
        const [, row, col] = match
        seats.push({
          ...seat,
          row: parseInt(row),
          column: col,
          isWindow: seat.seatType === "WINDOW",
        })
      }
    }

    return seats.sort((a, b) => {
      if (a.row !== b.row) return a.row - b.row
      return a.column.localeCompare(b.column)
    })
  }

  const seatGrid = generateSeatGrid()
  const filteredCars = getFilteredCars()
  const maxSeats = getTotalPassengers()

  // 좌석 버튼 스타일링 함수
  const getSeatButtonStyle = (seat: any, isSelected: boolean) => {
    if (!seat.isAvailable) {
      return "bg-gray-400 border-gray-500 text-gray-600 cursor-not-allowed"
    }
    
    if (isSelected) {
      return "bg-blue-600 text-white border-blue-700 shadow-lg"
    }
    
    // 방향에 따른 기본 색상
    if (seat.seatDirection === "FORWARD") {
      return "bg-orange-100 border-orange-300 hover:bg-orange-200 text-gray-800"
    } else if (seat.seatDirection === "BACKWARD") {
      return "bg-purple-100 border-purple-300 hover:bg-purple-200 text-gray-800"
    }
    return "bg-blue-100 border-blue-300 hover:bg-blue-200 text-gray-800"
  }

  const handleSeatSelectionClick = (
    seat: SeatDetail,
    seatNumber: string,
    isSelected: boolean
  ) => {
    if (!seat.isAvailable) return

    if (!isSelected && selectedSeats.length >= maxSeats) {
      setSelectionError(
        `승객 수는 ${maxSeats}명입니다. 좌석은 최대 ${maxSeats}개까지 선택할 수 있습니다.`
      )
      return
    }

    setSelectionError(null)
    onSeatClick(seatNumber)
  }

  if (!isOpen || !selectedTrain) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-7xl max-h-[95vh] overflow-hidden">
        {/* Dialog Header */}
        <div className="flex items-center justify-between p-6 border-b bg-white">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <h2 className="text-xl font-bold text-gray-800">
              좌석선택 - {selectedTrain.trainName} {selectedTrain.trainNumber}
            </h2>
            {selectedCar && (
              <span className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
                {selectedCar.carNumber}호차 ({selectedCar.carType === "FIRST_CLASS" ? "특실" : "일반실"})
              </span>
            )}
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Car Selection */}
        <div className="p-4 border-b bg-gray-50">
          <div className="flex items-center justify-center">
            <div className="flex items-center space-x-3">
              <span className="text-sm font-medium text-gray-700">호차 선택:</span>
              {loadingCars ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <span className="text-sm text-gray-600">객차 정보 로딩 중...</span>
                </div>
              ) : (
                <Select
                  value={selectedCar?.id.toString() || ""}
                  onValueChange={handleCarChange}
                >
                  <SelectTrigger className="w-64 bg-white border-gray-300">
                    <SelectValue placeholder="객차를 선택하세요" />
                  </SelectTrigger>
                  <SelectContent className="z-[100]">
                    {filteredCars.map((car) => (
                      <SelectItem 
                        key={car.id} 
                        value={car.id.toString()}
                      >
                        {car.carNumber}호차 ({car.remainingSeats}/{car.totalSeats}석) 
                        {car.carType === "FIRST_CLASS" ? " 특실" : " 일반실"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>
        </div>

        {/* Seat Legend */}
        <div className="p-4 border-b bg-white">
          <div className="flex items-center justify-center space-x-8 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-5 h-5 bg-blue-100 border border-blue-300 rounded"></div>
              <span className="text-gray-700">선택 가능</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-5 h-5 bg-blue-600 border border-blue-700 rounded"></div>
              <span className="text-gray-700">선택됨</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-5 h-5 bg-gray-400 border border-gray-500 rounded"></div>
              <span className="text-gray-700">매진</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-5 h-5 bg-orange-100 border-orange-300 rounded flex items-center justify-center">
                <span className="text-xs text-orange-600">→</span>
              </div>
              <span className="text-gray-700">순방향</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-5 h-5 bg-purple-100 border-purple-300 rounded flex items-center justify-center">
                <span className="text-xs text-purple-600">←</span>
              </div>
              <span className="text-gray-700">역방향</span>
            </div>
          </div>
        </div>

        {/* Train Seat Map */}
        <div className="p-6 overflow-auto max-h-[60vh]">
          {loadingSeats ? (
            <div className="flex items-center justify-center h-64">
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="text-gray-600">좌석 정보 로딩 중...</span>
              </div>
            </div>
          ) : seatGrid.length > 0 ? (
            <TrainSeatGrid
              seatGrid={seatGrid}
              selectedSeats={selectedSeats}
              selectedTrain={selectedTrain}
              selectedCar={selectedCar}
              selectedSeatType={selectedSeatType}
              onSeatSelectionClick={handleSeatSelectionClick}
              getSeatButtonStyle={getSeatButtonStyle}
            />
          ) : (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="text-gray-400 text-6xl mb-4">🚂</div>
                <p className="text-gray-600">좌석 정보를 불러올 수 없습니다.</p>
                <p className="text-sm text-gray-500">객차를 선택해주세요.</p>
              </div>
            </div>
          )}
        </div>

        {/* Dialog Footer */}
        <div className="p-6 border-t bg-gray-50">
          {selectionError && (
            <p role="alert" className="mb-3 text-sm font-medium text-red-600">
              {selectionError}
            </p>
          )}
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              선택된 좌석: {selectedSeats.length > 0 ? selectedSeats.join(", ") : "없음"}
            </div>
            <Button
              onClick={() => onApply(selectedSeats, selectedCar ? parseInt(selectedCar.carNumber) : 1)}
              disabled={selectedSeats.length !== maxSeats}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2 rounded-lg font-medium"
            >
              선택적용 ({selectedSeats.length}명 좌석 선택/총 {maxSeats}명)
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
} 
