import { act, render, screen, waitFor } from "@testing-library/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import type { CarInfo, SeatDetail, SeatInfo, TrainSchedule, TrainSearchResponse } from "@/types/trainType"
import { searchCars, searchSeats, searchTrains } from "@/lib/api/trains"
import { createPendingBooking } from "@/lib/api/pendingBookings"
import { useAuthStore } from "@/stores/auth-store"
import TrainSearchPage from "./page"

// 오늘 이후 날짜여야 다시 조회가 허용된다
const DEFAULT_QUERY = "departure=서울&arrival=부산&date=2099-12-31&hour=00&adult=1"
const navigation = vi.hoisted(() => ({
  router: { push: vi.fn(), replace: vi.fn() },
  params: new URLSearchParams(),
}))

vi.mock("next/navigation", () => ({
  useRouter: () => navigation.router,
  useSearchParams: () => navigation.params,
}))

vi.mock("@/lib/api/trains", () => ({
  searchTrains: vi.fn(),
  searchCars: vi.fn(),
  searchSeats: vi.fn(),
}))

// 조회 흐름과 무관한 하위 영역 — 다시 조회 버튼만 남긴다
vi.mock("@/components/ticket/search/search-form", () => ({
  SearchForm: ({ onSearch }: { onSearch: () => void }) => (
    <button type="button" onClick={onSearch}>
      조회
    </button>
  ),
}))
// 좌석 선택 다이얼로그 모듈을 불러온 횟수 — clearAllMocks에 초기화되지 않도록 숫자로 센다
const seatDialogModule = vi.hoisted(() => ({ imports: 0 }))
// 예매 흐름용: 좌석 다이얼로그는 열리면 3호차 좌석을 조회하고 "적용 확인"으로 dialogApply.seats를 적용,
// 예매 패널은 열려 있을 때 적용된 좌석과 "좌석 고르기"·"예매하기"만 보여 준다
const dialogApply = vi.hoisted(() => ({ seats: [] as string[] }))
vi.mock("@/components/ticket/search/seat-selection-dialog", async () => {
  seatDialogModule.imports += 1
  const { useEffect } = await import("react")
  return {
    SeatSelectionDialog: ({ isOpen, onApply, onCarSelect }: { isOpen: boolean; onApply: (seats: string[], car: number) => void; onCarSelect: (carId: string) => void }) => {
      useEffect(() => {
        if (isOpen) onCarSelect("13")
      }, [isOpen]) // eslint-disable-line react-hooks/exhaustive-deps
      return isOpen ? (
        <button type="button" onClick={() => onApply(dialogApply.seats, 3)}>
          적용 확인
        </button>
      ) : null
    },
  }
})
vi.mock("@/components/ticket/search/booking-panel", () => ({
  BookingPanel: ({ isOpen, selectedSeats, onSeatSelection, onBooking }: { isOpen: boolean; selectedSeats: string[]; onSeatSelection: () => void; onBooking: () => void }) =>
    isOpen ? (
      <div>
        <span>적용 좌석:{selectedSeats.join(",")}</span>
        <button type="button" onClick={onSeatSelection}>좌석 고르기</button>
        <button type="button" onClick={onBooking}>예매하기</button>
      </div>
    ) : null,
}))
vi.mock("@/lib/api/pendingBookings", () => ({
  createPendingBooking: vi.fn(),
  getReservationList: vi.fn(),
  deletePendingBookings: vi.fn(),
}))
vi.mock("@/components/common/usage-info", () => ({ UsageInfo: () => null }))

const searchTrainsMock = vi.mocked(searchTrains)
const searchCarsMock = vi.mocked(searchCars)
const searchSeatsMock = vi.mocked(searchSeats)
const createPendingBookingMock = vi.mocked(createPendingBooking)

const seat: SeatInfo = {
  availableSeats: 10,
  totalSeats: 40,
  fare: 59800,
  status: "AVAILABLE",
  canReserve: true,
  displayText: "일반실",
}

const train = (id: number, label: string): TrainSchedule => ({
  trainScheduleId: id,
  trainNumber: label,
  trainName: "KTX",
  departureStationName: "서울",
  arrivalStationName: "부산",
  departureTime: "05:00:00",
  arrivalTime: "07:30:00",
  travelTime: "PT2H30M",
  standardSeat: seat,
  firstClassSeat: seat,
  standing: null,
  formattedTravelTime: "2시간 30분",
  expressTrain: true,
})

