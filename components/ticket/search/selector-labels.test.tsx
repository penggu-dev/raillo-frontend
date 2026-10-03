import { render as rtlRender, screen } from "@testing-library/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import type { ReactElement } from "react"
import { describe, expect, it, vi } from "vitest"
import type { PassengerCounts } from "@/types/passengerType"
import { DateTimeSelector } from "./date-time-selector"
import { PassengerSelector } from "./passenger-selector"
import { SearchForm } from "./search-form"
import { StationSelector } from "./station-selector"

// 출발일 선택기가 운행 달력을 조회한다 — 이 테스트는 버튼 이름만 본다
vi.mock("@/lib/api/trains", () => ({ getCalendar: vi.fn(async () => []) }))

const render = (ui: ReactElement) =>
  rtlRender(<QueryClientProvider client={new QueryClient()}>{ui}</QueryClientProvider>)

const counts = (partial: Partial<PassengerCounts>): PassengerCounts => ({
  adult: 0, child: 0, infant: 0, senior: 0, severelydisabled: 0, mildlydisabled: 0, veteran: 0, ...partial,
})

// 라벨이 가리키는 것이 입력이 아니라 대화상자를 여는 버튼 — 버튼 이름이 "라벨 + 현재 값"이어야 한다
describe("열차 조회 선택기 버튼 이름", () => {
  it("역: 출발역·도착역을 구분해 읽는다", () => {
    render(
      <>
        <StationSelector value="서울" onValueChange={vi.fn()} placeholder="출발역 선택" label="출발역" />
        <StationSelector value="" onValueChange={vi.fn()} placeholder="도착역 선택" label="도착역" />
      </>,
    )

    expect(screen.getByRole("button", { name: "출발역 서울" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "도착역 도착역 선택" })).toBeInTheDocument()
  })

  it("출발일: 라벨과 고른 날짜를 함께 읽는다", () => {
    render(<DateTimeSelector value={new Date(2099, 11, 31, 9)} onValueChange={vi.fn()} placeholder="날짜 선택" label="출발일" />)

    expect(screen.getByRole("button", { name: "출발일 12/31 09시" })).toBeInTheDocument()
  })

  it("인원: 현재 인원이 이름에서 빠지지 않는다", () => {
    render(<PassengerSelector value={counts({ adult: 1 })} onValueChange={vi.fn()} placeholder="인원 선택" label="인원" />)

    expect(screen.getByRole("button", { name: "인원 총 1명" })).toBeInTheDocument()
  })

  it("조회 결과 검색 조건: 라벨이 보이지 않아도 버튼 이름에는 들어간다", () => {
    render(
      <SearchForm
        departureStation="서울"
        arrivalStation="부산"
        date={new Date(2099, 11, 31, 9)}
        passengerCounts={counts({ adult: 1 })}
        searchConditionsChanged={false}
        onDepartureStationChange={vi.fn()}
        onArrivalStationChange={vi.fn()}
        onDateChange={vi.fn()}
        onPassengerChange={vi.fn()}
        onSearch={vi.fn()}
      />,
    )

    expect(screen.getByRole("button", { name: "출발역 서울" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "도착역 부산" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "출발일 12/31 09시" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "인원 총 1명" })).toBeInTheDocument()
  })
})
