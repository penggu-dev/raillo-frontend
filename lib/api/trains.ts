import { api, requireResult } from "../api";
import type {
  PageRequest,
  TrainSearchResponse,
  TrainSearchRequest,
  CalendarInfo,
  CarSearchResponse,
  CarSearchRequest,
  SeatSearchResponse,
  SeatSearchRequest,
} from "@/types/trainType";

/** 열차 조회 페이지 크기 — 백엔드 기본값(20)과 같은 값을 요청에 명시한다 */
export const TRAIN_SEARCH_PAGE_SIZE = 20;

export const searchTrains = async (
  request: TrainSearchRequest,
  { page = 0, size = TRAIN_SEARCH_PAGE_SIZE }: PageRequest = {},
): Promise<TrainSearchResponse> => {
  // 검색 조건은 본문, 페이지는 쿼리(Spring Pageable)로 보낸다
  const params = new URLSearchParams({ page: String(page), size: String(size) });
  const response = await api.post<TrainSearchResponse>(
    `/api/v1/trains/search?${params}`,
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
