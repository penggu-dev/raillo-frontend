"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeftRight, Search } from "lucide-react";
import { StationSelector } from "@/components/ticket/search/station-selector";
import { DateTimeSelector } from "@/components/ticket/search/date-time-selector";
import { PassengerSelector } from "@/components/ticket/search/passenger-selector";
import type { PassengerCounts } from "@/types/passengerType";
import { useToast } from "@/hooks/useToast";
import { saveSearchHistory } from "@/lib/utils/searchHistory";

/** 홈 열차 예매 폼 — 홈에서 상호작용이 있는 유일한 영역이라 이 부분만 클라이언트 컴포넌트로 둔다 */
export function HomeSearchForm() {
  const router = useRouter();
  const { toast } = useToast();

  // 예매 폼 상태
  const [departureStation, setDepartureStation] = useState("");
  const [arrivalStation, setArrivalStation] = useState("");
  const [departureDate, setDepartureDate] = useState<Date>(new Date());
  const [passengers, setPassengers] = useState<PassengerCounts>({
    adult: 1,
    child: 0,
    infant: 0,
    senior: 0,
    severelydisabled: 0,
    mildlydisabled: 0,
    veteran: 0,
  });

  const handleSearch = async () => {
    if (!departureStation || !arrivalStation || !departureDate) {
      toast({
        title: "입력 오류",
        description: "모든 항목을 선택해주세요.",
        variant: "destructive",
      });
      return;
    }

    // 검색 기록 저장
    saveSearchHistory(departureStation, arrivalStation);

    const params = new URLSearchParams({
      departure: departureStation,
      arrival: arrivalStation,
      date: `${departureDate.getFullYear()}-${(departureDate.getMonth() + 1).toString().padStart(2, "0")}-${departureDate.getDate().toString().padStart(2, "0")}`,
      hour: departureDate.getHours().toString().padStart(2, "0"),
    });
    const passengerEntries: [string, number][] = [
      ["adult", passengers.adult],
      ["child", passengers.child],
      ["infant", passengers.infant],
      ["senior", passengers.senior],
      ["severelydisabled", passengers.severelydisabled],
      ["mildlydisabled", passengers.mildlydisabled],
      ["veteran", passengers.veteran],
    ];
    passengerEntries.forEach(([key, value]) => {
      if (value > 0) params.set(key, value.toString());
    });

    router.push(`/ticket/search?${params.toString()}`);
  };

  const swapStations = () => {
    const temp = departureStation;
    setDepartureStation(arrivalStation);
    setArrivalStation(temp);
  };

  const handleDepartureStationChange = (station: string) => {
    if (station === arrivalStation) {
      // 출발역과 도착역이 같으면 자동으로 바꾸기
      setArrivalStation(departureStation);
      setDepartureStation(station);
    } else {
      setDepartureStation(station);
    }
  };

  const handleArrivalStationChange = (station: string) => {
    if (station === departureStation) {
      // 출발역과 도착역이 같으면 자동으로 바꾸기
      setDepartureStation(arrivalStation);
      setArrivalStation(station);
    } else {
      setArrivalStation(station);
    }
  };

  const handleBothStationsChange = (departure: string, arrival: string) => {
    setDepartureStation(departure);
    setArrivalStation(arrival);
  };

  return (
    /* 한 줄 예매 폼 */
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-end">
      {/* 출발역 */}
      <div className="lg:col-span-2">
        <StationSelector
          value={departureStation}
          onValueChange={handleDepartureStationChange}
          placeholder="출발역 선택"
          label="출발역"
          otherStation={arrivalStation}
          onBothStationsChange={handleBothStationsChange}
        />
      </div>

      {/* 교환 버튼 */}
      <div className="lg:col-span-1 flex justify-center">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={swapStations}
          aria-label="출발역과 도착역 바꾸기"
          className="p-3 h-12 w-12 rounded-full transition-all duration-200"
        >
          <ArrowLeftRight className="h-5 w-5" />
        </Button>
      </div>

      {/* 도착역 */}
      <div className="lg:col-span-2">
        <StationSelector
          value={arrivalStation}
          onValueChange={handleArrivalStationChange}
          placeholder="도착역 선택"
          label="도착역"
          otherStation={departureStation}
          onBothStationsChange={handleBothStationsChange}
        />
      </div>

      {/* 출발일 */}
      <div className="lg:col-span-2">
        <DateTimeSelector
          value={departureDate}
          onValueChange={(date) => {
            setDepartureDate(date);
          }}
          placeholder="날짜 선택"
          label="출발일"
        />
      </div>

      {/* 인원 */}
      <div className="lg:col-span-2">
        <PassengerSelector
          value={passengers}
          onValueChange={setPassengers}
          placeholder="인원 선택"
          label="인원"
          simple={false}
        />
      </div>

      {/* 검색 버튼 */}
      <div className="lg:col-span-3">
        <Button
          size="lg"
          onClick={handleSearch}
          disabled={
            Object.values(passengers).reduce(
              (sum, c) => sum + c,
              0,
            ) === 0
          }
          className="w-full font-semibold h-12 text-lg shadow-elev-sm hover:shadow-elev-md transition-all duration-200"
        >
          <Search className="mr-3 h-5 w-5" />
          열차 조회하기
        </Button>
      </div>
    </div>
  );
}
