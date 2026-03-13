import { api } from "../api";
import type {
  ReservationRequest,
  ReservationResponse,
  ReservationDetailResponse,
  TicketResponse,
  TicketReceiptResponse,
  AddToCartRequest,
  AddToCartResponse,
  PendingBookingCartItem,
  CartResponse,
  DeletePendingBookingsRequest,
  DeletePendingBookingsResponse,
} from "@/types/bookingType";

// 예약 요청 함수
export const makeReservation = async (request: ReservationRequest) => {
  return api.post<ReservationResponse>("/api/v1/booking/reservation", request);
};

// 예약 정보 조회 함수
export const getReservationDetail = async (reservationId: number) => {
  return api.get<ReservationDetailResponse>(
    `/api/v1/booking/reservation/${reservationId}`,
  );
};

// 예약 취소 함수 (대기 예약 ID 기반)
export const deleteReservation = async (pendingBookingId: string) => {
  return api.delete<DeletePendingBookingsResponse>("/api/v1/pending-bookings", {
    pendingBookingIds: [pendingBookingId],
  });
};

// 장바구니에 예약 추가 함수
export const addToCart = async (request: AddToCartRequest) => {
  return api.post<AddToCartResponse>("/api/v1/cart/reservations", request);
};

// 장바구니 조회 함수
export const getCart = async () => {
  return api.get<CartResponse["result"]>("/api/v1/pending-bookings");
};

export const deletePendingBookings = async (pendingBookingIds: string[]) => {
  const request: DeletePendingBookingsRequest = {
    pendingBookingIds,
  };
  return api.delete<DeletePendingBookingsResponse>(
    "/api/v1/pending-bookings",
    request,
  );
};

// 예약 목록 조회 함수
export const getReservationList = async () => {
  return api.get<PendingBookingCartItem[]>("/api/v1/pending-bookings");
};

// 단일 예약 조회 함수
export const getReservation = async (reservationId: number) => {
  return api.get<ReservationDetailResponse>(
    `/api/v1/booking/reservation/${reservationId}`,
  );
};

// 승차권 조회 함수
export const getTickets = async () => {
  return api.get<TicketResponse["result"]>("/api/v1/bookings");
};

// 예매 상세 조회 함수
export const getBookingDetail = async (bookingId: number) => {
  return api.get<TicketResponse["result"][number]>(
    `/api/v1/bookings/${bookingId}`,
  );
};

// 승차권 영수증 상세 조회 함수
export const getTicketReceipt = async (ticketId: number) => {
  return api.get<TicketReceiptResponse["result"]>(
    `/api/v1/booking/ticket/receipt/${ticketId}`,
  );
};
