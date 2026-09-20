import { act, renderHook, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { loadPaymentWidget } from "@tosspayments/payment-widget-sdk"
import { preparePayment } from "@/lib/api/payments"
import type { PendingBookingCartItem } from "@/types/bookingType"
import { useTossPayment } from "./useTossPayment"

const navigation = vi.hoisted(() => ({ replace: vi.fn(), params: new URLSearchParams() }))
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: navigation.replace, push: vi.fn() }),
  useSearchParams: () => navigation.params,
}))

const toast = vi.hoisted(() => vi.fn())
vi.mock("@/hooks/useToast", () => ({ useToast: () => ({ toast }) }))

vi.mock("@tosspayments/payment-widget-sdk", () => ({ loadPaymentWidget: vi.fn() }))
vi.mock("@/lib/api/payments", () => ({ preparePayment: vi.fn() }))

const loadPaymentWidgetMock = vi.mocked(loadPaymentWidget)
const preparePaymentMock = vi.mocked(preparePayment)
const requestPaymentMock = vi.fn()

const item = (id: string, trainNumber: string): PendingBookingCartItem =>
  ({ pendingBookingId: id, trainName: "KTX", trainNumber }) as unknown as PendingBookingCartItem

const renderPayment = async () => {
  const view = renderHook(() => useTossPayment({ enabled: true }))
  await waitFor(() => expect(view.result.current.widget).not.toBeNull())
  return view
}

beforeEach(() => {
  vi.clearAllMocks()
  navigation.params = new URLSearchParams()
  localStorage.clear()
  requestPaymentMock.mockResolvedValue(undefined)
  loadPaymentWidgetMock.mockResolvedValue({ requestPayment: requestPaymentMock } as never)
  preparePaymentMock.mockResolvedValue({ orderId: "ORD_1", amount: 26400 })
})

describe("useTossPayment", () => {
  it("결제 준비에 성공하면 주문 정보를 들고 결제 화면을 연다", async () => {
    const { result } = await renderPayment()

    await act(async () => {
      await result.current.prepare([item("a", "001")])
    })

    expect(preparePaymentMock).toHaveBeenCalledWith({ pendingBookingIds: ["a"] })
    expect(result.current.paymentInfo).toEqual({ orderId: "ORD_1", amount: 26400 })
    expect(result.current.showPaymentDialog).toBe(true)
  })

  it("고른 예약이 없으면 준비하지 않고 안내한다", async () => {
    const { result } = await renderPayment()

    await act(async () => {
      await result.current.prepare([])
    })

    expect(preparePaymentMock).not.toHaveBeenCalled()
    expect(toast).toHaveBeenCalledWith(expect.objectContaining({ title: "선택 필요" }))
  })

  it("결제 준비가 실패하면 알리고 결제 화면을 열지 않는다", async () => {
    preparePaymentMock.mockRejectedValueOnce(new Error("mock"))
    const { result } = await renderPayment()

    await act(async () => {
      await result.current.prepare([item("a", "001")])
    })

    expect(result.current.showPaymentDialog).toBe(false)
    expect(toast).toHaveBeenCalledWith(expect.objectContaining({ title: "결제 준비 실패" }))
  })

  it("결제창에 주문 이름과 성공·실패 주소를 넘긴다", async () => {
    const { result } = await renderPayment()
    const selected = [item("a", "001"), item("b", "003")]

    await act(async () => {
      await result.current.prepare(selected)
    })
    await act(async () => {
      await result.current.requestPayment(selected)
    })

    expect(requestPaymentMock).toHaveBeenCalledWith({
      orderId: "ORD_1",
      orderName: "KTX 001 외 1매",
      successUrl: `${window.location.origin}/ticket/reservation/success`,
      failUrl: `${window.location.origin}/ticket/reservations`,
    })
  })

  it("사용자가 결제창을 닫으면 조용히 결제 화면만 닫는다", async () => {
    requestPaymentMock.mockRejectedValueOnce({ code: "USER_CANCEL" })
    const { result } = await renderPayment()
    const selected = [item("a", "001")]

    await act(async () => {
      await result.current.prepare(selected)
    })
    await act(async () => {
      await result.current.requestPayment(selected)
    })

    expect(result.current.showPaymentDialog).toBe(false)
    expect(toast).not.toHaveBeenCalledWith(expect.objectContaining({ title: "결제 요청 실패" }))
  })

  it("결제 실패로 돌아오면 사유를 알리고 주소에서 지운다", async () => {
    navigation.params = new URLSearchParams("code=REJECT_CARD_COMPANY&message=카드사 거절&orderId=ORD_1")

    await renderPayment()

    expect(toast).toHaveBeenCalledWith(
      expect.objectContaining({ title: "결제 실패", description: "카드사 거절" }),
    )
    expect(navigation.replace).toHaveBeenCalledWith("/ticket/reservations")
  })
})
