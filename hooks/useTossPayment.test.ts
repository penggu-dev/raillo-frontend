import { act, renderHook } from "@testing-library/react"
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

const renderPayment = async () => renderHook(() => useTossPayment())

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
    expect(result.current.paymentInfo).toEqual({ orderId: "ORD_1", amount: 26400, items: [item("a", "001")] })
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

  it("결제 준비가 실패하면 위젯 불러오기를 기다리지 않고 바로 알린다", async () => {
    // 위젯 불러오기가 끝나지 않는 상황(느린 원격 스크립트)
    loadPaymentWidgetMock.mockReturnValueOnce(new Promise(() => {}))
    preparePaymentMock.mockRejectedValueOnce(new Error("mock"))
    const { result } = await renderPayment()

    await act(async () => {
      void result.current.prepare([item("a", "001")])
    })

    expect(toast).toHaveBeenCalledWith(expect.objectContaining({ title: "결제 준비 실패" }))
    expect(result.current.paymentLoading).toBe(false)
    expect(result.current.showPaymentDialog).toBe(false)
  })

  it("결제창에 주문 이름과 성공·실패 주소를 넘긴다", async () => {
    const { result } = await renderPayment()
    const selected = [item("a", "001"), item("b", "003")]

    await act(async () => {
      await result.current.prepare(selected)
    })
    await act(async () => {
      await result.current.requestPayment()
    })

    expect(requestPaymentMock).toHaveBeenCalledWith({
      orderId: "ORD_1",
      orderName: "KTX 001 외 1매",
      successUrl: `${window.location.origin}/ticket/reservation/success`,
      failUrl: `${window.location.origin}/ticket/reservations`,
    })
  })

  it("준비하는 동안 선택이 바뀌어도 준비할 때 고른 예약으로 결제창을 요청한다", async () => {
    let finishPrepare: (info: { orderId: string; amount: number }) => void = () => {}
    preparePaymentMock.mockReturnValueOnce(new Promise((resolve) => (finishPrepare = resolve)))
    const { result } = await renderPayment()
    const selected = [item("a", "001"), item("b", "003")]

    await act(async () => {
      void result.current.prepare(selected)
    })
    // 준비 응답을 기다리는 동안 화면의 선택이 바뀌어도(전부 해제 등) 준비 당시 항목을 쓴다
    selected.length = 0
    await act(async () => {
      finishPrepare({ orderId: "ORD_1", amount: 26400 })
    })
    await act(async () => {
      await result.current.requestPayment()
    })

    expect(result.current.paymentInfo?.items).toHaveLength(2)
    expect(requestPaymentMock).toHaveBeenCalledWith(expect.objectContaining({ orderName: "KTX 001 외 1매" }))
  })

  it("결제창이 떠 있는 동안 결제 중 상태와 body 클래스를 두고, 결제창이 닫히면 걷는다", async () => {
    let closeWindow: (reason: unknown) => void = () => {}
    requestPaymentMock.mockReturnValueOnce(new Promise((_, reject) => (closeWindow = reject)))
    const { result } = await renderPayment()

    await act(async () => {
      await result.current.prepare([item("a", "001")])
    })
    await act(async () => {
      void result.current.requestPayment()
    })

    expect(result.current.paymentRequesting).toBe(true)
    expect(document.body.classList.contains("payment-window-open")).toBe(true)

    await act(async () => {
      closeWindow({ code: "USER_CANCEL" })
    })

    expect(result.current.paymentRequesting).toBe(false)
    expect(document.body.classList.contains("payment-window-open")).toBe(false)
  })

  it("사용자가 결제창을 닫으면 조용히 결제 화면만 닫는다", async () => {
    requestPaymentMock.mockRejectedValueOnce({ code: "USER_CANCEL" })
    const { result } = await renderPayment()
    const selected = [item("a", "001")]

    await act(async () => {
      await result.current.prepare(selected)
    })
    await act(async () => {
      await result.current.requestPayment()
    })

    expect(result.current.showPaymentDialog).toBe(false)
    expect(toast).not.toHaveBeenCalledWith(expect.objectContaining({ title: "결제 요청 실패" }))
  })

  it("화면에 들어온 것만으로는 결제 위젯을 불러오지 않는다", async () => {
    const { result } = await renderPayment()

    await act(async () => {})

    expect(loadPaymentWidgetMock).not.toHaveBeenCalled()
    expect(result.current.widget).toBeNull()
  })

  it("결제 준비 때 위젯을 불러오고, 다시 준비할 때는 불러온 위젯을 쓴다", async () => {
    const { result } = await renderPayment()

    await act(async () => {
      await result.current.prepare([item("a", "001")])
    })
    await act(async () => {
      await result.current.prepare([item("b", "003")])
    })

    expect(loadPaymentWidgetMock).toHaveBeenCalledTimes(1)
    expect(result.current.widget).not.toBeNull()
    expect(preparePaymentMock).toHaveBeenCalledTimes(2)
  })

  it("위젯을 불러오지 못하면 알리고 결제 화면을 열지 않으며, 다시 누르면 다시 불러온다", async () => {
    loadPaymentWidgetMock.mockRejectedValueOnce(new Error("network"))
    const { result } = await renderPayment()

    await act(async () => {
      await result.current.prepare([item("a", "001")])
    })

    expect(result.current.showPaymentDialog).toBe(false)
    expect(toast).toHaveBeenCalledWith(expect.objectContaining({ title: "결제 위젯을 불러오지 못했습니다" }))

    await act(async () => {
      await result.current.prepare([item("a", "001")])
    })

    expect(loadPaymentWidgetMock).toHaveBeenCalledTimes(2)
    expect(result.current.showPaymentDialog).toBe(true)
  })

  it("위젯 불러오기가 끝나지 않으면 제한 시간 뒤 알리고 버튼을 풀며, 늦게 끝난 불러오기는 무시한다", async () => {
    vi.useFakeTimers()
    try {
      let finishLate: (widget: never) => void = () => {}
      loadPaymentWidgetMock.mockReturnValueOnce(new Promise((resolve) => (finishLate = resolve)))
      const { result } = await renderPayment()

      await act(async () => {
        void result.current.prepare([item("a", "001")])
      })
      expect(result.current.paymentLoading).toBe(true)

      await act(async () => {
        await vi.advanceTimersByTimeAsync(10_000)
      })

      expect(toast).toHaveBeenCalledWith(expect.objectContaining({ title: "결제 위젯을 불러오지 못했습니다" }))
      expect(result.current.paymentLoading).toBe(false)
      expect(result.current.showPaymentDialog).toBe(false)

      // 다시 누르면 새로 불러오고, 앞서 시간을 넘긴 불러오기가 늦게 끝나도 위젯을 바꾸지 않는다
      await act(async () => {
        await result.current.prepare([item("a", "001")])
      })
      const current = result.current.widget
      await act(async () => {
        finishLate({ requestPayment: vi.fn() } as never)
      })

      expect(loadPaymentWidgetMock).toHaveBeenCalledTimes(2)
      expect(result.current.showPaymentDialog).toBe(true)
      expect(result.current.widget).toBe(current)
    } finally {
      vi.useRealTimers()
    }
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
