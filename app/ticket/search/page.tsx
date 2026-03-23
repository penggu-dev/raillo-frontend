"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { formatPrice } from "@/lib/utils/format";
import { getTrainTypeColor } from "@/lib/utils/ticketUtils";
import {
  searchTrains,
  stationUtils,
  searchCars,
  searchSeats,
} from "@/lib/api/trains";
import { createPendingBooking } from "@/lib/api/pendingBookings";
import { PENDING_BOOKINGS_QUERY_KEY } from "@/hooks/usePendingBooking";
import { handleError } from "@/lib/utils/errorHandler";
import { SeatSelectionDialog } from "@/components/ui/seat-selection-dialog";
import { BookingPanel } from "@/components/ui/booking-panel";
import { SearchForm } from "@/components/ui/search-form";
import { TrainList } from "@/components/ui/train-list";
import { UsageInfo } from "@/components/ui/usage-info";
import { useAuthStore } from "@/stores/auth-store";
import { ko } from "date-fns/locale";
import type { CarInfo, SeatDetail, TrainSchedule, SeatType } from "@/types/trainType";
import type { PassengerCounts } from "@/types/passengerType";
import { useToast } from "@/hooks/useToast";


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
  const tripType = urlSearchParams.get("tripType") ?? "";
  const isRoundtrip = tripType === "roundtrip";
  const returnDateStr = urlSearchParams.get("returnDate") ?? "";
  const returnHour = urlSearchParams.get("returnHour") ?? "00";

  const passengerCounts: PassengerCounts = useMemo(() => ({
    adult: Number(urlSearchParams.get("adult")) || 0,
    child: Number(urlSearchParams.get("child")) || 0,
    infant: Number(urlSearchParams.get("infant")) || 0,
    senior: Number(urlSearchParams.get("senior")) || 0,
    severelydisabled: Number(urlSearchParams.get("severelydisabled")) || 0,
    mildlydisabled: Number(urlSearchParams.get("mildlydisabled")) || 0,
    veteran: Number(urlSearchParams.get("veteran")) || 0,
  }), [urlSearchParams]);

  const date = useMemo(() => {
    if (!dateStr) return new Date();
    const [year, month, day] = dateStr.split("-").map(Number);
    const d = new Date(year, month - 1, day);
    d.setHours(Number(hour), 0, 0, 0);
    return d;
  }, [dateStr, hour]);

  const returnDate = useMemo(() => {
    if (!returnDateStr) return undefined;
    const [year, month, day] = returnDateStr.split("-").map(Number);
    const d = new Date(year, month - 1, day);
    d.setHours(Number(returnHour), 0, 0, 0);
    return d;
  }, [returnDateStr, returnHour]);

  const [allTrains, setAllTrains] = useState<TrainSchedule[]>([]);
  const [displayedTrains, setDisplayedTrains] = useState<TrainSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [selectedTrain, setSelectedTrain] = useState<TrainSchedule | null>(null);
  const [selectedSeatType, setSelectedSeatType] = useState<SeatType>("standardSeat");
  const [showBookingPanel, setShowBookingPanel] = useState(false);
  const [totalResults, setTotalResults] = useState(0);
  const [searchConditionsChanged, setSearchConditionsChanged] = useState(false);

  // 왕복 관련 상태
  const [outboundTrains, setOutboundTrains] = useState<TrainSchedule[]>([]);
  const [inboundTrains, setInboundTrains] = useState<TrainSchedule[]>([]);
  const [selectedOutboundTrain, setSelectedOutboundTrain] = useState<TrainSchedule | null>(null);
  const [selectedInboundTrain, setSelectedInboundTrain] = useState<TrainSchedule | null>(null);
  const [outboundReserved, setOutboundReserved] = useState(false);

  // 오는 열차 더보기 관련 상태
  const [inboundCurrentPage, setInboundCurrentPage] = useState(0);
  const [inboundHasNext, setInboundHasNext] = useState(false);
  const [loadingInboundMore, setLoadingInboundMore] = useState(false);

  // Seat selection state
  const [showSeatSelection, setShowSeatSelection] = useState(false);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [selectedCar, setSelectedCar] = useState(1);

  // 객차 및 좌석 조회 상태
  const [carList, setCarList] = useState<CarInfo[]>([]);
  const [seatList, setSeatList] = useState<SeatDetail[]>([]);
  const [loadingCars, setLoadingCars] = useState(false);
  const [loadingSeats, setLoadingSeats] = useState(false);

  // 중복 호출 방지 플래그
  const didFetchTrains = useRef(false);

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
    setLoading(true);

    try {
      // 검색 기록 저장
      const searchHistory = {
        departure: departureStation,
        arrival: arrivalStation,
        timestamp: Date.now(),
      };

      const existingHistory = localStorage.getItem("rail-o-search-history");
      let historyArray: { departure: string; arrival: string; timestamp: number }[] = [];

      if (existingHistory) {
        try {
          historyArray = JSON.parse(existingHistory);
        } catch {
          // 파싱 실패 시 빈 배열로 시작
        }
      }

      historyArray = historyArray.filter(
        (item) => !(item.departure === searchHistory.departure && item.arrival === searchHistory.arrival),
      );
      historyArray.unshift(searchHistory);
      historyArray = historyArray.slice(0, 3);
      localStorage.setItem("rail-o-search-history", JSON.stringify(historyArray));

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

      const result = await searchTrains(searchRequest);
      const resultArray: TrainSchedule[] = Array.isArray(result.content) ? result.content : [];

      setAllTrains(resultArray);
      setDisplayedTrains(resultArray);
      setTotalResults(result.totalElements || resultArray.length);
      setHasNext(result.hasNext ?? false);
    } catch (error) {
      toast({ title: "오류", description: handleError(error, "열차 검색에 실패했습니다."), variant: "destructive" });
      setAllTrains([]);
      setDisplayedTrains([]);
      setTotalResults(0);
      setHasNext(false);
    } finally {
      setLoading(false);
    }
  };

  // 오는 열차 검색 함수
  const fetchInboundTrains = async (totalPassengers: number) => {
    try {
      const depStationId = stationUtils.getStationId(arrivalStation); // 출발역과 도착역이 바뀜
      const arrStationId = stationUtils.getStationId(departureStation);

      if (!depStationId || !arrStationId) {
        return;
      }

      const searchRequest = {
        departureStationId: depStationId,
        arrivalStationId: arrStationId,
        operationDate: returnDateStr || dateStr,
        passengerCount: totalPassengers,
        departureHour: returnHour.replace("시", "") || "00",
      };

      const result = await searchTrains(searchRequest);
      const inbound: TrainSchedule[] = Array.isArray(result.content) ? result.content : [];

      setInboundTrains(inbound);
      setInboundHasNext(result.hasNext ?? false);
    } catch {
      // 오는 열차 검색 실패 시 목록 미표시
    }
  };

  // 왕복일 때 가는 열차 예매 완료 후 오는 열차 검색
  const fetchInboundTrainsAfterReservation = async () => {
    if (!returnDateStr) return;

    setLoading(true);
    try {
      const totalPassengers = Object.values(passengerCounts).reduce(
        (sum: number, count: unknown) => sum + (count as number),
        0,
      );
      await fetchInboundTrains(totalPassengers);
    } catch {
      // 오는 열차 검색 실패 시 목록 미표시
    } finally {
      setLoading(false);
    }
  };

  // 왕복일 때 가는 열차 예매 완료 처리
  const handleOutboundReservationComplete = async () => {
    setOutboundReserved(true);
    await fetchInboundTrainsAfterReservation();
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

    if (isRoundtrip && returnDate && returnDate <= date) {
      toast({
        title: "입력 오류",
        description: "오는 날짜는 가는 날짜보다 늦어야 합니다.",
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

  const handleReturnDateChange = (newDate: Date) => {
    updateSearchParams({
      returnDate: format(newDate, "yyyy-MM-dd"),
      returnHour: newDate.getHours().toString().padStart(2, "0"),
    });
    setSearchConditionsChanged(true);
  };

  const handlePassengerChange = (newPassengerCounts: PassengerCounts) => {
    const toParam = (value: number) => value > 0 ? value.toString() : undefined;
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

  const handleSeatSelection = (train: TrainSchedule, seatType: SeatType) => {
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

    setShowBookingPanel(true);
  };

  const handleLoadMore = async () => {
    if (!departureStation || !arrivalStation) return;

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

      const result = await searchTrains(searchRequest);
      const newTrains: TrainSchedule[] = Array.isArray(result.content) ? result.content : [];

      setAllTrains((prev) => [...prev, ...newTrains]);
      setDisplayedTrains((prev) => [...prev, ...newTrains]);
      setCurrentPage(nextPage);
      setHasNext(result.hasNext ?? false);
      if (newTrains.length === 0) {
        setTotalResults(displayedTrains.length);
      }
    } catch (error) {
      toast({ title: "오류", description: handleError(error, "열차 목록을 불러오는 데 실패했습니다."), variant: "destructive" });
      setHasNext(false);
    } finally {
      setLoadingMore(false);
    }
  };

  // 오는 열차 더보기 함수
  const handleInboundLoadMore = async () => {
    if (!arrivalStation || !departureStation) return;

    setLoadingInboundMore(true);

    try {
      const nextPage = inboundCurrentPage + 1;
      const depStationId = stationUtils.getStationId(arrivalStation); // 출발역과 도착역이 바뀜
      const arrStationId = stationUtils.getStationId(departureStation);

      if (!depStationId || !arrStationId) {
        setLoadingInboundMore(false);
        return;
      }

      const totalPassengers = Object.values(passengerCounts).reduce(
        (sum: number, count: unknown) => sum + (count as number),
        0,
      );

      const searchRequest = {
        departureStationId: depStationId,
        arrivalStationId: arrStationId,
        operationDate: returnDateStr || "",
        passengerCount: totalPassengers,
        departureHour: returnHour.replace("시", "") || "00",
      };

      const result = await searchTrains(searchRequest);
      const resultArray = Array.isArray(result.content) ? result.content : [];

      const newInboundTrains: TrainSchedule[] = resultArray;

      setInboundTrains((prev) => [...prev, ...newInboundTrains]);
      setInboundCurrentPage(nextPage);
      setInboundHasNext(result.hasNext ?? false);
    } catch {
      setInboundHasNext(false);
    } finally {
      setLoadingInboundMore(false);
    }
  };

  // 예약용 passengers 생성 함수
  const getPassengersForReservation = () => {
    const passengers = [];

    if (passengerCounts.adult > 0) passengers.push({ passengerType: "ADULT" as const, count: passengerCounts.adult });
    if (passengerCounts.child > 0) passengers.push({ passengerType: "CHILD" as const, count: passengerCounts.child });
    if (passengerCounts.infant > 0) passengers.push({ passengerType: "INFANT" as const, count: passengerCounts.infant });
    if (passengerCounts.senior > 0) passengers.push({ passengerType: "SENIOR" as const, count: passengerCounts.senior });
    if (passengerCounts.severelydisabled > 0) passengers.push({ passengerType: "DISABLED_HEAVY" as const, count: passengerCounts.severelydisabled });
    if (passengerCounts.mildlydisabled > 0) passengers.push({ passengerType: "DISABLED_LIGHT" as const, count: passengerCounts.mildlydisabled });
    if (passengerCounts.veteran > 0) passengers.push({ passengerType: "VETERAN" as const, count: passengerCounts.veteran });

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

  const hasValidAccessToken = () => {
    const { accessToken, tokenExpiresIn } = useAuthStore.getState();
    return (
      Boolean(accessToken) &&
      Boolean(tokenExpiresIn) &&
      Date.now() < (tokenExpiresIn ?? 0)
    );
  };

  const handleBooking = async () => {
    if (!selectedTrain) return;

    if (!hasValidAccessToken()) {
      await initializeAuth();
    }

    if (!hasValidAccessToken()) {
      const currentPath =
        typeof window !== "undefined"
          ? window.location.pathname + window.location.search
          : "/ticket/search";
      router.push(`/login?redirectTo=${encodeURIComponent(currentPath)}`);
      return;
    }

    const isInboundTrain =
      isRoundtrip &&
      outboundReserved &&
      inboundTrains.some((t) => t.trainScheduleId === selectedTrain.trainScheduleId);

    let departureStationId, arrivalStationId;
    if (isInboundTrain) {
      departureStationId = stationUtils.getStationId(arrivalStation);
      arrivalStationId = stationUtils.getStationId(departureStation);
    } else {
      departureStationId = stationUtils.getStationId(departureStation);
      arrivalStationId = stationUtils.getStationId(arrivalStation);
    }

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

      if (isRoundtrip && !outboundReserved) {
        await handleOutboundReservationComplete();
        closeBookingPanel();
        toast({
          description: "가는 열차 예매가 완료되었습니다. 이제 오는 열차를 선택하세요.",
        });
      } else {
        closeBookingPanel();
        queryClient.invalidateQueries({ queryKey: PENDING_BOOKINGS_QUERY_KEY });
        router.push("/ticket/reservations");
      }
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
    return Object.values(passengerCounts).reduce((sum, count) => sum + count, 0);
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
      toast({ title: "오류", description: handleError(error, "객차 정보를 불러오는 데 실패했습니다."), variant: "destructive" });
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
      toast({ title: "오류", description: handleError(error, "좌석 정보를 불러오는 데 실패했습니다."), variant: "destructive" });
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
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">열차 정보를 검색하고 있습니다...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Search Form */}
        <SearchForm
          departureStation={departureStation}
          arrivalStation={arrivalStation}
          date={date}
          returnDate={returnDate}
          passengerCounts={passengerCounts}
          isRoundtrip={isRoundtrip}
          searchConditionsChanged={searchConditionsChanged}
          onDepartureStationChange={handleDepartureStationChange}
          onArrivalStationChange={handleArrivalStationChange}
          onDateChange={handleDateChange}
          onReturnDateChange={handleReturnDateChange}
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
            <h2 className="text-xl font-bold text-gray-900">
              {isRoundtrip ? "왕복 열차 검색 결과" : "검색 결과"}
            </h2>
            <div className="text-sm text-gray-600">
              * 요금은 어른 기준이며,
              어린이(40%)·유아(75%)·경로(30%)·장애인(30~50%)·국가유공자(50%)
              할인이 적용됩니다.
            </div>
          </div>

          {isRoundtrip ? (
            <div className="space-y-6">
              {/* 가는 열차 목록 */}
              {!outboundReserved && (
                <div>
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      가는 열차
                    </h3>
                    <p className="text-sm text-gray-600">
                      {departureStation} → {arrivalStation}(
                      {format(date, "M월 d일 (E)", { locale: ko })})
                    </p>
                  </div>
                  <TrainList
                    displayedTrains={displayedTrains}
                    totalResults={totalResults}
                    selectedTrain={selectedOutboundTrain}
                    loadingMore={loadingMore}
                    hasMoreTrains={hasNext}
                    onSeatSelection={(train, seatType) => {
                      setSelectedOutboundTrain(train);
                      handleSeatSelection(train, seatType);
                    }}
                    onLoadMore={handleLoadMore}
                    getTrainTypeColor={getTrainTypeColor}
                    formatPrice={formatPrice}
                    getSeatTypeName={getSeatTypeName}
                  />
                </div>
              )}

              {/* 오는 열차 목록 */}
              {outboundReserved && (
                <div>
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      오는 열차
                    </h3>
                    <p className="text-sm text-gray-600">
                      {arrivalStation} → {departureStation}(
                      {returnDate ? format(returnDate, "M월 d일 (E)", { locale: ko }) : ""})
                    </p>
                    <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm text-green-800">
                        ✓ 가는 열차 예매가 완료되었습니다. 이제 오는 열차를
                        선택하세요.
                      </p>
                    </div>
                  </div>
                  <TrainList
                    displayedTrains={inboundTrains}
                    totalResults={inboundTrains.length}
                    selectedTrain={selectedInboundTrain}
                    loadingMore={loadingInboundMore}
                    hasMoreTrains={inboundHasNext}
                    onSeatSelection={(train, seatType) => {
                      setSelectedInboundTrain(train);
                      handleSeatSelection(train, seatType);
                    }}
                    onLoadMore={handleInboundLoadMore}
                    getTrainTypeColor={getTrainTypeColor}
                    formatPrice={formatPrice}
                    getSeatTypeName={getSeatTypeName}
                  />
                </div>
              )}
            </div>
          ) : (
            <TrainList
              displayedTrains={displayedTrains}
              totalResults={totalResults}
              selectedTrain={selectedTrain}
              loadingMore={loadingMore}
              hasMoreTrains={hasNext}
              onSeatSelection={handleSeatSelection}
              onLoadMore={handleLoadMore}
              getTrainTypeColor={getTrainTypeColor}
              formatPrice={formatPrice}
              getSeatTypeName={getSeatTypeName}
            />
          )}
        </div>

        {/* Usage Info */}
        <UsageInfo />
      </div>

      {/* Seat Selection Dialog */}
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
      />

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
        getTrainTypeColor={getTrainTypeColor}
        getSeatTypeName={getSeatTypeName}
        formatPrice={formatPrice}
        carList={carList}
        loadingCars={loadingCars}
        onRefreshSeats={handleRefreshSeats}
      />
    </div>
  );
}

export default function TrainSearchPageWrapper() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">열차 정보를 검색하고 있습니다...</p>
        </div>
      }
    >
      <TrainSearchPage />
    </Suspense>
  );
}