/** prefix+번호 열차를 from부터 count개 담은 Slice 페이지 */
const slicePage = (prefix: string, page: number, from: number, count: number, hasNext: boolean): TrainSearchResponse => ({
  content: Array.from({ length: count }, (_, i) => train(from + i, `${prefix}${String(from + i).padStart(3, "0")}`)),
  currentPage: page,
  pageSize: 20,
  numberOfElements: count,
  hasNext,
  hasPrevious: page > 0,
  first: page === 0,
  last: !hasNext,
})

const deferred = <T,>() => {
  let resolve!: (value: T) => void
  const promise = new Promise<T>((r) => (resolve = r))
  return { promise, resolve }
}

const renderPage = (client = new QueryClient()) =>
  render(
    <QueryClientProvider client={client}>
      <TrainSearchPage />
    </QueryClientProvider>,
  )

const cardLabels = () => screen.queryAllByText(/^[TN]\d{3}$/).map((el) => el.textContent)
const moreButton = () => screen.queryByRole("button", { name: "더보기" })
const requestedPages = () => searchTrainsMock.mock.calls.map(([, pageRequest]) => pageRequest?.page)
const skeleton = () => screen.queryAllByText(/열차를 조회하는 중/)

beforeEach(() => {
  searchTrainsMock.mockReset()
  navigation.params = new URLSearchParams(DEFAULT_QUERY)
  useAuthStore.setState({ accessToken: null, tokenExpiresIn: null, isAuthenticated: false, initialize: vi.fn(async () => {}) })
})

afterEach(() => {
  vi.clearAllMocks()
})

describe("열차 조회 더보기", () => {
  it("다음 페이지를 차례로 요청하고 마지막 페이지에서 멈춘다", async () => {
    // 53편 = 20 · 20 · 13
    const pages = [slicePage("T", 0, 0, 20, true), slicePage("T", 1, 20, 20, true), slicePage("T", 2, 40, 13, false)]
    searchTrainsMock.mockImplementation(async (_request, pageRequest) => pages[pageRequest?.page ?? 0])

    renderPage()
    await screen.findByText("T000")
    expect(cardLabels()).toHaveLength(20)

    act(() => moreButton()!.click())
    await waitFor(() => expect(cardLabels()).toHaveLength(40))

    act(() => moreButton()!.click())
    await waitFor(() => expect(cardLabels()).toHaveLength(53))

    expect(requestedPages()).toEqual([0, 1, 2])
    expect(new Set(cardLabels()).size).toBe(53)
    expect(moreButton()).toBeNull()
  })

  it("응답 전에 더보기를 연달아 눌러도 요청은 한 번만 보낸다", async () => {
    const second = deferred<TrainSearchResponse>()
    searchTrainsMock
      .mockResolvedValueOnce(slicePage("T", 0, 0, 20, true))
      .mockReturnValueOnce(second.promise)

    renderPage()
    await screen.findByText("T000")

    // 비활성화가 렌더되기 전에 두 번 클릭
    act(() => {
      const button = moreButton()!
      button.click()
      button.click()
    })
    expect(requestedPages()).toEqual([0, 1])

    await act(async () => second.resolve(slicePage("T", 1, 20, 20, false)))
    await waitFor(() => expect(cardLabels()).toHaveLength(40))
    expect(new Set(cardLabels()).size).toBe(40)
    expect(requestedPages()).toEqual([0, 1])
  })

  it("다시 조회한 뒤 도착한 이전 조건의 더보기 응답은 붙이지 않는다", async () => {
    const stale = deferred<TrainSearchResponse>()
    searchTrainsMock
      .mockResolvedValueOnce(slicePage("T", 0, 0, 20, true))
      .mockReturnValueOnce(stale.promise)
      .mockResolvedValueOnce(slicePage("N", 0, 100, 20, true))
      .mockResolvedValueOnce(slicePage("N", 1, 120, 20, false))

    renderPage()
    await screen.findByText("T000")

    act(() => moreButton()!.click())
    // 조회 상태 반영은 비동기 — 로딩 표시가 뜰 때까지 기다린다
    expect(await screen.findByRole("button", { name: "로딩 중..." })).toBeDisabled()

    act(() => screen.getByRole("button", { name: "조회" }).click())
    await screen.findByText("N100")

    // 다시 조회하면 진행 중이던 더보기 요청은 취소된다
    expect(searchTrainsMock.mock.calls[1][1]?.signal?.aborted).toBe(true)

    // 이전 조건의 2페이지가 뒤늦게 도착
    await act(async () => stale.resolve(slicePage("T", 1, 20, 20, true)))
    expect(cardLabels()).toHaveLength(20)
    expect(cardLabels().every((label) => label?.startsWith("N"))).toBe(true)

    // 새 조건의 더보기는 바로 쓸 수 있고 1페이지부터 이어서 요청한다
    expect(moreButton()).toBeEnabled()
    act(() => moreButton()!.click())
    await waitFor(() => expect(cardLabels()).toHaveLength(40))
    expect(requestedPages()).toEqual([0, 1, 0, 1])
    expect(cardLabels().every((label) => label?.startsWith("N"))).toBe(true)
  })
})

