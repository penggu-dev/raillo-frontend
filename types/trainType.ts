// ========== 역 ==========

export interface Station {
  id: number;
  name: string;
}

// ========== 좌석 타입 ==========

export type SeatType = "standardSeat" | "firstClassSeat";

// ========== 열차 ==========

export interface SeatInfo {
  availableSeats: number;
  totalSeats: number;
  fare: number;
  status: "AVAILABLE" | "UNAVAILABLE" | "SOLD_OUT";
  canReserve: boolean;
  displayText: string;
}

export interface TrainSchedule {
  trainScheduleId: number;
  trainNumber: string;
  trainName: string;
  departureStationName: string;
  arrivalStationName: string;
  departureTime: string;
  arrivalTime: string;
  travelTime: string;
  standardSeat: SeatInfo;
  firstClassSeat: SeatInfo | null;
  standing: SeatInfo | null;
  formattedTravelTime: string;
  expressTrain: boolean;
}

/** 페이지 요청 — Spring Pageable 쿼리 (page는 0부터) */
export interface PageRequest {
  page?: number;
  size?: number;
}

/** Slice 페이지 정보 — 백엔드는 전체 개수·전체 페이지 수를 주지 않는다 */
export interface PageInfo {
  currentPage: number;
  pageSize: number;
  numberOfElements: number;
  hasNext: boolean;
  hasPrevious: boolean;
  first: boolean;
  last: boolean;
}

export interface TrainSearchResponse extends PageInfo {
  content: TrainSchedule[];
}

export interface TrainSearchRequest {
  departureStationId: number;
  arrivalStationId: number;
  operationDate: string;
  passengerCount: number;
  departureHour: string;
}

// ========== 운행 캘린더 ==========

export interface CalendarInfo {
  operationDate: string;
  dayOfWeek: string;
  businessDayType: "WEEKDAY" | "WEEKEND";
  isHoliday: "Y" | "N";
  isBookingAvailable: "Y" | "N";
}

export interface CalendarResponse {
  content: CalendarInfo[];
}

// ========== 객차 ==========

export interface CarInfo {
  id: number;
  carNumber: string;
  carType: "STANDARD" | "FIRST_CLASS";
  totalSeats: number;
  remainingSeats: number;
  seatArrangement: string;
}

export interface CarSearchResponse {
  recommendedCarNumber: string;
  totalCarCount: number;
  trainClassificationCode: string;
  trainNumber: string;
  carInfos: CarInfo[];
}

export interface CarSearchRequest {
  trainScheduleId: number;
  departureStationId: number;
  arrivalStationId: number;
  passengerCount: number;
}

// ========== 좌석 ==========

export interface SeatDetail {
  seatId: number;
  seatNumber: string;
  isAvailable: boolean;
  seatDirection: "FORWARD" | "BACKWARD";
  seatType: "WINDOW" | "AISLE";
  remarks: string;
}

export interface SeatSearchResponse {
  carNumber: string;
  carType: string;
  totalSeatCount: number;
  remainingSeatCount: number;
  layoutType: number;
  seatList: SeatDetail[];
}

export interface SeatSearchRequest {
  trainCarId: string;
  trainScheduleId: number;
  departureStationId: number;
  arrivalStationId: number;
}
