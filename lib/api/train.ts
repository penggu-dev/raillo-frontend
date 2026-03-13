import { api, ApiResponse } from "../api";
import type {
  Station,
  SeatInfo,
  TrainSchedule,
  PageInfo,
  TrainSearchResponse,
  TrainSearchRequest,
  CalendarInfo,
  CalendarResponse,
  CarInfo,
  CarSearchResponse,
  CarSearchRequest,
  SeatDetail,
  SeatSearchResponse,
  SeatSearchRequest,
} from "@/types/trainType";

// 역 정보 상수
export const STATIONS: Station[] = [
  { id: 1, name: "행신" },
  { id: 2, name: "서울" },
  { id: 3, name: "영등포" },
  { id: 4, name: "수원" },
  { id: 5, name: "광명" },
  { id: 6, name: "천안아산" },
  { id: 7, name: "오송" },
  { id: 8, name: "대전" },
  { id: 9, name: "김천구미" },
  { id: 10, name: "서대구" },
  { id: 11, name: "동대구" },
  { id: 12, name: "경주" },
  { id: 13, name: "울산" },
  { id: 14, name: "경산" },
  { id: 15, name: "밀양" },
  { id: 16, name: "물금" },
  { id: 17, name: "구포" },
  { id: 18, name: "부산" },
  { id: 19, name: "진영" },
  { id: 20, name: "창원중앙" },
  { id: 21, name: "창원" },
  { id: 22, name: "마산" },
  { id: 23, name: "진주" },
  { id: 24, name: "포항" },
  { id: 25, name: "용산" },
  { id: 26, name: "공주" },
  { id: 27, name: "서대전" },
  { id: 28, name: "계룡" },
  { id: 29, name: "논산" },
  { id: 30, name: "익산" },
  { id: 31, name: "김제" },
  { id: 32, name: "정읍" },
  { id: 33, name: "장성" },
  { id: 34, name: "광주송정" },
  { id: 35, name: "나주" },
  { id: 36, name: "목포" },
  { id: 37, name: "전주" },
  { id: 38, name: "남원" },
  { id: 39, name: "곡성" },
  { id: 40, name: "구례구" },
  { id: 41, name: "순천" },
  { id: 42, name: "여천" },
  { id: 43, name: "여수엑스포" },
  { id: 44, name: "청량리" },
  { id: 45, name: "상봉" },
  { id: 46, name: "덕소" },
  { id: 47, name: "양평" },
  { id: 48, name: "서원주" },
  { id: 49, name: "만종" },
  { id: 50, name: "횡성" },
  { id: 51, name: "둔내" },
  { id: 52, name: "평창" },
  { id: 53, name: "진부(오대산)" },
  { id: 54, name: "강릉" },
  { id: 55, name: "정동진" },
  { id: 56, name: "묵호" },
  { id: 57, name: "동해" },
  { id: 58, name: "원주" },
  { id: 59, name: "제천" },
  { id: 60, name: "단양" },
  { id: 61, name: "풍기" },
  { id: 62, name: "영주" },
  { id: 63, name: "안동" },
  { id: 64, name: "의성" },
  { id: 65, name: "영천" },
  { id: 66, name: "태화강" },
  { id: 67, name: "부전" },
  { id: 68, name: "판교(경기)" },
  { id: 69, name: "부발" },
  { id: 70, name: "가남" },
  { id: 71, name: "감곡장호원" },
  { id: 72, name: "앙성온천" },
  { id: 73, name: "충주" },
  { id: 74, name: "살미" },
  { id: 75, name: "수안보온천" },
  { id: 76, name: "연풍" },
  { id: 77, name: "문경" },
];

// 역 정보 유틸리티 함수
export const stationUtils = {
  getStationName: (id: number): string => {
    const station = STATIONS.find((s) => s.id === id);
    return station ? station.name : "알 수 없음";
  },

  getStationId: (name: string): number | null => {
    const station = STATIONS.find((s) => s.name === name);
    return station ? station.id : null;
  },

  getAllStations: (): Station[] => {
    return [...STATIONS];
  },

  searchStations: (query: string): Station[] => {
    return STATIONS.filter((station) => station.name.includes(query));
  },
};

// 열차 관련 API
export const trainAPI = {
  searchTrains: async (
    request: TrainSearchRequest,
    page: number = 0,
    size: number = 10,
  ): Promise<ApiResponse<TrainSearchResponse>> => {
    const params = new URLSearchParams({
      page: String(page),
      size: String(size),
    }).toString();
    return api.post<TrainSearchResponse>(
      `/api/v1/trains/search?${params}`,
      request,
    );
  },

  getCalendar: async (): Promise<ApiResponse<CalendarInfo[]>> => {
    return api.get<CalendarInfo[]>("/api/v1/trains/calendar");
  },

  searchCars: async (
    request: CarSearchRequest,
  ): Promise<ApiResponse<CarSearchResponse>> => {
    return api.post<CarSearchResponse>("/api/v1/trains/cars", request);
  },

  searchSeats: async (
    request: SeatSearchRequest,
  ): Promise<ApiResponse<SeatSearchResponse>> => {
    return api.post<SeatSearchResponse>("/api/v1/trains/seats", request);
  },
};

// 기존 호환성을 위한 export
export const searchTrains = trainAPI.searchTrains;
export const searchCars = trainAPI.searchCars;
export const searchSeats = trainAPI.searchSeats;