describe("더보기 실패", () => {
  it("실패해도 더보기 버튼을 남겨 같은 페이지를 다시 요청할 수 있다", async () => {
    searchTrainsMock
      .mockResolvedValueOnce(slicePage("T", 0, 0, 20, true))
      .mockRejectedValueOnce(new Error("mock"))
      .mockResolvedValueOnce(slicePage("T", 1, 20, 20, false))

    renderPage()
    await screen.findByText("T000")

    act(() => moreButton()!.click())
    // 실패 후에도 버튼이 다시 활성화되고 받아 둔 목록은 그대로
    await waitFor(() => expect(moreButton()).toBeEnabled())
    expect(cardLabels()).toHaveLength(20)

    act(() => moreButton()!.click())
    await waitFor(() => expect(cardLabels()).toHaveLength(40))
    expect(requestedPages()).toEqual([0, 1, 1])
    expect(moreButton()).toBeNull()
  })
})

describe("좌석 선택 다이얼로그 지연 로딩", () => {
  it("예매 패널을 열기 전에는 불러오지 않고, 열 때 불러온다", async () => {
    searchTrainsMock.mockResolvedValueOnce(slicePage("T", 0, 0, 20, false))

    renderPage()
    await screen.findByText("T000")
    expect(seatDialogModule.imports).toBe(0)

    act(() => screen.getAllByRole("button", { name: "선택" })[0].click())
    await waitFor(() => expect(seatDialogModule.imports).toBe(1))
  })
})

describe("열차 조회 캐시·오류", () => {
  it("같은 조건으로 다시 들어오면 받아 둔 목록을 바로 보여 주고 다시 조회한다", async () => {
    const pages = [slicePage("T", 0, 0, 20, true), slicePage("T", 1, 20, 20, true)]
    searchTrainsMock.mockImplementation(async (_request, pageRequest) => pages[pageRequest?.page ?? 0])
    const client = new QueryClient()

    const first = renderPage(client)
    await screen.findByText("T000")
    act(() => moreButton()!.click())
    await waitFor(() => expect(cardLabels()).toHaveLength(40))
    first.unmount()

    renderPage(client)
    // 첫 렌더부터 캐시된 두 페이지가 보이고 스켈레톤은 나오지 않는다
    expect(cardLabels()).toHaveLength(40)
    expect(skeleton()).toHaveLength(0)
    // 좌석·운임 최신성을 위해 받아 둔 페이지를 다시 조회한다
    await waitFor(() => expect(requestedPages()).toEqual([0, 1, 0, 1]))
    expect(cardLabels()).toHaveLength(40)
  })

  it("조회에 실패하면 재시도하지 않고 빈 결과를 보여 준다", async () => {
    searchTrainsMock.mockRejectedValue(new Error("mock"))

    renderPage()

    expect(await screen.findByText("검색 결과가 없습니다")).toBeInTheDocument()
    expect(requestedPages()).toEqual([0])
    expect(skeleton()).toHaveLength(0)
  })
})

const car: CarInfo = { id: 13, carNumber: "3", carType: "STANDARD", totalSeats: 40, remainingSeats: 30, seatArrangement: "2+2" }
const seatDetail = (seatId: number, seatNumber: string): SeatDetail => ({
  seatId, seatNumber, isAvailable: true, seatDirection: "FORWARD", seatType: "WINDOW", remarks: "",
})

