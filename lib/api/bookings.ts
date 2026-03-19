import { api } from "../api";
import type {
  TicketResponse,
  TicketReceiptResponse,
} from "@/types/bookingType";

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
