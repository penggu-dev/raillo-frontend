import { act, renderHook } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import type { PendingBookingCartItem } from "@/types/bookingType"
import { isExpired, usePendingBookingSelection } from "./usePendingBookingSelection"

const hoursFromNow = (hours: number) => new Date(Date.now() + hours * 3600_000).toISOString()

const item = (
  id: string,
  { fare = 10000, expiresAt = hoursFromNow(1) }: { fare?: number; expiresAt?: string } = {},
): PendingBookingCartItem =>
  ({
    pendingBookingId: id,
    trainName: "KTX",
    trainNumber: "001",
    operationDate: "2026-09-24",
    departureStationName: "서울",
    arrivalStationName: "부산",
    departureTime: "05:13:00",
    arrivalTime: "07:50:00",
    totalFare: fare,
    expiresAt,
    seats: [{ carType: "STANDARD", seatNumber: "1A" }],
  }) as unknown as PendingBookingCartItem

describe("isExpired", () => {
  it("기한이 지난 예약만 만료로 본다", () => {
    expect(isExpired(hoursFromNow(-1))).toBe(true)
    expect(isExpired(hoursFromNow(1))).toBe(false)
    expect(isExpired(undefined)).toBe(false)
  })
})

describe("usePendingBookingSelection", () => {
  const reservations = [
    item("a", { fare: 10000 }),
    item("b", { fare: 25000 }),
    item("c", { fare: 30000, expiresAt: hoursFromNow(-1) }),
  ]

  it("고른 예약의 합계를 낸다", () => {
    const { result } = renderHook(() => usePendingBookingSelection(reservations))

    act(() => result.current.toggle("a"))
    act(() => result.current.toggle("b"))

    expect(result.current.selectedItems.map((r) => r.pendingBookingId)).toEqual(["a", "b"])
    expect(result.current.totalPrice).toBe(35000)
  })

  it("다시 누르면 선택을 해제한다", () => {
    const { result } = renderHook(() => usePendingBookingSelection(reservations))

    act(() => result.current.toggle("a"))
    act(() => result.current.toggle("a"))

    expect(result.current.selectedItems).toEqual([])
    expect(result.current.totalPrice).toBe(0)
  })

  it("전체 선택은 기한이 지난 예약을 빼고 고른다", () => {
    const { result } = renderHook(() => usePendingBookingSelection(reservations))

    act(() => result.current.toggleAll())

    expect(result.current.selectedItems.map((r) => r.pendingBookingId)).toEqual(["a", "b"])
    expect(result.current.allSelected).toBe(true)
    expect(result.current.validReservations).toHaveLength(2)
  })

  it("전체 선택 상태에서 다시 누르면 모두 해제한다", () => {
    const { result } = renderHook(() => usePendingBookingSelection(reservations))

    act(() => result.current.toggleAll())
    act(() => result.current.toggleAll())

    expect(result.current.selectedItems).toEqual([])
    expect(result.current.allSelected).toBe(false)
  })

  it("취소한 예약은 선택에서 뺀다", () => {
    const { result } = renderHook(() => usePendingBookingSelection(reservations))

    act(() => result.current.toggleAll())
    act(() => result.current.deselect("a"))

    expect(result.current.selectedItems.map((r) => r.pendingBookingId)).toEqual(["b"])
  })
})

describe("usePendingBookingSelection 기한 만료", () => {
  it("고른 뒤 기한이 지나면 선택·합계에서 빠진다", () => {
    const before = [item("a", { fare: 10000 }), item("b", { fare: 25000 })]
    const { result, rerender } = renderHook(
      ({ list }) => usePendingBookingSelection(list),
      { initialProps: { list: before } },
    )

    act(() => result.current.toggleAll())
    expect(result.current.totalPrice).toBe(35000)

    // 같은 예약이 만료된 상태로 다시 조회됐다
    rerender({ list: [item("a", { fare: 10000, expiresAt: hoursFromNow(-1) }), item("b", { fare: 25000 })] })

    expect(result.current.selectedItems.map((r) => r.pendingBookingId)).toEqual(["b"])
    expect(result.current.totalPrice).toBe(25000)
  })
})
