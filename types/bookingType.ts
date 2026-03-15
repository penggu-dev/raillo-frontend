// ========== 예약 ==========

export interface ReservationRequest {
  trainScheduleId: number;
  departureStationId: number;
  arrivalStationId: number;
  passengers: {
    passengerType:
      | "ADULT"
      | "CHILD"
      | "INFANT"
      | "SENIOR"
      | "DISABLED_HEAVY"
      | "DISABLED_LIGHT"
      | "VETERAN";
    count: number;
  }[];
  seatIds: number[];
  tripType: "OW";
}

export interface ReservationResponse {
  reservationId: number;
  seatReservationIds: number[];
}

export interface ReservationDetailResponse {
  reservationId: number;
  reservationCode: string;
  trainNumber: string;
  trainName: string;
  departureStationName: string;
  arrivalStationName: string;
  departureTime: string;
  arrivalTime: string;
  operationDate: string;
  expiresAt: string;
  fare: number;
  seats: {
    seatReservationId: number;
    passengerType: string;
    carNumber: number;
    carType: string;
    seatNumber: string;
  }[];
}

// ========== 승차권 ==========

export interface TicketResponse {
  message: string;
  result: {
    bookingId: number;
    bookingCode: string;
    trainNumber: string;
    trainName: string;
    departureStationName: string;
    arrivalStationName: string;
    departureTime: string;
    arrivalTime: string;
    operationDate: string;
    tickets: {
      ticketId: number;
      ticketNumber: string;
      status: string;
      passengerType: string;
      carNumber: number;
      carType: string;
      seatNumber: string;
    }[];
  }[];
}

export interface TicketReceiptResponse {
  message: string;
  result: {
    ticketNumber: string;
    ticketCreatedAt: string;
    trainNumber: string;
    carNumber: number;
    carType: string;
    seatNumber: string;
    operationDate: string;
    departureStationName: string;
    arrivalStationName: string;
    departureTime: string;
    arrivalTime: string;
    passengerType: string;
    paymentMethod: string;
    paidAt: string;
    paymentKey: string;
    amount: number;
  };
}

// ========== 장바구니 ==========

export interface AddToCartRequest {
  reservationId: number;
}

export interface AddToCartResponse {
  message: string;
}

export interface PendingBookingCartItem {
  pendingBookingId: string;
  trainNumber: string;
  trainName: string;
  departureStationName: string;
  arrivalStationName: string;
  departureTime: string;
  arrivalTime: string;
  operationDate: string;
  totalFare?: number | null;
  seats: {
    seatId: number;
    passengerType: string;
    carNumber: number;
    carType: string;
    seatNumber: string;
  }[];
  reservationId?: number;
  reservationCode?: string;
  expiresAt?: string;
  fare?: number;
}

export interface CartResponse {
  message: string;
  result: PendingBookingCartItem[];
}

export interface DeletePendingBookingsRequest {
  pendingBookingIds: string[];
}

export interface DeletePendingBookingsResponse {
  message: string;
}

// ========== 대기 예약 (usePendingBooking) ==========

export interface PendingBookingRequest {
  trainScheduleId: number;
  departureStationId: number;
  arrivalStationId: number;
  passengerTypes: string[];
  seatIds: number[];
}

export interface PendingBookingResponse {
  message?: string;
  result?: {
    reservationId?: number;
    id?: number;
    pendingBookingId?: string;
    [key: string]: unknown;
  };
}

export interface PendingBookingSeat {
  seatId: number;
  passengerType: string;
  carNumber: number;
  carType: string;
  seatNumber: string;
}

export interface PendingBookingInfo {
  pendingBookingId: string;
  trainNumber: string;
  trainName: string;
  departureStationName: string;
  arrivalStationName: string;
  departureTime: string;
  arrivalTime: string;
  operationDate: string;
  seats: PendingBookingSeat[];
}

export interface PendingBookingListResponse {
  message: string;
  result: PendingBookingInfo[];
}
