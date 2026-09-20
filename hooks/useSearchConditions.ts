import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { stationUtils } from "@/constants/stations";
import type { PassengerCounts } from "@/types/passengerType";
import type { TrainSearchRequest } from "@/types/trainType";

type SearchParamUpdates = Record<string, string | undefined>;

/**
 * 열차 조회 조건 — URL 쿼리가 원본이다.
 * 폼에서 바꾼 조건은 URL에만 반영되고(conditionsChanged), 조회 버튼을 눌러야 buildSearchRequest()로 확정된다.
 */
export const useSearchConditions = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [conditionsChanged, setConditionsChanged] = useState(false);

  const departureStation = searchParams.get("departure") ?? "";
  const arrivalStation = searchParams.get("arrival") ?? "";
  const dateStr = searchParams.get("date") ?? "";
  const hour = searchParams.get("hour") ?? "00";

  const passengerCounts: PassengerCounts = useMemo(
    () => ({
      adult: Number(searchParams.get("adult")) || 0,
      child: Number(searchParams.get("child")) || 0,
      infant: Number(searchParams.get("infant")) || 0,
      senior: Number(searchParams.get("senior")) || 0,
      severelydisabled: Number(searchParams.get("severelydisabled")) || 0,
      mildlydisabled: Number(searchParams.get("mildlydisabled")) || 0,
      veteran: Number(searchParams.get("veteran")) || 0,
    }),
    [searchParams],
  );
  const totalPassengers = Object.values(passengerCounts).reduce(
    (sum, count) => sum + count,
    0,
  );

  const date = useMemo(() => {
    if (!dateStr) return new Date();
    const [year, month, day] = dateStr.split("-").map(Number);
    const d = new Date(year, month - 1, day);
    d.setHours(Number(hour), 0, 0, 0);
    return d;
  }, [dateStr, hour]);

  // 역·날짜가 모두 있어야 조회할 수 있다
  const hasConditions = Boolean(departureStation && arrivalStation && dateStr);

  // 현재 URL 조건으로 조회 요청을 만든다 — 역 이름으로 ID를 찾지 못하면 null
  const buildSearchRequest = (): TrainSearchRequest | null => {
    const departureStationId = stationUtils.getStationId(departureStation);
    const arrivalStationId = stationUtils.getStationId(arrivalStation);
    if (!departureStationId || !arrivalStationId) return null;
    return {
      departureStationId,
      arrivalStationId,
      operationDate: dateStr,
      passengerCount: totalPassengers,
      departureHour: hour.replace("시", ""),
    };
  };

  const changeConditions = (updates: SearchParamUpdates) => {
    const current = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value === undefined) current.delete(key);
      else current.set(key, value);
    });
    router.replace(`/ticket/search?${current.toString()}`);
    setConditionsChanged(true);
  };

  const changeDate = (newDate: Date) => {
    changeConditions({
      date: format(newDate, "yyyy-MM-dd"),
      hour: newDate.getHours().toString().padStart(2, "0"),
    });
  };

  const changePassengers = (counts: PassengerCounts) => {
    const toParam = (value: number) => (value > 0 ? value.toString() : undefined);
    changeConditions({
      adult: toParam(counts.adult),
      child: toParam(counts.child),
      infant: toParam(counts.infant),
      senior: toParam(counts.senior),
      severelydisabled: toParam(counts.severelydisabled),
      mildlydisabled: toParam(counts.mildlydisabled),
      veteran: toParam(counts.veteran),
    });
  };

  // 출발역을 도착역과 같게 고르면 두 역을 맞바꾼다
  const changeDepartureStation = (station: string) => {
    changeConditions(
      station === arrivalStation
        ? { departure: station, arrival: departureStation }
        : { departure: station },
    );
  };

  const changeArrivalStation = (station: string) => {
    changeConditions(
      station === departureStation
        ? { arrival: station, departure: arrivalStation }
        : { arrival: station },
    );
  };

  const changeStations = (departure: string, arrival: string) => {
    changeConditions({ departure, arrival });
  };

  return {
    departureStation,
    arrivalStation,
    dateStr,
    date,
    passengerCounts,
    totalPassengers,
    hasConditions,
    conditionsChanged,
    markSearched: () => setConditionsChanged(false),
    buildSearchRequest,
    changeDate,
    changePassengers,
    changeDepartureStation,
    changeArrivalStation,
    changeStations,
  };
};
