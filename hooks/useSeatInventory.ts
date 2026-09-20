import { useRef, useState } from "react";
import { stationUtils } from "@/constants/stations";
import { searchCars, searchSeats } from "@/lib/api/trains";
import { handleError } from "@/lib/utils/errorHandler";
import { useToast } from "@/hooks/useToast";
import type { CarInfo, SeatDetail } from "@/types/trainType";

interface SeatInventoryOptions {
  departureStation: string;
  arrivalStation: string;
  /** 객차 조회 시 잔여 좌석 판단에 쓰는 총 승객 수 */
  passengerCount: number;
}

/** 선택한 열차의 객차·좌석 조회 상태 — 실패하면 알리고 빈 목록으로 둔다 */
export const useSeatInventory = ({
  departureStation,
  arrivalStation,
  passengerCount,
}: SeatInventoryOptions) => {
  const { toast } = useToast();
  const [carList, setCarList] = useState<CarInfo[]>([]);
  const [seatList, setSeatList] = useState<SeatDetail[]>([]);
  const [loadingCars, setLoadingCars] = useState(false);
  const [loadingSeats, setLoadingSeats] = useState(false);

  const notifyError = (error: unknown, fallback: string) => {
    toast({
      title: "오류",
      description: handleError(error, fallback),
      variant: "destructive",
    });
  };

  // 요청마다 번호를 올려, 늦게 도착한 이전 요청의 결과는 버린다 (열차·호차를 빠르게 바꿀 때)
  const carsRequestRef = useRef(0);
  const seatsRequestRef = useRef(0);

  const fetchCars = async (trainScheduleId: number) => {
    if (!departureStation || !arrivalStation) return;

    const request = ++carsRequestRef.current;
    const isLatest = () => request === carsRequestRef.current;
    setLoadingCars(true);
    try {
      const departureStationId = stationUtils.getStationId(departureStation);
      const arrivalStationId = stationUtils.getStationId(arrivalStation);
      if (!departureStationId || !arrivalStationId) return;

      const result = await searchCars({
        trainScheduleId,
        departureStationId,
        arrivalStationId,
        passengerCount,
      });
      if (!isLatest()) return;
      setCarList(result.carInfos);
    } catch (error) {
      if (!isLatest()) return;
      notifyError(error, "객차 정보를 불러오는 데 실패했습니다.");
      setCarList([]);
    } finally {
      if (isLatest()) setLoadingCars(false);
    }
  };

  const fetchSeats = async (trainCarId: string, trainScheduleId: number) => {
    if (!departureStation || !arrivalStation) return;

    const request = ++seatsRequestRef.current;
    const isLatest = () => request === seatsRequestRef.current;
    setLoadingSeats(true);
    try {
      const departureStationId = stationUtils.getStationId(departureStation);
      const arrivalStationId = stationUtils.getStationId(arrivalStation);
      if (!departureStationId || !arrivalStationId) return;

      const result = await searchSeats({
        trainCarId,
        trainScheduleId,
        departureStationId,
        arrivalStationId,
      });
      if (!isLatest()) return;
      setSeatList(result.seatList);
    } catch (error) {
      if (!isLatest()) return;
      notifyError(error, "좌석 정보를 불러오는 데 실패했습니다.");
      setSeatList([]);
    } finally {
      if (isLatest()) setLoadingSeats(false);
    }
  };

  const reset = () => {
    // 진행 중인 요청의 결과를 버린다 — 닫은 뒤 도착한 응답이 목록을 다시 채우지 않도록
    carsRequestRef.current += 1;
    seatsRequestRef.current += 1;
    setCarList([]);
    setSeatList([]);
    setLoadingCars(false);
    setLoadingSeats(false);
  };

  return { carList, seatList, loadingCars, loadingSeats, fetchCars, fetchSeats, reset };
};
