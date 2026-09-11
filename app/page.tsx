"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ArrowLeftRight,
  CalendarIcon,
  CreditCard,
  Search,
  Train,
  MapPin,
  Clock,
} from "lucide-react";
import { StationSelector } from "@/components/ticket/search/station-selector";
import { DateTimeSelector } from "@/components/ticket/search/date-time-selector";
import { PassengerSelector } from "@/components/ticket/search/passenger-selector";
import type { PassengerCounts } from "@/types/passengerType";
import { useToast } from "@/hooks/useToast";
import { saveSearchHistory } from "@/lib/utils/searchHistory";

export default function HomePage() {
  const router = useRouter();
  const { toast } = useToast();

  // 예매 폼 상태
  const [departureStation, setDepartureStation] = useState("");
  const [arrivalStation, setArrivalStation] = useState("");
  const [departureDate, setDepartureDate] = useState<Date>(new Date());
  const [passengers, setPassengers] = useState<PassengerCounts>({
    adult: 0,
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
    <>
      {/* Main Content */}
      <div className="bg-gradient-to-b from-secondary to-background">
        <div className="container mx-auto px-4 py-8">
          {/* Hero Section with reduced spacing */}
          <div className="text-center mb-12">
            <div className="mb-4">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-full mb-4 shadow-elev-md">
                <Train className="h-8 w-8 text-primary-foreground" />
              </div>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-4 leading-tight">
              안전하고 편리한
              <span className="block text-primary">철도여행</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              RAILLO와 함께하는 스마트한 기차여행을 시작하세요
            </p>
          </div>

          {/* Ticket Booking Form with enhanced design */}
          <Card className="mb-16 shadow-elev-lg">
            <CardContent className="p-8">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold tracking-tight mb-2">열차 예매</h2>
                <p className="text-muted-foreground">
                  원하는 조건으로 열차를 검색하고 예매하세요
                </p>
              </div>

              {/* 한 줄 예매 폼 */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-end">
                {/* 출발역 */}
                <div className="lg:col-span-2">
                  <StationSelector
                    value={departureStation}
                    onValueChange={handleDepartureStationChange}
                    placeholder="출발역 선택"
                    label="출발역"
                    variant="white"
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
                    variant="white"
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
                    variant="white"
                  />
                </div>

                {/* 인원 */}
                <div className="lg:col-span-2">
                  <PassengerSelector
                    value={passengers}
                    onValueChange={setPassengers}
                    placeholder="인원 선택"
                    label="인원"
                    variant="white"
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
            </CardContent>
          </Card>

          {/* Service Grid with improved spacing and design */}
          <div className="mb-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tight text-foreground mb-4">
                주요 서비스
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                RAILLO에서 제공하는 다양한 서비스를 이용해보세요
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* 승차권 확인 */}
              <Link href="/ticket/purchased">
                <Card className="group h-full cursor-pointer transition-all duration-200 hover:shadow-elev-md hover:-translate-y-0.5">
                  <CardHeader className="pb-4">
                    <div className="flex items-center space-x-4">
                      <div className="p-3 rounded-xl bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-400 transition-transform duration-200 group-hover:scale-105">
                        <CreditCard className="h-7 w-7" />
                      </div>
                      <div>
                        <CardTitle className="text-xl text-foreground">
                          승차권 확인
                        </CardTitle>
                        <CardDescription className="text-muted-foreground">
                          예매한 승차권 정보를 확인하세요
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <Button
                      variant="outline"
                      className="w-full transition-all duration-200 font-medium"
                    >
                      확인하기
                    </Button>
                  </CardContent>
                </Card>
              </Link>

              {/* 예약 승차권 조회 및 취소 */}
              <Link href="/ticket/reservations">
                <Card className="group h-full cursor-pointer transition-all duration-200 hover:shadow-elev-md hover:-translate-y-0.5">
                  <CardHeader className="pb-4">
                    <div className="flex items-center space-x-4">
                      <div className="p-3 rounded-xl bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-400 transition-transform duration-200 group-hover:scale-105">
                        <CalendarIcon className="h-7 w-7" />
                      </div>
                      <div>
                        <CardTitle className="text-xl text-foreground">
                          예약승차권 조회
                        </CardTitle>
                        <CardDescription className="text-muted-foreground">
                          예약한 승차권을 조회하고 취소할 수 있습니다
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <Button
                      variant="outline"
                      className="w-full transition-all duration-200 font-medium"
                    >
                      조회하기
                    </Button>
                  </CardContent>
                </Card>
              </Link>

              {/* 열차 조회 */}
              <Link href="/">
                <Card className="group h-full cursor-pointer transition-all duration-200 hover:shadow-elev-md hover:-translate-y-0.5">
                  <CardHeader className="pb-4">
                    <div className="flex items-center space-x-4">
                      <div className="p-3 rounded-xl bg-purple-100 text-purple-700 dark:bg-purple-500/15 dark:text-purple-400 transition-transform duration-200 group-hover:scale-105">
                        <Search className="h-7 w-7" />
                      </div>
                      <div>
                        <CardTitle className="text-xl text-foreground">
                          승차권 예매
                        </CardTitle>
                        <CardDescription className="text-muted-foreground">
                          원하는 열차를 검색하고 예매하세요
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <Button
                      variant="outline"
                      className="w-full transition-all duration-200 font-medium"
                    >
                      예매하기
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </div>

          {/* Additional Features Section */}
          <div className="text-center">
            <div className="inline-flex items-center space-x-8 text-muted-foreground">
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5" />
                <span className="text-sm">24시간 운영</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="h-5 w-5" />
                <span className="text-sm">전국 역 연결</span>
              </div>
              <div className="flex items-center space-x-2">
                <Train className="h-5 w-5" />
                <span className="text-sm">안전한 여행</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
