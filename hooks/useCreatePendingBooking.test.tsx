import type { ReactNode } from "react"
import { renderHook } from "@testing-library/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { beforeEach, describe, expect, it, vi } from "vitest"
import type { PassengerCounts } from "@/types/passengerType"
import type { TrainSchedule } from "@/types/trainType"
import { createPendingBooking } from "@/lib/api/pendingBookings"
import { useCreatePendingBooking } from "./useCreatePendingBooking"

const navigation = vi.hoisted(() => ({ push: vi.fn() }))
vi.mock("next/navigation", () => ({ useRouter: () => navigation }))

vi.mock("@/lib/api/pendingBookings", () => ({ createPendingBooking: vi.fn() }))

const toast = vi.hoisted(() => vi.fn())
vi.mock("@/hooks/useToast", () => ({ useToast: () => ({ toast }) }))

// 로그인 확인은 이 테스트 범위 밖 — 유효한 토큰이 있는 상태로 둔다
vi.mock("@/stores/auth-store", () => ({
  useAuthStore: Object.assign(
    (selector: (s: { initialize: () => Promise<void> }) => unknown) => selector({ initialize: async () => {} }),
    { getState: () => ({ hasValidToken: () => true }) },
  ),
}))

const createPendingBookingMock = vi.mocked(createPendingBooking)

const train = { trainScheduleId: 7, trainNumber: "001", trainName: "KTX" } as TrainSchedule
const counts = (adult: number, child = 0): PassengerCounts => ({
  adult,
  child,
  infant: 0,
  senior: 0,
  severelydisabled: 0,
  mildlydisabled: 0,
  veteran: 0,
})

const wrapper = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider client={new QueryClient()}>{children}</QueryClientProvider>
)

const runBooking = async (passengerCounts: PassengerCounts, seatIds: number[]) => {
  const onCreated = vi.fn()
  const { result } = renderHook(() => useCreatePendingBooking(onCreated), { wrapper })
  await result.current({
    train,
    departureStation: "서울",
    arrivalStation: "부산",
    passengerCounts,
    seatIds,
  })
  return { onCreated }
}

beforeEach(() => {
  vi.clearAllMocks()
  createPendingBookingMock.mockResolvedValue(undefined as never)
})

describe("useCreatePendingBooking 좌석 수 검증", () => {
  it("좌석 수와 승객 수가 같으면 요청한다", async () => {
    const { onCreated } = await runBooking(counts(1, 1), [11, 12])

    expect(createPendingBookingMock).toHaveBeenCalledWith(
      expect.objectContaining({ passengerTypes: ["ADULT", "CHILD"], seatIds: [11, 12] }),
    )
    expect(onCreated).toHaveBeenCalled()
    expect(navigation.push).toHaveBeenCalledWith("/ticket/reservations")
  })

  it("좌석 일부가 빠져 승객 수와 다르면 요청하지 않고 안내한다", async () => {
    const { onCreated } = await runBooking(counts(2), [11])

    expect(createPendingBookingMock).not.toHaveBeenCalled()
    expect(onCreated).not.toHaveBeenCalled()
    expect(navigation.push).not.toHaveBeenCalled()
    expect(toast).toHaveBeenCalledWith(
      expect.objectContaining({ description: "승객 2명에 좌석 1개가 선택됐습니다. 좌석을 다시 선택해주세요." }),
    )
  })

  it("좌석이 하나도 없으면 기존 안내를 그대로 쓴다", async () => {
    await runBooking(counts(1), [])

    expect(createPendingBookingMock).not.toHaveBeenCalled()
    expect(toast).toHaveBeenCalledWith(
      expect.objectContaining({ description: "선택된 좌석 정보를 찾을 수 없습니다." }),
    )
  })
})
