import { api, ApiResponse } from "../api";
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
): Promise<ApiResponse<TrainSearchResponse>> => {
  return api.post<TrainSearchResponse>(`/api/v1/trains/search`, request);
};

export const getCalendar = async (): Promise<ApiResponse<CalendarInfo[]>> => {
  return api.get<CalendarInfo[]>("/api/v1/trains/calendar");
};

export const searchCars = async (
  request: CarSearchRequest,
): Promise<ApiResponse<CarSearchResponse>> => {
  return api.post<CarSearchResponse>("/api/v1/trains/cars", request);
};

export const searchSeats = async (
  request: SeatSearchRequest,
): Promise<ApiResponse<SeatSearchResponse>> => {
  return api.post<SeatSearchResponse>("/api/v1/trains/seats", request);
};
