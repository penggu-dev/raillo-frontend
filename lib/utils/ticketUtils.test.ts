import { describe, it, expect } from "vitest"
import {
  getTrainTypeColor,
  getCarTypeName,
  getPassengerTypeName,
  getPaymentMethodName,
} from "./ticketUtils"

describe("getTrainTypeColor", () => {
  it("KTX는 파란색 배경을 반환한다", () => {
    expect(getTrainTypeColor("KTX")).toBe("bg-blue-600 text-white")
  })

  it("KTX-산천도 파란색 배경을 반환한다", () => {
    expect(getTrainTypeColor("KTX-산천")).toBe("bg-blue-600 text-white")
  })

  it("ITX-새마을은 초록색 배경을 반환한다", () => {
    expect(getTrainTypeColor("ITX-새마을")).toBe("bg-green-600 text-white")
  })

  it("무궁화호는 주황색 배경을 반환한다", () => {
    expect(getTrainTypeColor("무궁화호")).toBe("bg-orange-600 text-white")
  })

  it("ITX-청춘은 보라색 배경을 반환한다", () => {
    expect(getTrainTypeColor("ITX-청춘")).toBe("bg-purple-600 text-white")
  })

  it("알 수 없는 열차는 회색 배경을 반환한다", () => {
    expect(getTrainTypeColor("SRT")).toBe("bg-gray-600 text-white")
  })
})

describe("getCarTypeName", () => {
  it("STANDARD는 일반실을 반환한다", () => {
    expect(getCarTypeName("STANDARD")).toBe("일반실")
  })

  it("FIRST_CLASS는 특실을 반환한다", () => {
    expect(getCarTypeName("FIRST_CLASS")).toBe("특실")
  })

  it("알 수 없는 값은 그대로 반환한다", () => {
    expect(getCarTypeName("UNKNOWN")).toBe("UNKNOWN")
  })
})

describe("getPassengerTypeName", () => {
  const cases = [
    ["ADULT", "어른"],
    ["CHILD", "어린이"],
    ["INFANT", "유아"],
    ["SENIOR", "경로"],
    ["DISABLED_HEAVY", "중증장애인"],
    ["DISABLED_LIGHT", "경증장애인"],
    ["VETERAN", "국가유공자"],
  ] as const

  it.each(cases)("%s는 %s를 반환한다", (input, expected) => {
    expect(getPassengerTypeName(input)).toBe(expected)
  })

  it("알 수 없는 값은 그대로 반환한다", () => {
    expect(getPassengerTypeName("VIP")).toBe("VIP")
  })
})

describe("getPaymentMethodName", () => {
  it("CARD는 카드결제를 반환한다", () => {
    expect(getPaymentMethodName("CARD")).toBe("카드결제")
  })

  it("BANK_TRANSFER는 계좌이체를 반환한다", () => {
    expect(getPaymentMethodName("BANK_TRANSFER")).toBe("계좌이체")
  })

  it("TRANSFER도 계좌이체를 반환한다", () => {
    expect(getPaymentMethodName("TRANSFER")).toBe("계좌이체")
  })

  it("EASY_PAY는 간편결제를 반환한다", () => {
    expect(getPaymentMethodName("EASY_PAY")).toBe("간편결제")
  })

  it("알 수 없는 값은 그대로 반환한다", () => {
    expect(getPaymentMethodName("BITCOIN")).toBe("BITCOIN")
  })
})
