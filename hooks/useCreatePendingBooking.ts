import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { stationUtils } from "@/constants/stations";
import { createPendingBooking } from "@/lib/api/pendingBookings";
import { handleError } from "@/lib/utils/errorHandler";
import { toPassengerTypes } from "@/lib/utils/pendingBooking";
import { PENDING_BOOKINGS_QUERY_KEY } from "@/hooks/usePendingBooking";
import { useToast } from "@/hooks/useToast";
import { useAuthStore } from "@/stores/auth-store";
import type { PassengerCounts } from "@/types/passengerType";
import type { TrainSchedule } from "@/types/trainType";

interface PendingBookingDraft {
  train: TrainSchedule;
  departureStation: string;
  arrivalStation: string;
  passengerCounts: PassengerCounts;
  seatIds: number[];
}

/**
 * 대기 예약 생성 — 로그인 확인(토큰이 없으면 재발급을 한 번 시도) → 요청 → 대기 예약 목록 갱신 → 예약 목록으로 이동.
 * onCreated는 이동 전에 호출된다(예매 패널 정리).
 */
export const useCreatePendingBooking = (onCreated: () => void) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const initializeAuth = useAuthStore((state) => state.initialize);

  const notify = (description: string) => {
    toast({ title: "오류", description, variant: "destructive" });
  };

  return async ({
    train,
    departureStation,
    arrivalStation,
    passengerCounts,
    seatIds,
  }: PendingBookingDraft) => {
    if (!useAuthStore.getState().hasValidToken()) {
      await initializeAuth();
    }

    if (!useAuthStore.getState().hasValidToken()) {
      const currentPath =
        typeof window !== "undefined"
          ? window.location.pathname + window.location.search
          : "/ticket/search";
      router.push(`/login?redirectTo=${encodeURIComponent(currentPath)}`);
      return;
    }

    const departureStationId = stationUtils.getStationId(departureStation);
    const arrivalStationId = stationUtils.getStationId(arrivalStation);
    if (!departureStationId || !arrivalStationId) {
      notify("역 정보를 찾을 수 없습니다.");
      return;
    }

    if (seatIds.length === 0) {
      notify("선택된 좌석 정보를 찾을 수 없습니다.");
      return;
    }

    if (!train.trainScheduleId) {
      notify("열차 스케줄 정보를 찾을 수 없습니다.");
      return;
    }

    try {
      await createPendingBooking({
        trainScheduleId: train.trainScheduleId,
        departureStationId,
        arrivalStationId,
        passengerTypes: toPassengerTypes(passengerCounts),
        seatIds,
      });
      onCreated();
      queryClient.invalidateQueries({ queryKey: PENDING_BOOKINGS_QUERY_KEY });
      router.push("/ticket/reservations");
    } catch (e: unknown) {
      notify(handleError(e, "예약 요청 중 오류가 발생했습니다."));
    }
  };
};
