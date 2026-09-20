import { act, renderHook, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import type { CarInfo, SeatDetail } from "@/types/trainType"
import { searchCars, searchSeats } from "@/lib/api/trains"
import { useSeatInventory } from "./useSeatInventory"

vi.mock("@/lib/api/trains", () => ({ searchCars: vi.fn(), searchSeats: vi.fn() }))

const toast = vi.hoisted(() => vi.fn())
vi.mock("@/hooks/useToast", () => ({ useToast: () => ({ toast }) }))

const searchCarsMock = vi.mocked(searchCars)
const searchSeatsMock = vi.mocked(searchSeats)

const car = (carNumber: string): CarInfo => ({
  id: Number(carNumber),
  carNumber,
  carType: "STANDARD",
  totalSeats: 40,
  remainingSeats: 20,
  seatArrangement: "2+2",
})
const seat = (seatNumber: string): SeatDetail => ({
  seatId: seatNumber.charCodeAt(1),
  seatNumber,
  isAvailable: true,
  seatDirection: "FORWARD",
  seatType: "AISLE",
  remarks: "",
})

/** 나중에 원하는 시점에 응답을 주는 약속 */
const deferred = <T,>() => {
  let resolve!: (value: T) => void
  let reject!: (error: unknown) => void
  const promise = new Promise<T>((res, rej) => {
    resolve = res
    reject = rej
  })
  return { promise, resolve, reject }
}

const renderInventory = () =>
  renderHook(() =>
    useSeatInventory({ departureStation: "서울", arrivalStation: "부산", passengerCount: 1 }),
  )

beforeEach(() => {
  vi.clearAllMocks()
})

describe("useSeatInventory 늦은 응답 처리", () => {
  it("객차 조회 중 다시 조회하면 먼저 보낸 응답은 버린다", async () => {
    const first = deferred<{ carInfos: CarInfo[] }>()
    const second = deferred<{ carInfos: CarInfo[] }>()
    searchCarsMock.mockReturnValueOnce(first.promise as never).mockReturnValueOnce(second.promise as never)

    const { result } = renderInventory()
    act(() => void result.current.fetchCars(1))
    act(() => void result.current.fetchCars(2))

    // 두 번째(최신) 응답이 먼저 도착하고, 첫 번째가 뒤늦게 도착한다
    await act(async () => {
      second.resolve({ carInfos: [car("4")] })
      await second.promise
    })
    await act(async () => {
      first.resolve({ carInfos: [car("2")] })
      await first.promise
    })

    expect(result.current.carList.map((c) => c.carNumber)).toEqual(["4"])
    expect(result.current.loadingCars).toBe(false)
  })

  it("늦게 도착한 실패는 현재 목록을 비우지 않는다", async () => {
    const first = deferred<{ carInfos: CarInfo[] }>()
    const second = deferred<{ carInfos: CarInfo[] }>()
    searchCarsMock.mockReturnValueOnce(first.promise as never).mockReturnValueOnce(second.promise as never)

    const { result } = renderInventory()
    act(() => void result.current.fetchCars(1))
    act(() => void result.current.fetchCars(2))

    await act(async () => {
      second.resolve({ carInfos: [car("4")] })
      await second.promise
    })
    await act(async () => {
      first.reject(new Error("mock"))
      await first.promise.catch(() => {})
    })

    expect(result.current.carList.map((c) => c.carNumber)).toEqual(["4"])
    expect(toast).not.toHaveBeenCalled()
  })

  it("좌석 조회도 마지막 요청의 응답만 반영한다", async () => {
    const first = deferred<{ seatList: SeatDetail[] }>()
    const second = deferred<{ seatList: SeatDetail[] }>()
    searchSeatsMock.mockReturnValueOnce(first.promise as never).mockReturnValueOnce(second.promise as never)

    const { result } = renderInventory()
    act(() => void result.current.fetchSeats("2", 1))
    act(() => void result.current.fetchSeats("4", 1))

    await act(async () => {
      second.resolve({ seatList: [seat("1B")] })
      await second.promise
    })
    await act(async () => {
      first.resolve({ seatList: [seat("1A")] })
      await first.promise
    })

    expect(result.current.seatList.map((s) => s.seatNumber)).toEqual(["1B"])
  })

  it("reset 뒤에 도착한 응답은 목록을 다시 채우지 않는다", async () => {
    const pending = deferred<{ carInfos: CarInfo[] }>()
    searchCarsMock.mockReturnValueOnce(pending.promise as never)

    const { result } = renderInventory()
    act(() => void result.current.fetchCars(1))
    act(() => result.current.reset())

    await act(async () => {
      pending.resolve({ carInfos: [car("2")] })
      await pending.promise
    })

    expect(result.current.carList).toEqual([])
    expect(result.current.loadingCars).toBe(false)
  })

  it("정상 조회는 목록을 채우고 실패는 알린다", async () => {
    searchCarsMock.mockResolvedValueOnce({ carInfos: [car("3")] } as never)
    searchSeatsMock.mockRejectedValueOnce(new Error("mock"))

    const { result } = renderInventory()
    await act(async () => {
      await result.current.fetchCars(1)
    })
    expect(result.current.carList.map((c) => c.carNumber)).toEqual(["3"])

    await act(async () => {
      await result.current.fetchSeats("3", 1)
    })
    await waitFor(() => expect(result.current.seatList).toEqual([]))
    // 오류 메시지가 있으면 그대로 쓰고, 없을 때만 기본 문구를 쓴다(기존 동작)
    expect(toast).toHaveBeenCalledWith({ title: "오류", description: "mock", variant: "destructive" })
  })
})
