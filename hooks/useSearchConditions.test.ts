import { act, renderHook } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { useSearchConditions } from "./useSearchConditions"

const navigation = vi.hoisted(() => ({
  replace: vi.fn(),
  params: new URLSearchParams(),
}))

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: navigation.replace, push: vi.fn() }),
  useSearchParams: () => navigation.params,
}))

// 마지막 URL 갱신의 쿼리
const lastQuery = () => new URLSearchParams(String(navigation.replace.mock.calls.at(-1)?.[0]).split("?")[1])

beforeEach(() => {
  navigation.replace.mockReset()
  navigation.params = new URLSearchParams("departure=서울&arrival=부산&date=2099-12-31&hour=09&adult=1&child=2")
})

describe("useSearchConditions", () => {
  it("URL에서 조건을 읽고 조회 요청을 만든다", () => {
    const { result } = renderHook(() => useSearchConditions())

    expect(result.current.totalPassengers).toBe(3)
    expect(result.current.hasConditions).toBe(true)
    expect(result.current.buildSearchRequest()).toEqual({
      departureStationId: 2,
      arrivalStationId: 18,
      operationDate: "2099-12-31",
      passengerCount: 3,
      departureHour: "09",
    })
  })

  it("역 이름을 찾지 못하면 조회 요청을 만들지 않는다", () => {
    navigation.params = new URLSearchParams("departure=없는역&arrival=부산&date=2099-12-31")
    const { result } = renderHook(() => useSearchConditions())

    expect(result.current.buildSearchRequest()).toBeNull()
  })

  it("출발역을 도착역과 같게 고르면 두 역을 맞바꾸고 조건 변경으로 표시한다", () => {
    const { result } = renderHook(() => useSearchConditions())
    expect(result.current.conditionsChanged).toBe(false)

    act(() => result.current.changeDepartureStation("부산"))

    expect(lastQuery().get("departure")).toBe("부산")
    expect(lastQuery().get("arrival")).toBe("서울")
    expect(result.current.conditionsChanged).toBe(true)

    act(() => result.current.markSearched())
    expect(result.current.conditionsChanged).toBe(false)
  })

  it("승객 수를 바꾸면 0명인 유형은 URL에서 뺀다", () => {
    const { result } = renderHook(() => useSearchConditions())

    act(() => result.current.changePassengers({ adult: 2, child: 0, infant: 0, senior: 1, severelydisabled: 0, mildlydisabled: 0, veteran: 0 }))

    expect(lastQuery().get("adult")).toBe("2")
    expect(lastQuery().get("senior")).toBe("1")
    expect(lastQuery().has("child")).toBe(false)
    expect(lastQuery().get("departure")).toBe("서울")
  })

  it("날짜를 바꾸면 날짜와 시각을 함께 URL에 반영한다", () => {
    const { result } = renderHook(() => useSearchConditions())

    act(() => result.current.changeDate(new Date(2099, 0, 5, 7)))

    expect(lastQuery().get("date")).toBe("2099-01-05")
    expect(lastQuery().get("hour")).toBe("07")
  })
})

describe("useSearchConditions 승객 수 정규화", () => {
  it.each([
    ["소수", "adult=1.5", 0],
    ["음수", "adult=-1", 0],
    ["숫자가 아님", "adult=two", 0],
    ["빈 값", "adult=", 0],
    ["정수", "adult=3", 3],
  ])("%s 승객 수는 %s → %i명", (_, query, expected) => {
    navigation.params = new URLSearchParams(`departure=서울&arrival=부산&date=2099-12-31&hour=09&${query}`)

    const { result } = renderHook(() => useSearchConditions())

    expect(result.current.passengerCounts.adult).toBe(expected)
    expect(result.current.totalPassengers).toBe(expected)
  })
})
