import { useState } from "react";
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

  const fetchCars = async (trainScheduleId: number) => {
    if (!departureStation || !arrivalStation) return;

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
      setCarList(result.carInfos);
    } catch (error) {
      notifyError(error, "객차 정보를 불러오는 데 실패했습니다.");
      setCarList([]);
    } finally {
      setLoadingCars(false);
    }
  };

  const fetchSeats = async (trainCarId: string, trainScheduleId: number) => {
    if (!departureStation || !arrivalStation) return;

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
      setSeatList(result.seatList);
    } catch (error) {
      notifyError(error, "좌석 정보를 불러오는 데 실패했습니다.");
      setSeatList([]);
    } finally {
      setLoadingSeats(false);
    }
  };

  const reset = () => {
    setCarList([]);
    setSeatList([]);
  };

  return { carList, seatList, loadingCars, loadingSeats, fetchCars, fetchSeats, reset };
};
