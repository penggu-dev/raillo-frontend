import { api, requireResult } from "../api";
import type {
  TicketResponse,
  TicketReceiptResponse,
} from "@/types/bookingType";

export type BookingStatus = "UPCOMING" | "HISTORY" | "ALL";

// 승차권 조회 함수
export const getTickets = async (
  status: BookingStatus = "ALL",
): Promise<TicketResponse["result"]> => {
  const response = await api.get<TicketResponse["result"]>("/api/v1/bookings", {
    status,
  });
  return response.result ?? [];
};

// 예매 상세 조회 함수
export const getBookingDetail = async (
  bookingId: number,
): Promise<TicketResponse["result"][number]> => {
  const response = await api.get<TicketResponse["result"][number]>(
    `/api/v1/bookings/${bookingId}`,
  );
  return requireResult(response.result, "예매 상세 조회에 실패했습니다.");
};

// 승차권 영수증 상세 조회 함수
export const getTicketReceipt = async (
  ticketId: number,
): Promise<TicketReceiptResponse["result"]> => {
  const response = await api.get<TicketReceiptResponse["result"]>(
    `/api/v1/booking/ticket/receipt/${ticketId}`,
  );
  return requireResult(response.result, "승차권 영수증 조회에 실패했습니다.");
};
