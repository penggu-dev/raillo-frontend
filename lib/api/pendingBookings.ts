import { api, requireResult } from "../api";
import type {
  PendingBookingCartItem,
  PendingBookingRequest,
  DeletePendingBookingsRequest,
} from "@/types/bookingType";

// 대기 예약 생성 함수
export const createPendingBooking = async (
  request: PendingBookingRequest,
): Promise<{ pendingBookingId: string }> => {
  const response = await api.post<{ pendingBookingId: string }>(
    "/api/v1/pending-bookings",
    request,
  );
  return requireResult(response.result, "대기 예약 생성에 실패했습니다.");
};

export const deletePendingBookings = async (
  pendingBookingIds: string[],
): Promise<void> => {
  const request: DeletePendingBookingsRequest = {
    pendingBookingIds,
  };
  await api.delete("/api/v1/pending-bookings", request);
};

// 예약 목록 조회 함수
export const getReservationList = async (): Promise<
  PendingBookingCartItem[]
> => {
  const response = await api.get<PendingBookingCartItem[]>(
    "/api/v1/pending-bookings",
  );
  return response.result ?? [];
};
