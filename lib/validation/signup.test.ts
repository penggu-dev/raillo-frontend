import { describe, it, expect } from "vitest"
import { signupSchema, formatPhoneNumber, removePhoneNumberFormatting } from "./signup"

const validInput = {
  name: "홍길동",
  email: "test@example.com",
  password: "password123",
  confirmPassword: "password123",
  phoneNumber: "01012345678",
  birthDate: "1990-01-15",
  gender: "M" as const,
  terms: true as const,
  privacy: true as const,
  marketing: false,
}

describe("signupSchema", () => {
  it("유효한 입력으로 통과한다", () => {
    const result = signupSchema.safeParse(validInput)
    expect(result.success).toBe(true)
  })

  it("이름이 비어있으면 실패한다", () => {
    const result = signupSchema.safeParse({ ...validInput, name: "" })
    expect(result.success).toBe(false)
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message)
      expect(messages).toContain("이름은 필수입니다.")
    }
  })

  it("이메일이 비어있으면 실패한다", () => {
    const result = signupSchema.safeParse({ ...validInput, email: "" })
    expect(result.success).toBe(false)
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message)
      expect(messages).toContain("이메일은 필수입니다.")
    }
  })

  it("이메일 형식이 올바르지 않으면 실패한다", () => {
    const result = signupSchema.safeParse({ ...validInput, email: "invalid" })
    expect(result.success).toBe(false)
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message)
      expect(messages).toContain("올바른 이메일 형식이 아닙니다.")
    }
  })

  it("비밀번호가 8자 미만이면 실패한다", () => {
    const result = signupSchema.safeParse({
      ...validInput,
      password: "1234567",
      confirmPassword: "1234567",
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message)
      expect(messages).toContain("비밀번호는 8자 이상이어야 합니다.")
    }
  })

  it("비밀번호 확인이 일치하지 않으면 실패한다", () => {
    const result = signupSchema.safeParse({
      ...validInput,
      confirmPassword: "different123",
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message)
      expect(messages).toContain("비밀번호가 일치하지 않습니다.")
    }
  })

  it("전화번호가 11자리가 아니면 실패한다", () => {
    const result = signupSchema.safeParse({
      ...validInput,
      phoneNumber: "0101234567",
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message)
      expect(messages).toContain("전화번호는 11자리 숫자여야 합니다.")
    }
  })

  it("하이픈이 포함된 전화번호도 통과한다", () => {
    const result = signupSchema.safeParse({
      ...validInput,
      phoneNumber: "010-1234-5678",
    })
    expect(result.success).toBe(true)
  })

  it("생년월일 형식이 올바르지 않으면 실패한다", () => {
    const result = signupSchema.safeParse({
      ...validInput,
      birthDate: "19900115",
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message)
      expect(messages).toContain("생년월일을 모두 선택해주세요.")
    }
  })

  it("성별이 M/F가 아니면 실패한다", () => {
    const result = signupSchema.safeParse({
      ...validInput,
      gender: "X",
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      const paths = result.error.issues.map((i) => i.path[0])
      expect(paths).toContain("gender")
    }
  })

  it("이용약관에 동의하지 않으면 실패한다", () => {
    const result = signupSchema.safeParse({
      ...validInput,
      terms: false,
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message)
      expect(messages).toContain("이용약관에 동의해주세요.")
    }
  })

  it("개인정보 수집에 동의하지 않으면 실패한다", () => {
    const result = signupSchema.safeParse({
      ...validInput,
      privacy: false,
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message)
      expect(messages).toContain("개인정보 수집 및 이용에 동의해주세요.")
    }
  })

  it("마케팅 동의는 false여도 통과한다", () => {
    const result = signupSchema.safeParse({
      ...validInput,
      marketing: false,
    })
    expect(result.success).toBe(true)
  })
})

describe("formatPhoneNumber", () => {
  it("3자리 이하는 그대로 반환한다", () => {
    expect(formatPhoneNumber("010")).toBe("010")
  })

  it("4~7자리는 3-N 형식으로 반환한다", () => {
    expect(formatPhoneNumber("0101234")).toBe("010-1234")
  })

  it("8자리 이상은 3-4-N 형식으로 반환한다", () => {
    expect(formatPhoneNumber("01012345678")).toBe("010-1234-5678")
  })

  it("11자리를 초과하면 잘라낸다", () => {
    expect(formatPhoneNumber("010123456789999")).toBe("010-1234-5678")
  })

  it("문자가 포함되면 숫자만 추출한다", () => {
    expect(formatPhoneNumber("010-1234-5678")).toBe("010-1234-5678")
  })
})

describe("removePhoneNumberFormatting", () => {
  it("하이픈을 제거한다", () => {
    expect(removePhoneNumberFormatting("010-1234-5678")).toBe("01012345678")
  })

  it("숫자만 있으면 그대로 반환한다", () => {
    expect(removePhoneNumberFormatting("01012345678")).toBe("01012345678")
  })
})
