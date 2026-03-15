import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type {
  PendingBookingRequest,
  PendingBookingResponse,
  PendingBookingInfo,
  PendingBookingListResponse,
} from "@/types/bookingType";

export const usePostPendingBooking = () => {
  return useMutation<PendingBookingResponse, Error, PendingBookingRequest>({
    mutationFn: async (
      params: PendingBookingRequest
    ): Promise<PendingBookingResponse> => {
      const response = await api.post<PendingBookingResponse["result"]>(
        "/api/v1/pending-bookings",
        params
      );

      return {
        message: response.message ?? "대기 예약이 생성되었습니다.",
        result: response.result,
      };
    },
  });
};

export const useGetPendingBookingList = () => {
  return useQuery<PendingBookingListResponse, Error>({
    queryKey: ["pendingBookings"],
    queryFn: async (): Promise<PendingBookingListResponse> => {
      const response = await api.get<PendingBookingInfo[]>(
        "/api/v1/pending-bookings"
      );

      return {
        message: response.message ?? "대기 예약 목록 조회에 성공했습니다.",
        result: response.result ?? [],
      }
    },
  });
};