describe("예매 흐름", () => {
  beforeEach(() => {
    searchTrainsMock.mockResolvedValue(slicePage("N", 0, 100, 20, false))
    searchCarsMock.mockResolvedValue({ recommendedCarNumber: "3", totalCarCount: 1, trainClassificationCode: "KTX", trainNumber: "N100", carInfos: [car] })
    searchSeatsMock.mockResolvedValue({ carNumber: "3", carType: "STANDARD", totalSeatCount: 2, remainingSeatCount: 2, layoutType: 2, seatList: [seatDetail(7, "1A"), seatDetail(8, "1B")] })
    createPendingBookingMock.mockResolvedValue({ pendingBookingId: "pb-1" })
  })

  // 첫 열차 선택 → 좌석 고르기 → 좌석 조회 → 적용
  const chooseSeats = async (seats: string[]) => {
    dialogApply.seats = seats
    renderPage()
    await screen.findByText("N100")
    act(() => screen.getAllByRole("button", { name: "선택" })[0].click())
    act(() => screen.getByRole("button", { name: "좌석 고르기" }).click())
    const apply = await screen.findByRole("button", { name: "적용 확인" })
    await waitFor(() => expect(searchSeatsMock).toHaveBeenCalled())
    await act(async () => {})
    act(() => apply.click())
  }

  it("로그인 상태에서 고른 좌석과 승객 유형으로 대기 예약을 만들고 예약 목록으로 이동한다", async () => {
    navigation.params = new URLSearchParams("departure=서울&arrival=부산&date=2099-12-31&hour=09&adult=1&child=1")
    useAuthStore.setState({ accessToken: "token", tokenExpiresIn: Date.now() + 60_000, isAuthenticated: true })

    await chooseSeats(["1B", "1A"])
    expect(await screen.findByText("적용 좌석:1B,1A")).toBeInTheDocument()
    expect(searchCarsMock).toHaveBeenCalledWith({ trainScheduleId: 100, departureStationId: 2, arrivalStationId: 18, passengerCount: 2 })
    expect(searchSeatsMock).toHaveBeenCalledWith({ trainCarId: "13", trainScheduleId: 100, departureStationId: 2, arrivalStationId: 18 })

    await act(async () => screen.getByRole("button", { name: "예매하기" }).click())

    expect(createPendingBookingMock).toHaveBeenCalledWith({
      trainScheduleId: 100,
      departureStationId: 2,
      arrivalStationId: 18,
      passengerTypes: ["ADULT", "CHILD"],
      seatIds: [8, 7],
    })
    await waitFor(() => expect(navigation.router.push).toHaveBeenCalledWith("/ticket/reservations"))
    expect(screen.queryByRole("button", { name: "예매하기" })).toBeNull()
  })

  it("로그인하지 않았으면 인증을 한 번 확인한 뒤 로그인 화면으로 보내고 예약하지 않는다", async () => {
    await chooseSeats(["1A"])
    await act(async () => (await screen.findByRole("button", { name: "예매하기" })).click())

    expect(useAuthStore.getState().initialize).toHaveBeenCalledTimes(1)
    expect(navigation.router.push).toHaveBeenCalledWith(`/login?redirectTo=${encodeURIComponent("/")}`)
    expect(createPendingBookingMock).not.toHaveBeenCalled()
  })

  it("대기 예약에 실패하면 예매 패널을 유지하고 이동하지 않는다", async () => {
    useAuthStore.setState({ accessToken: "token", tokenExpiresIn: Date.now() + 60_000, isAuthenticated: true })
    createPendingBookingMock.mockRejectedValue(new Error("mock"))

    await chooseSeats(["1A"])
    await act(async () => (await screen.findByRole("button", { name: "예매하기" })).click())

    expect(createPendingBookingMock).toHaveBeenCalledTimes(1)
    expect(navigation.router.push).not.toHaveBeenCalled()
    expect(screen.getByRole("button", { name: "예매하기" })).toBeInTheDocument()
  })

  it("승객 수와 다른 개수를 적용하면 좌석 선택을 유지하고 예매 패널로 돌아가지 않는다", async () => {
    navigation.params = new URLSearchParams("departure=서울&arrival=부산&date=2099-12-31&hour=00&adult=2")

    await chooseSeats(["1A"])

    expect(screen.getByRole("button", { name: "적용 확인" })).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: "예매하기" })).toBeNull()
  })
})
