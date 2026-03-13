// ========== 역 ==========

export interface Station {
  id: number;
  name: string;
}

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

export interface PageInfo {
  currentPage: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface TrainSearchResponse {
  content: TrainSchedule[];
  currentPage: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
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
