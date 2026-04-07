import { describe, it, expect } from "vitest"
import { formatPrice, formatTime } from "./format"

describe("formatPrice", () => {
  it("숫자를 한국어 가격 형식으로 변환한다", () => {
    expect(formatPrice(59800)).toBe("59,800원")
  })

  it("0원을 올바르게 표시한다", () => {
    expect(formatPrice(0)).toBe("0원")
  })

  it("인자 없이 호출하면 기본값 0원을 반환한다", () => {
    expect(formatPrice()).toBe("0원")
  })

  it("큰 숫자에 천 단위 구분자를 적용한다", () => {
    expect(formatPrice(1234567)).toBe("1,234,567원")
  })
})

describe("formatTime", () => {
  it("HH:mm:ss에서 HH:mm만 반환한다", () => {
    expect(formatTime("09:30:00")).toBe("09:30")
  })

  it("HH:mm 형식은 그대로 반환한다", () => {
    expect(formatTime("14:05")).toBe("14:05")
  })
})
