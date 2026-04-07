import { describe, it, expect } from "vitest"
import { passwordSchema } from "./password"

describe("passwordSchema", () => {
  it("유효한 비밀번호로 통과한다", () => {
    const result = passwordSchema.safeParse({
      newPassword: "password123",
      confirmPassword: "password123",
    })
    expect(result.success).toBe(true)
  })

  it("비밀번호가 비어있으면 실패한다", () => {
    const result = passwordSchema.safeParse({
      newPassword: "",
      confirmPassword: "",
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message)
      expect(messages).toContain("비밀번호를 입력해주세요.")
    }
  })

  it("비밀번호가 8자 미만이면 실패한다", () => {
    const result = passwordSchema.safeParse({
      newPassword: "1234567",
      confirmPassword: "1234567",
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message)
      expect(messages).toContain("비밀번호는 8자 이상이어야 합니다.")
    }
  })

  it("비밀번호가 정확히 8자면 통과한다", () => {
    const result = passwordSchema.safeParse({
      newPassword: "12345678",
      confirmPassword: "12345678",
    })
    expect(result.success).toBe(true)
  })

  it("비밀번호 확인이 비어있으면 실패한다", () => {
    const result = passwordSchema.safeParse({
      newPassword: "password123",
      confirmPassword: "",
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message)
      expect(messages).toContain("비밀번호 확인을 입력해주세요.")
    }
  })

  it("비밀번호와 확인이 일치하지 않으면 실패한다", () => {
    const result = passwordSchema.safeParse({
      newPassword: "password123",
      confirmPassword: "password456",
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message)
      expect(messages).toContain("비밀번호가 일치하지 않습니다.")
    }
  })
})
