import { api } from "../api";
import type {
  PendingBookingCartItem,
  PendingBookingRequest,
  PendingBookingResponse,
  DeletePendingBookingsRequest,
  DeletePendingBookingsResponse,
} from "@/types/bookingType";

// 대기 예약 생성 함수
export const createPendingBooking = async (
  request: PendingBookingRequest,
): Promise<PendingBookingResponse> => {
  const response = await api.post<PendingBookingResponse["result"]>(
    "/api/v1/pending-bookings",
    request,
  );
  return {
    message: response.message ?? "대기 예약이 생성되었습니다.",
    result: response.result,
  };
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
