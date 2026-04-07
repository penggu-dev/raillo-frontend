import { describe, it, expect } from "vitest"
import { extractErrorMessage, handleError, withErrorHandling } from "./errorHandler"

describe("extractErrorMessage", () => {
  it("Error 인스턴스에서 message를 추출한다", () => {
    expect(extractErrorMessage(new Error("네트워크 오류"))).toBe("네트워크 오류")
  })

  it("errorMessage 필드가 있는 객체에서 추출한다", () => {
    expect(extractErrorMessage({ errorMessage: "인증 실패" })).toBe("인증 실패")
  })

  it("message 필드가 있는 객체에서 추출한다", () => {
    expect(extractErrorMessage({ message: "서버 오류" })).toBe("서버 오류")
  })

  it("errorMessage가 message보다 우선한다", () => {
    expect(
      extractErrorMessage({ errorMessage: "우선", message: "후순위" })
    ).toBe("우선")
  })

  it("response.data.errorMessage에서 추출한다", () => {
    const error = { response: { data: { errorMessage: "API 에러" } } }
    expect(extractErrorMessage(error)).toBe("API 에러")
  })

  it("response.data.message에서 추출한다", () => {
    const error = { response: { data: { message: "API 메시지" } } }
    expect(extractErrorMessage(error)).toBe("API 메시지")
  })

  it("추출할 수 없으면 기본 메시지를 반환한다", () => {
    expect(extractErrorMessage(null)).toBe("오류가 발생했습니다.")
  })

  it("커스텀 기본 메시지를 사용할 수 있다", () => {
    expect(extractErrorMessage(undefined, "커스텀 에러")).toBe("커스텀 에러")
  })

  it("문자열 에러는 기본 메시지를 반환한다", () => {
    expect(extractErrorMessage("문자열 에러")).toBe("오류가 발생했습니다.")
  })
})

describe("handleError", () => {
  it("extractErrorMessage와 동일한 메시지를 반환한다", () => {
    expect(handleError(new Error("테스트"))).toBe("테스트")
  })

  it("기본 메시지를 전달할 수 있다", () => {
    expect(handleError(null, "실패")).toBe("실패")
  })
})

describe("withErrorHandling", () => {
  it("성공 시 API 호출 결과를 반환한다", async () => {
    const result = await withErrorHandling(() => Promise.resolve("성공"))
    expect(result).toBe("성공")
  })

  it("실패 시 null을 반환한다", async () => {
    const result = await withErrorHandling(() => Promise.reject(new Error("실패")))
    expect(result).toBeNull()
  })
})
