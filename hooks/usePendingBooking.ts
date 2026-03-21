import { useQuery } from "@tanstack/react-query";
import { getReservationList } from "@/lib/api/pendingBookings";
import type { PendingBookingCartItem } from "@/types/bookingType";

export const PENDING_BOOKINGS_QUERY_KEY = ["pendingBookings"] as const;

export const useGetPendingBookingList = () => {
  return useQuery<PendingBookingCartItem[], Error>({
    queryKey: PENDING_BOOKINGS_QUERY_KEY,
    queryFn: () => getReservationList(),
    staleTime: 30 * 1000, // 30초 — 헤더 버튼 재진입 시 캐시 사용
  });
};
