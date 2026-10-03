import { fireEvent, render, screen } from "@testing-library/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { beforeEach, describe, expect, it, vi } from "vitest"
import ReservationsPage from "./page"

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}))
vi.mock("@/hooks/useAuth", () => ({ useAuth: () => ({ isAuthenticated: true, isChecking: false }) }))
vi.mock("@/hooks/usePendingBooking", () => ({
  PENDING_BOOKINGS_QUERY_KEY: ["pendingBookings"],
  useGetPendingBookingList: () => ({ data: [], isLoading: false, isError: false, error: null, refetch: vi.fn() }),
}))

// 결제 팝업이 열린 상태를 직접 만든다 — 위젯은 결제 수단 영역만 그리는 가짜
const payment = vi.hoisted(() => ({ requesting: false, setShowPaymentDialog: vi.fn() }))
vi.mock("@/hooks/useTossPayment", () => ({
  useTossPayment: () => ({
    widget: { renderPaymentMethods: () => ({}) },
    paymentInfo: { orderId: "ORD_1", amount: 26400, items: [] },
    paymentLoading: false,
    paymentRequesting: payment.requesting,
    showPaymentDialog: true,
    setShowPaymentDialog: payment.setShowPaymentDialog,
    prepare: vi.fn(),
    requestPayment: vi.fn(),
  }),
}))

const renderPage = () =>
  render(
    <QueryClientProvider client={new QueryClient()}>
      <ReservationsPage />
    </QueryClientProvider>,
  )

beforeEach(() => {
  vi.clearAllMocks()
  payment.requesting = false
})

describe("예약승차권 결제 팝업", () => {
  it("평소에는 ESC로 결제 팝업을 닫는다", () => {
    renderPage()

    fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" })

    expect(payment.setShowPaymentDialog).toHaveBeenCalledWith(false)
  })

  it("토스 결제창이 떠 있는 동안에는 ESC·바깥 누름으로 결제 팝업이 닫히지 않는다", () => {
    payment.requesting = true
    renderPage()

    fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" })
    fireEvent.pointerDown(document.body)

    expect(screen.getByRole("dialog")).toBeInTheDocument()
    expect(payment.setShowPaymentDialog).not.toHaveBeenCalled()
  })
})
