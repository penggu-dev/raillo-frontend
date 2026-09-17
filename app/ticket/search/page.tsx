"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { formatPrice } from "@/lib/utils/format";
import { searchTrains, searchCars, searchSeats } from "@/lib/api/trains";
import { stationUtils } from "@/constants/stations";
import { createPendingBooking } from "@/lib/api/pendingBookings";
import { PENDING_BOOKINGS_QUERY_KEY } from "@/hooks/usePendingBooking";
import { handleError } from "@/lib/utils/errorHandler";
import { BookingPanel } from "@/components/ticket/search/booking-panel";
import { SearchForm } from "@/components/ticket/search/search-form";
import { TrainList } from "@/components/ticket/search/train-list";
import { UsageInfo } from "@/components/common/usage-info";
import { useAuthStore } from "@/stores/auth-store";
import type {
  CarInfo,
  SeatDetail,
  TrainSchedule,
  SeatType,
} from "@/types/trainType";
import type { PassengerCounts } from "@/types/passengerType";
import { useToast } from "@/hooks/useToast";
import { saveSearchHistory } from "@/lib/utils/searchHistory";
import { TrainListSkeleton } from "@/components/ticket/search/TrainListSkeleton";

// 좌석 선택 다이얼로그는 호차 선택(Radix Select)까지 포함해 무겁고 예매 패널에서만 열리므로 필요할 때 받는다
const SeatSelectionDialog = dynamic(
  () =>
    import("@/components/ticket/search/seat-selection-dialog").then(
      (mod) => mod.SeatSelectionDialog,
    ),
  { ssr: false },
);

function TrainSearchPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const initializeAuth = useAuthStore((state) => state.initialize);
  const urlSearchParams = useSearchParams();

  // 검색 상태를 URL params에서 파생
  const departureStation = urlSearchParams.get("departure") ?? "";
  const arrivalStation = urlSearchParams.get("arrival") ?? "";
  const dateStr = urlSearchParams.get("date") ?? "";
  const hour = urlSearchParams.get("hour") ?? "00";

  const passengerCounts: PassengerCounts = useMemo(
    () => ({
      adult: Number(urlSearchParams.get("adult")) || 0,
      child: Number(urlSearchParams.get("child")) || 0,
      infant: Number(urlSearchParams.get("infant")) || 0,
      senior: Number(urlSearchParams.get("senior")) || 0,
      severelydisabled: Number(urlSearchParams.get("severelydisabled")) || 0,
      mildlydisabled: Number(urlSearchParams.get("mildlydisabled")) || 0,
      veteran: Number(urlSearchParams.get("veteran")) || 0,
    }),
    [urlSearchParams],
  );

  const date = useMemo(() => {
    if (!dateStr) return new Date();
    const [year, month, day] = dateStr.split("-").map(Number);
    const d = new Date(year, month - 1, day);
    d.setHours(Number(hour), 0, 0, 0);
    return d;
  }, [dateStr, hour]);
  const [displayedTrains, setDisplayedTrains] = useState<TrainSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [selectedTrain, setSelectedTrain] = useState<TrainSchedule | null>(
    null,
  );
  const [selectedSeatType, setSelectedSeatType] =
    useState<SeatType>("standardSeat");
  const [showBookingPanel, setShowBookingPanel] = useState(false);
  const [searchConditionsChanged, setSearchConditionsChanged] = useState(false);

  // Seat selection state
  const [showSeatSelection, setShowSeatSelection] = useState(false);
  // 예매 패널을 처음 열 때 좌석 선택 다이얼로그를 마운트해 미리 받아 둔다 (닫힌 뒤에도 유지)
  const [seatDialogMounted, setSeatDialogMounted] = useState(false);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [selectedCar, setSelectedCar] = useState(1);

  // 객차 및 좌석 조회 상태
  const [carList, setCarList] = useState<CarInfo[]>([]);
  const [seatList, setSeatList] = useState<SeatDetail[]>([]);
  const [loadingCars, setLoadingCars] = useState(false);
  const [loadingSeats, setLoadingSeats] = useState(false);

  // 중복 호출 방지 플래그
  const didFetchTrains = useRef(false);
  // 조회 차수 — 다시 조회할 때마다 올려, 이전 조회·더보기의 늦은 응답을 버린다
  const searchGenerationRef = useRef(0);
  // 더보기 진행 여부 — 버튼 비활성화가 렌더되기 전의 연속 클릭을 막는다
  const loadingMoreRef = useRef(false);
  // 예매 패널·좌석 선택 다이얼로그를 닫은 뒤 포커스를 돌려줄 요소
  const overlayReturnFocusRef = useRef<HTMLElement | null>(null);

  const updateSearchParams = (updates: Record<string, string | undefined>) => {
    const current = new URLSearchParams(urlSearchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value === undefined) current.delete(key);
      else current.set(key, value);
    });
    router.replace(`/ticket/search?${current.toString()}`);
  };

  // 실제 API 호출 함수
  const fetchTrainsFromAPI = async () => {
    const generation = ++searchGenerationRef.current;
    // 진행 중이던 더보기는 이전 조회의 요청이므로 더보기 상태를 풀어 둔다
    loadingMoreRef.current = false;
    setLoadingMore(false);
    setLoading(true);

    // 검색 기록 저장
    saveSearchHistory(departureStation, arrivalStation);

    try {
      const totalPassengers = Object.values(passengerCounts).reduce(
        (sum: number, count: unknown) => sum + (count as number),
        0,
      );

      const departureStationId = stationUtils.getStationId(departureStation);
      const arrivalStationId = stationUtils.getStationId(arrivalStation);

      if (!departureStationId || !arrivalStationId) {
        toast({
          title: "오류",
          description: "역 정보를 찾을 수 없습니다.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      const searchRequest = {
        departureStationId,
        arrivalStationId,
        operationDate: dateStr,
        passengerCount: totalPassengers,
        departureHour: hour.replace("시", ""),
      };

      const result = await searchTrains(searchRequest, { page: 0 });
      if (generation !== searchGenerationRef.current) return;
      const resultArray: TrainSchedule[] = Array.isArray(result.content)
        ? result.content
        : [];

      setDisplayedTrains(resultArray);
      setCurrentPage(result.currentPage);
      setHasNext(result.hasNext ?? false);
    } catch (error) {
      if (generation !== searchGenerationRef.current) return;
      toast({
        title: "오류",
        description: handleError(error, "열차 검색에 실패했습니다."),
        variant: "destructive",
      });
      setDisplayedTrains([]);
      setCurrentPage(0);
      setHasNext(false);
    } finally {
      if (generation === searchGenerationRef.current) {
        setLoading(false);
      }
    }
  };

  // URL params에서 검색 조건을 읽어 초기 fetch
  useEffect(() => {
    if (didFetchTrains.current) return;
    didFetchTrains.current = true;

    if (departureStation && arrivalStation && dateStr) {
      fetchTrainsFromAPI();
    } else {
      setLoading(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleUpdateSearch = () => {
    if (!dateStr) {
      toast({
        title: "입력 오류",
        description: "출발일을 선택해주세요.",
        variant: "destructive",
      });
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date < today) {
      toast({
        title: "입력 오류",
        description: "가는 날짜는 오늘 이후여야 합니다.",
        variant: "destructive",
      });
      return;
    }

    setSearchConditionsChanged(false);
    setCurrentPage(0);
    fetchTrainsFromAPI();
  };

  const handleDateChange = (newDate: Date) => {
    updateSearchParams({
      date: format(newDate, "yyyy-MM-dd"),
      hour: newDate.getHours().toString().padStart(2, "0"),
    });
    setSearchConditionsChanged(true);
  };

  const handlePassengerChange = (newPassengerCounts: PassengerCounts) => {
    const toParam = (value: number) =>
      value > 0 ? value.toString() : undefined;
    updateSearchParams({
      adult: toParam(newPassengerCounts.adult),
      child: toParam(newPassengerCounts.child),
      infant: toParam(newPassengerCounts.infant),
      senior: toParam(newPassengerCounts.senior),
      severelydisabled: toParam(newPassengerCounts.severelydisabled),
      mildlydisabled: toParam(newPassengerCounts.mildlydisabled),
      veteran: toParam(newPassengerCounts.veteran),
    });
    setSearchConditionsChanged(true);
  };

  const handleDepartureStationChange = (station: string) => {
    if (station === arrivalStation) {
      updateSearchParams({ departure: station, arrival: departureStation });
    } else {
      updateSearchParams({ departure: station });
    }
    setSearchConditionsChanged(true);
  };

  const handleArrivalStationChange = (station: string) => {
    if (station === departureStation) {
      updateSearchParams({ arrival: station, departure: arrivalStation });
    } else {
      updateSearchParams({ arrival: station });
    }
    setSearchConditionsChanged(true);
  };

  const getSeatTypeName = (seatType: SeatType) => {
    switch (seatType) {
      case "standardSeat":
        return "일반실";
      case "firstClassSeat":
        return "특실";
      default:
        return "";
    }
  };

  const handleSeatSelection = (
    train: TrainSchedule,
    seatType: SeatType,
    trigger: HTMLElement,
  ) => {
    // 오버레이(예매 패널·좌석 선택)를 닫은 뒤 돌아갈 대상 = 지금 누른 열차 카드의 선택 버튼
    overlayReturnFocusRef.current = trigger;
    const seatInfo = train[seatType];
    if (!seatInfo?.canReserve) {
      toast({
        title: "알림",
        description: "선택하신 좌석은 매진되었습니다.",
        variant: "destructive",
      });
      return;
    }

    setSelectedTrain(train);
    setSelectedSeatType(seatType);

    if (train.trainScheduleId) {
      fetchCars(train.trainScheduleId);
    }

    setSeatDialogMounted(true);
    setShowBookingPanel(true);
  };

  const handleLoadMore = async () => {
    if (!departureStation || !arrivalStation) return;
    if (loadingMoreRef.current) return;
    loadingMoreRef.current = true;
    const generation = searchGenerationRef.current;

    setLoadingMore(true);

    try {
      const nextPage = currentPage + 1;
      const departureStationId = stationUtils.getStationId(departureStation);
      const arrivalStationId = stationUtils.getStationId(arrivalStation);

      if (!departureStationId || !arrivalStationId) {
        setLoadingMore(false);
        return;
      }

      const totalPassengers = Object.values(passengerCounts).reduce(
        (sum: number, count: unknown) => sum + (count as number),
        0,
      );

      const searchRequest = {
        departureStationId,
        arrivalStationId,
        operationDate: dateStr,
        passengerCount: totalPassengers,
        departureHour: hour.replace("시", ""),
      };

      const result = await searchTrains(searchRequest, { page: nextPage });
      // 응답 전에 다시 조회했다면 이전 조건의 페이지이므로 붙이지 않는다
      if (generation !== searchGenerationRef.current) return;
      const newTrains: TrainSchedule[] = Array.isArray(result.content)
        ? result.content
        : [];

      setDisplayedTrains((prev) => [...prev, ...newTrains]);
      setCurrentPage(result.currentPage);
      setHasNext(result.hasNext ?? false);
    } catch (error) {
      if (generation !== searchGenerationRef.current) return;
      toast({
        title: "오류",
        description: handleError(
          error,
          "열차 목록을 불러오는 데 실패했습니다.",
        ),
        variant: "destructive",
      });
      // hasNext·currentPage는 그대로 둔다 — 더보기를 다시 누르면 같은 페이지를 다시 요청한다
    } finally {
      if (generation === searchGenerationRef.current) {
        loadingMoreRef.current = false;
        setLoadingMore(false);
      }
    }
  };

  // 예약용 passengers 생성 함수
  const getPassengersForReservation = () => {
    const passengers = [];

    if (passengerCounts.adult > 0)
      passengers.push({
        passengerType: "ADULT" as const,
        count: passengerCounts.adult,
      });
    if (passengerCounts.child > 0)
      passengers.push({
        passengerType: "CHILD" as const,
        count: passengerCounts.child,
      });
    if (passengerCounts.infant > 0)
      passengers.push({
        passengerType: "INFANT" as const,
        count: passengerCounts.infant,
      });
    if (passengerCounts.senior > 0)
      passengers.push({
        passengerType: "SENIOR" as const,
        count: passengerCounts.senior,
      });
    if (passengerCounts.severelydisabled > 0)
      passengers.push({
        passengerType: "DISABLED_HEAVY" as const,
        count: passengerCounts.severelydisabled,
      });
    if (passengerCounts.mildlydisabled > 0)
      passengers.push({
        passengerType: "DISABLED_LIGHT" as const,
        count: passengerCounts.mildlydisabled,
      });
    if (passengerCounts.veteran > 0)
      passengers.push({
        passengerType: "VETERAN" as const,
        count: passengerCounts.veteran,
      });

    return passengers;
  };

  // 선택된 좌석의 seatId 배열 생성
  const getSelectedSeatIds = () => {
    return selectedSeats
      .map((seatNumber) => {
        const seat = seatList.find((s) => s.seatNumber === seatNumber);
        return seat?.seatId || 0;
      })
      .filter((id) => id > 0);
  };

  const handleBooking = async () => {
    if (!selectedTrain) return;

    if (!useAuthStore.getState().hasValidToken()) {
      await initializeAuth();
    }

    if (!useAuthStore.getState().hasValidToken()) {
      const currentPath =
        typeof window !== "undefined"
          ? window.location.pathname + window.location.search
          : "/ticket/search";
      router.push(`/login?redirectTo=${encodeURIComponent(currentPath)}`);
      return;
    }

    const departureStationId = stationUtils.getStationId(departureStation);
    const arrivalStationId = stationUtils.getStationId(arrivalStation);

    if (!departureStationId || !arrivalStationId) {
      toast({
        title: "오류",
        description: "역 정보를 찾을 수 없습니다.",
        variant: "destructive",
      });
      return;
    }

    const passengers = getPassengersForReservation();
    const passengerTypes: string[] = [];
    passengers.forEach((passenger) => {
      for (let i = 0; i < passenger.count; i++) {
        passengerTypes.push(passenger.passengerType);
      }
    });

    const seatIds = getSelectedSeatIds();

    if (seatIds.length === 0) {
      toast({
        title: "오류",
        description: "선택된 좌석 정보를 찾을 수 없습니다.",
        variant: "destructive",
      });
      return;
    }

    if (!selectedTrain.trainScheduleId) {
      toast({
        title: "오류",
        description: "열차 스케줄 정보를 찾을 수 없습니다.",
        variant: "destructive",
      });
      return;
    }

    const pendingBookingRequest = {
      trainScheduleId: selectedTrain.trainScheduleId,
      departureStationId,
      arrivalStationId,
      passengerTypes,
      seatIds,
    };

    try {
      await createPendingBooking(pendingBookingRequest);
      closeBookingPanel();
      queryClient.invalidateQueries({ queryKey: PENDING_BOOKINGS_QUERY_KEY });
      router.push("/ticket/reservations");
    } catch (e: unknown) {
      toast({
        title: "오류",
        description: handleError(e, "예약 요청 중 오류가 발생했습니다."),
        variant: "destructive",
      });
    }
  };

  const closeBookingPanel = () => {
    setShowBookingPanel(false);
    setSelectedTrain(null);
    setSelectedSeats([]);
    setSelectedCar(1);
    setCarList([]);
    setSeatList([]);
  };

  const handleSeatClick = (seatNumber: string) => {
    setSelectedSeats((prev) => {
      if (prev.includes(seatNumber)) {
        return prev.filter((seat) => seat !== seatNumber);
      } else {
        return [...prev, seatNumber];
      }
    });
  };

  const handleSeatSelectionApply = (seats: string[], car: number) => {
    const requiredSeats = getTotalPassengers();

    if (seats.length !== requiredSeats) {
      toast({
        title: "알림",
        description: `${requiredSeats}개의 좌석을 선택해주세요.`,
        variant: "destructive",
      });
      return;
    }

    setSelectedSeats(seats);
    setSelectedCar(car);
    setShowSeatSelection(false);
    setShowBookingPanel(true);
  };

  const getTotalPassengers = () => {
    return Object.values(passengerCounts).reduce(
      (sum, count) => sum + count,
      0,
    );
  };

  // 객차 조회 함수
  const fetchCars = async (trainScheduleId: number) => {
    if (!departureStation || !arrivalStation) return;

    setLoadingCars(true);
    try {
      const departureStationId = stationUtils.getStationId(departureStation);
      const arrivalStationId = stationUtils.getStationId(arrivalStation);

      if (!departureStationId || !arrivalStationId) {
        return;
      }

      const request = {
        trainScheduleId,
        departureStationId,
        arrivalStationId,
        passengerCount: getTotalPassengers(),
      };

      const result = await searchCars(request);
      setCarList(result.carInfos);
    } catch (error) {
      toast({
        title: "오류",
        description: handleError(
          error,
          "객차 정보를 불러오는 데 실패했습니다.",
        ),
        variant: "destructive",
      });
      setCarList([]);
    } finally {
      setLoadingCars(false);
    }
  };

  // 좌석 조회 함수
  const fetchSeats = async (trainCarId: string, trainScheduleId: number) => {
    if (!departureStation || !arrivalStation) return;

    setLoadingSeats(true);
    try {
      const departureStationId = stationUtils.getStationId(departureStation);
      const arrivalStationId = stationUtils.getStationId(arrivalStation);

      if (!departureStationId || !arrivalStationId) {
        return;
      }

      const request = {
        trainCarId,
        trainScheduleId,
        departureStationId,
        arrivalStationId,
      };

      const result = await searchSeats(request);
      setSeatList(result.seatList);
    } catch (error) {
      toast({
        title: "오류",
        description: handleError(
          error,
          "좌석 정보를 불러오는 데 실패했습니다.",
        ),
        variant: "destructive",
      });
      setSeatList([]);
    } finally {
      setLoadingSeats(false);
    }
  };

  // 좌석 정보 새로고침 함수
  const handleRefreshSeats = () => {
    if (selectedTrain && selectedTrain.trainScheduleId) {
      const currentCar = carList.find(
        (car) => parseInt(car.carNumber) === selectedCar,
      );
      if (currentCar) {
        fetchSeats(currentCar.id.toString(), selectedTrain.trainScheduleId);
      }
    }
  };

  if (loading) {
    return <TrainListSkeleton />;
  }

  return (
    // 로딩 스켈레톤과 같은 최소 높이 — 결과 수(빈 결과 포함)에 따라 푸터 위치가 바뀌지 않게 한다
    <div className="container mx-auto min-h-screen px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Search Form */}
        <SearchForm
          departureStation={departureStation}
          arrivalStation={arrivalStation}
          date={date}
          passengerCounts={passengerCounts}
          searchConditionsChanged={searchConditionsChanged}
          onDepartureStationChange={handleDepartureStationChange}
          onArrivalStationChange={handleArrivalStationChange}
          onDateChange={handleDateChange}
          onPassengerChange={handlePassengerChange}
          onSearch={handleUpdateSearch}
          onBothStationsChange={(departure, arrival) => {
            updateSearchParams({ departure, arrival });
            setSearchConditionsChanged(true);
          }}
        />

        {/* Train List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-foreground">검색 결과</h2>
            <div className="text-sm text-muted-foreground">
              * 요금은 어른 기준이며,
              어린이(40%)·유아(75%)·경로(30%)·장애인(30~50%)·국가유공자(50%)
              할인이 적용됩니다.
            </div>
          </div>

          <TrainList
            displayedTrains={displayedTrains}
            selectedTrain={selectedTrain}
            loadingMore={loadingMore}
            hasMoreTrains={hasNext}
            onSeatSelection={handleSeatSelection}
            onLoadMore={handleLoadMore}
            formatPrice={formatPrice}
            getSeatTypeName={getSeatTypeName}
          />
        </div>

        {/* Usage Info */}
        <UsageInfo />
      </div>

      {/* Seat Selection Dialog */}
      {seatDialogMounted && (
        <SeatSelectionDialog
          isOpen={showSeatSelection}
          onClose={() => {
            setShowSeatSelection(false);
            setSelectedSeats([]);
          }}
          selectedTrain={selectedTrain}
          selectedSeatType={selectedSeatType}
          selectedSeats={selectedSeats}
          onSeatClick={handleSeatClick}
          onApply={handleSeatSelectionApply}
          getSeatTypeName={getSeatTypeName}
          getTotalPassengers={getTotalPassengers}
          carList={carList}
          seatList={seatList}
          loadingCars={loadingCars}
          loadingSeats={loadingSeats}
          onCarSelect={(carId: string) => {
            if (selectedTrain && selectedTrain.trainScheduleId) {
              fetchSeats(carId, selectedTrain.trainScheduleId);
            }
          }}
          onRefreshSeats={handleRefreshSeats}
          returnFocusRef={overlayReturnFocusRef}
        />
      )}

      {/* Booking Panel */}
      <BookingPanel
        isOpen={showBookingPanel}
        onClose={closeBookingPanel}
        selectedTrain={selectedTrain}
        selectedSeatType={selectedSeatType}
        selectedSeats={selectedSeats}
        selectedCar={selectedCar}
        onSeatSelection={() => {
          setShowBookingPanel(false);
          setTimeout(() => {
            setShowSeatSelection(true);
          }, 100);
        }}
        onBooking={handleBooking}
        getSeatTypeName={getSeatTypeName}
        formatPrice={formatPrice}
        carList={carList}
        loadingCars={loadingCars}
        onRefreshSeats={handleRefreshSeats}
        returnFocusRef={overlayReturnFocusRef}
      />
    </div>
  );
}

export default function TrainSearchPageWrapper() {
  return (
    <Suspense
      fallback={<TrainListSkeleton />}
    >
      <TrainSearchPage />
    </Suspense>
  );
}
