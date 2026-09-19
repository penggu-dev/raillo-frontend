import { StrictMode, type ReactNode } from "react"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { beforeEach, describe, expect, it, vi } from "vitest"
import type { PaymentConfirmResult } from "@/types/paymentsType"
import { confirmPayment } from "@/lib/api/payments"
import PaymentSuccessPage from "./page"

const navigation = vi.hoisted(() => ({
  router: { push: vi.fn(), replace: vi.fn() },
  params: new URLSearchParams(),
}))

vi.mock("next/navigation", () => ({
  useRouter: () => navigation.router,
  useSearchParams: () => navigation.params,
}))

vi.mock("@/lib/api/payments", () => ({
  confirmPayment: vi.fn(),
}))

const toast = vi.hoisted(() => vi.fn())
vi.mock("@/hooks/useToast", () => ({
  useToast: () => ({ toast }),
}))

// 로그인 확인은 이 테스트 범위 밖 — 바로 내용을 렌더
vi.mock("@/components/auth/AuthGuard", () => ({
  default: ({ children }: { children: ReactNode }) => <>{children}</>,
}))

const confirmPaymentMock = vi.mocked(confirmPayment)

const SUCCESS_QUERY = "paymentType=NORMAL&orderId=ORD_2609191423422423&paymentKey=tgen_20260919142352IKVV5&amount=26400"

const confirmResult: PaymentConfirmResult = {
  paymentId: 1,
  orderId: "ORD_2609191423422423",
  paymentKey: "tgen_20260919142352IKVV5",
  amount: 26400,
  paymentMethod: "CARD",
  paymentStatus: "DONE",
  paidAt: "2026-09-19T14:24:00",
}

const renderPage = ({ strict = false }: { strict?: boolean } = {}) => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  const invalidateQueries = vi.spyOn(queryClient, "invalidateQueries")
  const page = (
    <QueryClientProvider client={queryClient}>
      <PaymentSuccessPage />
    </QueryClientProvider>
  )
  render(strict ? <StrictMode>{page}</StrictMode> : page)
  return { invalidateQueries }
}

beforeEach(() => {
  vi.clearAllMocks()
  navigation.params = new URLSearchParams(SUCCESS_QUERY)
})

describe("결제 성공 페이지", () => {
  it("쿼리의 결제 정보로 승인을 요청하고, 성공하면 목록 캐시를 무효화한 뒤 승차권 확인으로 이동한다", async () => {
    confirmPaymentMock.mockResolvedValue(confirmResult)
    const { invalidateQueries } = renderPage()

    expect(screen.getByRole("status")).toHaveTextContent("결제를 승인하는 중입니다")
    await waitFor(() => expect(navigation.router.replace).toHaveBeenCalledWith("/ticket/purchased"))

    expect(confirmPaymentMock).toHaveBeenCalledTimes(1)
    expect(confirmPaymentMock).toHaveBeenCalledWith({
      paymentKey: "tgen_20260919142352IKVV5",
      orderId: "ORD_2609191423422423",
      amount: 26400,
    })
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ["pendingBookings"] })
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ["tickets"] })
    expect(toast).toHaveBeenCalledWith({ description: "결제가 완료되었습니다." })
  })

  it("StrictMode에서 effect가 두 번 실행돼도 승인은 한 번만 요청한다", async () => {
    confirmPaymentMock.mockResolvedValue(confirmResult)
    renderPage({ strict: true })

    await waitFor(() => expect(navigation.router.replace).toHaveBeenCalledTimes(1))
    expect(confirmPaymentMock).toHaveBeenCalledTimes(1)
  })

  it("승인이 실패하면 이동하지 않고 오류를 안내하며, 다시 시도하면 같은 정보로 다시 요청한다", async () => {
    confirmPaymentMock.mockRejectedValueOnce(new Error("이미 처리된 결제입니다.")).mockResolvedValueOnce(confirmResult)
    renderPage()

    const alert = await screen.findByRole("alert")
    expect(alert).toHaveTextContent("결제를 승인하지 못했습니다")
    expect(alert).toHaveTextContent("이미 처리된 결제입니다.")
    expect(navigation.router.replace).not.toHaveBeenCalled()

    await userEvent.click(screen.getByRole("button", { name: "다시 시도" }))

    await waitFor(() => expect(navigation.router.replace).toHaveBeenCalledWith("/ticket/purchased"))
    expect(confirmPaymentMock).toHaveBeenCalledTimes(2)
    expect(confirmPaymentMock.mock.calls[1][0]).toEqual(confirmPaymentMock.mock.calls[0][0])
  })

  it("결제 정보가 빠진 주소로 들어오면 승인을 요청하지 않고 예약 목록으로 안내한다", async () => {
    navigation.params = new URLSearchParams("orderId=ORD_1&amount=26400")
    renderPage()

    expect(await screen.findByRole("alert")).toHaveTextContent("결제 정보를 확인할 수 없습니다")
    expect(screen.getByRole("link", { name: "예약 목록으로" })).toHaveAttribute("href", "/ticket/reservations")
    expect(confirmPaymentMock).not.toHaveBeenCalled()
  })
})
