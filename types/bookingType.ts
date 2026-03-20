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

export interface DeletePendingBookingsRequest {
  pendingBookingIds: string[];
}

// ========== 대기 예약 (usePendingBooking) ==========

export interface PendingBookingRequest {
  trainScheduleId: number;
  departureStationId: number;
  arrivalStationId: number;
  passengerTypes: string[];
  seatIds: number[];
}
