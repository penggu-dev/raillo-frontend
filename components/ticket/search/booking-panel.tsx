"use client";

import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Clock, CreditCard, X, Train } from "lucide-react";
import type { CarInfo, TrainSchedule, SeatType } from "@/types/trainType";
import LoadingSpinner from "@/components/common/LoadingSpinner";

interface BookingPanelProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTrain: TrainSchedule | null;
  selectedSeatType: SeatType;
  selectedSeats: string[];
  selectedCar: number;
  onSeatSelection: () => void;
  onBooking: () => void;
  getTrainTypeColor: (trainType: string) => string;
  getSeatTypeName: (seatType: SeatType) => string;
  formatPrice: (price: number) => string;
  carList: CarInfo[];
  loadingCars: boolean;
  onRefreshSeats: () => void;
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
  // 트리거 없이 상태로 여닫는 모달이라 Radix가 포커스를 돌려줄 대상이 없음 → 연 요소를 기억했다가 복귀
  const returnFocusRef = useRef<HTMLElement | null>(null);

  if (!selectedTrain) return null;

  const selectedCarInfo = carList.find(
    (car) => parseInt(car.carNumber) === selectedCar,
  );
  const selectedSeatInfo = selectedTrain[selectedSeatType];
  const price = selectedSeatInfo?.fare ?? 0;

  return (
    // Drawer(vaul · Radix Dialog 기반): 포커스 트랩, Esc·바깥 클릭 닫기, 닫힌 뒤 포커스 복귀
    <Drawer
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      shouldScaleBackground={false}
      // vaul은 기본적으로 열릴 때 포커스를 옮기지 않아(autoFocus=false) 포커스 트랩이 동작하지 않음
      autoFocus
    >
      <DrawerContent
        className="rounded-t-2xl border-x-0 border-b-0 border-t shadow-elev-lg"
        onOpenAutoFocus={() => {
          returnFocusRef.current = document.activeElement as HTMLElement | null;
        }}
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          if (returnFocusRef.current?.isConnected) returnFocusRef.current.focus();
        }}
      >
        <div className="container mx-auto px-4 py-6 max-w-6xl">
          {/* Panel Header */}
          <div className="flex items-center justify-between mb-6">
            {/* 제목(열차 등급·번호)이 패널의 접근 가능한 이름이 됨 — 뱃지가 div라 heading 대신 div로 렌더링 */}
            <DrawerTitle asChild>
              <div className="flex items-center space-x-4 text-base font-normal leading-normal tracking-normal">
                <Badge
                  className={`${getTrainTypeColor(selectedTrain.trainName)} px-3 py-1`}
                >
                  {selectedTrain.trainName}
                </Badge>
                <span className="text-xl font-bold">
                  {selectedTrain.trainNumber}
                </span>
                <span className="text-muted-foreground">열차 예매</span>
              </div>
            </DrawerTitle>
            <DrawerDescription className="sr-only">
              열차 시각·객차·운임을 확인하고 좌석을 선택해 예매합니다.
            </DrawerDescription>
            <DrawerClose asChild>
              <Button variant="ghost" size="sm" aria-label="예매 패널 닫기">
                <X className="h-5 w-5" />
              </Button>
            </DrawerClose>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Train Schedule */}
            <div className="flex flex-col">
              <h3 className="font-semibold text-foreground mb-3 flex items-center">
                <Clock className="h-4 w-4 mr-2" />
                열차 시각
              </h3>
              <div className="bg-muted rounded-lg p-4 flex-1 flex items-center justify-center">
                <div className="w-full">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">출발</span>
                    <span className="font-semibold">
                      {selectedTrain.departureTime.substring(0, 5)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">도착</span>
                    <span className="font-semibold">
                      {selectedTrain.arrivalTime.substring(0, 5)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">소요시간</span>
                    <span className="font-semibold">
                      {selectedTrain.formattedTravelTime}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Car Information */}
            <div className="flex flex-col">
              <h3 className="font-semibold text-foreground mb-3 flex items-center">
                <Train className="h-4 w-4 mr-2" />
                객차 정보
              </h3>
              <div className="bg-muted rounded-lg p-4 flex-1 flex items-center justify-center">
                <div className="text-center w-full">
                  {loadingCars ? (
                    <div className="flex items-center justify-center space-x-2">
                      <LoadingSpinner size="sm" />
                      <span className="text-sm text-muted-foreground">로딩 중...</span>
                    </div>
                  ) : selectedCarInfo ? (
                    <>
                      <div className="text-sm text-muted-foreground mb-1">
                        선택된 객차
                      </div>
                      <div className="text-lg font-semibold">
                        {selectedCarInfo.carNumber}호차
                      </div>
                      <div className="text-sm text-primary">
                        {selectedCarInfo.carType === "FIRST_CLASS"
                          ? "특실"
                          : "일반실"}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {selectedCarInfo.remainingSeats}/
                        {selectedCarInfo.totalSeats}석
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="text-sm text-muted-foreground mb-1">
                        객차 정보
                      </div>
                      <div className="text-lg font-semibold">
                        {selectedCar}호차
                      </div>
                      <div className="text-sm text-muted-foreground">정보 없음</div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Fare Information */}
            <div className="flex flex-col">
              <h3 className="font-semibold text-foreground mb-3 flex items-center">
                <CreditCard className="h-4 w-4 mr-2" />
                운임 요금
              </h3>
              <div className="bg-muted rounded-lg p-4 flex-1 flex items-center justify-center">
                <div className="text-center w-full">
                  <div className="text-sm text-muted-foreground mb-1">
                    {getSeatTypeName(selectedSeatType)} (1인 기준)
                  </div>
                  <div className="text-2xl font-bold text-primary">
                    {formatPrice(price)}
                  </div>
                  {selectedSeats.length > 0 && (
                    <div className="text-sm text-muted-foreground mt-1">
                      총 {formatPrice(price * selectedSeats.length)}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Seat Selection */}
            <div className="flex flex-col">
              <h3 className="font-semibold text-foreground mb-3">좌석 선택</h3>
              <div className="bg-muted rounded-lg p-4 mb-3 flex-1 flex items-center justify-center">
                <div className="text-center w-full">
                  {selectedSeats.length > 0 ? (
                    <>
                      <div className="text-sm text-muted-foreground mb-1">
                        선택된 좌석
                      </div>
                      <div className="text-lg font-semibold">
                        {selectedCar}호차
                      </div>
                      <div className="text-sm text-primary font-medium">
                        {selectedSeats.join(", ")}
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="text-sm text-muted-foreground mb-1">
                        선택된 좌석
                      </div>
                      <div className="text-lg font-semibold">
                        {getSeatTypeName(selectedSeatType)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        좌석을 선택해주세요
                      </div>
                    </>
                  )}
                </div>
              </div>
              <Button
                onClick={onSeatSelection}
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
                <div className="text-sm text-muted-foreground">
                  총 {selectedSeats.length}명 /{" "}
                  {selectedSeats.length > 0
                    ? formatPrice(price * selectedSeats.length)
                    : formatPrice(price)}
                </div>
              </div>
              <Button
                onClick={onBooking}
                disabled={selectedSeats.length === 0}
                className="px-8 py-3 text-base font-semibold shadow-elev-sm hover:shadow-elev-md transition-all duration-200 disabled:cursor-not-allowed"
              >
                예매하기
              </Button>
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
