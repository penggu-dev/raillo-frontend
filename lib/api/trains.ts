import { api, requireResult } from "../api";
import type {
  TrainSearchResponse,
  TrainSearchRequest,
  CalendarInfo,
  CarSearchResponse,
  CarSearchRequest,
  SeatSearchResponse,
  SeatSearchRequest,
} from "@/types/trainType";

export { STATIONS, stationUtils } from "@/constants/stations";

export const searchTrains = async (
  request: TrainSearchRequest,
): Promise<TrainSearchResponse> => {
  const response = await api.post<TrainSearchResponse>(
    `/api/v1/trains/search`,
    request,
  );
  return requireResult(response.result, "열차 조회에 실패했습니다.");
};

export const getCalendar = async (): Promise<CalendarInfo[]> => {
  const response = await api.get<CalendarInfo[]>("/api/v1/trains/calendar");
  return response.result ?? [];
};

export const searchCars = async (
  request: CarSearchRequest,
): Promise<CarSearchResponse> => {
  const response = await api.post<CarSearchResponse>(
    "/api/v1/trains/cars",
    request,
  );
  return requireResult(response.result, "호차 조회에 실패했습니다.");
};

export const searchSeats = async (
  request: SeatSearchRequest,
): Promise<SeatSearchResponse> => {
  const response = await api.post<SeatSearchResponse>(
    "/api/v1/trains/seats",
    request,
  );
  return requireResult(response.result, "좌석 조회에 실패했습니다.");
};
