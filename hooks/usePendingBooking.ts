import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type {
  PendingBookingInfo,
  PendingBookingListResponse,
} from "@/types/bookingType";

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
      };
    },
  });
};
