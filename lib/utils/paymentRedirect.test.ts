import { describe, expect, it } from "vitest"
import { getPaymentFailNotice, parsePaymentSuccessParams } from "./paymentRedirect"

const params = (query: string) => new URLSearchParams(query)

describe("parsePaymentSuccessParams", () => {
  it("Toss 성공 쿼리를 승인 요청으로 바꾼다 (금액은 숫자, paymentType은 무시)", () => {
    expect(
      parsePaymentSuccessParams(
        params("paymentType=NORMAL&orderId=ORD_1&paymentKey=tgen_1&amount=26400"),
      ),
    ).toEqual({ paymentKey: "tgen_1", orderId: "ORD_1", amount: 26400 })
  })

  it.each([
    ["paymentKey 누락", "orderId=ORD_1&amount=26400"],
    ["orderId 누락", "paymentKey=tgen_1&amount=26400"],
    ["amount 누락", "paymentKey=tgen_1&orderId=ORD_1"],
    ["amount 숫자 아님", "paymentKey=tgen_1&orderId=ORD_1&amount=abc"],
    ["amount 0", "paymentKey=tgen_1&orderId=ORD_1&amount=0"],
    ["amount 음수", "paymentKey=tgen_1&orderId=ORD_1&amount=-100"],
    ["amount 소수", "paymentKey=tgen_1&orderId=ORD_1&amount=100.5"],
  ])("%s → null", (_, query) => {
    expect(parsePaymentSuccessParams(params(query))).toBeNull()
  })
})

describe("getPaymentFailNotice", () => {
  it("실패 쿼리가 없으면 null", () => {
    expect(getPaymentFailNotice(params(""))).toBeNull()
  })

  it("사용자 취소는 오류가 아닌 취소 안내", () => {
    expect(
      getPaymentFailNotice(params("code=PAY_PROCESS_CANCELED&message=사용자가 결제를 취소하였습니다&orderId=ORD_1")),
    ).toEqual({ title: "결제 취소", description: "결제가 취소되었습니다.", canceled: true })
  })

  it("그 밖의 실패는 Toss가 준 메시지로 안내", () => {
    expect(getPaymentFailNotice(params("code=REJECT_CARD_COMPANY&message=카드사에서 거절했습니다&orderId=ORD_1"))).toEqual({
      title: "결제 실패",
      description: "카드사에서 거절했습니다",
      canceled: false,
    })
  })

  it("메시지가 없으면 기본 안내", () => {
    expect(getPaymentFailNotice(params("code=PAY_PROCESS_ABORTED"))?.description).toBe(
      "결제가 완료되지 않았습니다. 다시 시도해주세요.",
    )
  })
})
