import { act, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { findPassword, verifyPassword } from "@/lib/api/authMembers"
import { updatePassword } from "@/lib/api/members"
import { SESSION_STORAGE_KEYS } from "@/constants/storageKeys"
import { FindPasswordTab } from "./FindPasswordTab"

const push = vi.hoisted(() => vi.fn())
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }))

const showErrorToast = vi.hoisted(() => vi.fn())
vi.mock("@/hooks/useErrorToast", () => ({ default: () => ({ showErrorToast }) }))

vi.mock("@/lib/api/authMembers", () => ({ findPassword: vi.fn(), verifyPassword: vi.fn() }))
vi.mock("@/lib/api/members", () => ({ updatePassword: vi.fn() }))

const findPasswordMock = vi.mocked(findPassword)
const verifyPasswordMock = vi.mocked(verifyPassword)
const updatePasswordMock = vi.mocked(updatePassword)

const TOKEN_KEY = SESSION_STORAGE_KEYS.PASSWORD_RESET_TOKEN
const EMAIL_KEY = SESSION_STORAGE_KEYS.PASSWORD_RESET_EMAIL

beforeEach(() => {
  sessionStorage.clear()
  findPasswordMock.mockResolvedValue({ email: "rail@example.com" })
  verifyPasswordMock.mockResolvedValue({ temporaryToken: "temp-token" })
  updatePasswordMock.mockResolvedValue(undefined)
})

afterEach(() => {
  vi.clearAllMocks()
  vi.useRealTimers()
})

type User = ReturnType<typeof userEvent.setup>

/** 조회 → 이메일 인증 단계까지 */
const lookUp = async (user: User) => {
  await user.type(screen.getByLabelText("이름"), "김철수")
  await user.type(screen.getByLabelText("회원번호"), "2025000001")
  await user.click(screen.getByRole("button", { name: "조회" }))
  await screen.findByRole("heading", { name: "이메일 인증" })
}

/** 인증 → 새 비밀번호 단계까지 */
const verify = async (user: User) => {
  await user.type(screen.getByLabelText("인증 코드"), "123456")
  await user.click(screen.getByRole("button", { name: "인증 확인" }))
  await screen.findByRole("heading", { name: "새 비밀번호 설정" })
}

const fillNewPassword = async (user: User, password: string, confirm = password) => {
  await user.type(screen.getByLabelText("새 비밀번호"), password)
  await user.type(screen.getByLabelText("새 비밀번호 확인"), confirm)
  await user.click(screen.getByRole("button", { name: "비밀번호 변경" }))
}

describe("비밀번호 찾기 탭", () => {
  it("이름·회원번호가 비어 있으면 조회하지 않고 안내한다", async () => {
    const user = userEvent.setup()
    render(<FindPasswordTab />)

    await user.type(screen.getByLabelText("이름"), "김철수")
    await user.click(screen.getByRole("button", { name: "조회" }))

    expect(findPasswordMock).not.toHaveBeenCalled()
    expect(showErrorToast).toHaveBeenCalledWith("이름과 회원 번호를 모두 입력해주세요.", "입력 오류")
  })

  it("조회하면 받은 이메일로 인증 단계를 보여 준다", async () => {
    const user = userEvent.setup()
    render(<FindPasswordTab />)

    await lookUp(user)

    expect(findPasswordMock).toHaveBeenCalledWith({ name: "김철수", memberNo: "2025000001" })
    expect(screen.getByText("rail@example.com")).toBeInTheDocument()
  })

  it("조회에 실패하면 안내하고 조회 단계에 머문다", async () => {
    const error = new Error("not found")
    findPasswordMock.mockRejectedValueOnce(error)
    const user = userEvent.setup()
    render(<FindPasswordTab />)

    await user.type(screen.getByLabelText("이름"), "김철수")
    await user.type(screen.getByLabelText("회원번호"), "1")
    await user.click(screen.getByRole("button", { name: "조회" }))

    expect(showErrorToast).toHaveBeenCalledWith(error, "비밀번호 찾기에 실패했습니다.")
    expect(screen.getByRole("button", { name: "조회" })).toBeInTheDocument()
  })

  it("인증 코드는 숫자만 받고, 6자리가 아니면 확인하지 않는다", async () => {
    const user = userEvent.setup()
    render(<FindPasswordTab />)
    await lookUp(user)

    const code = screen.getByLabelText("인증 코드")
    await user.type(code, "12a34")
    expect(code).toHaveValue("1234")
    expect(screen.getByText("4/6")).toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: "인증 확인" }))

    expect(verifyPasswordMock).not.toHaveBeenCalled()
    expect(showErrorToast).toHaveBeenCalledWith("인증 코드는 6자리여야 합니다.", "입력 오류")
  })

  it("인증하면 임시 토큰을 세션에 보관하고 새 비밀번호 단계로 간다", async () => {
    const user = userEvent.setup()
    render(<FindPasswordTab />)
    await lookUp(user)

    await verify(user)

    expect(verifyPasswordMock).toHaveBeenCalledWith({ email: "rail@example.com", authCode: "123456" })
    expect(sessionStorage.getItem(TOKEN_KEY)).toBe("temp-token")
    expect(sessionStorage.getItem(EMAIL_KEY)).toBe("rail@example.com")
  })

  it("뒤로가기는 입력을 비우고 조회 단계로 돌아간다", async () => {
    const user = userEvent.setup()
    render(<FindPasswordTab />)
    await lookUp(user)
    await verify(user)

    await user.click(screen.getByRole("button", { name: "뒤로가기" }))

    expect(screen.getByRole("button", { name: "조회" })).toBeInTheDocument()
    expect(sessionStorage.getItem(TOKEN_KEY)).toBeNull()
    expect(sessionStorage.getItem(EMAIL_KEY)).toBeNull()
  })

  it("세션에 인증 결과가 남아 있으면 새 비밀번호 단계부터 보여 준다", () => {
    sessionStorage.setItem(TOKEN_KEY, "kept-token")
    sessionStorage.setItem(EMAIL_KEY, "rail@example.com")

    render(<FindPasswordTab />)

    expect(screen.getByRole("heading", { name: "새 비밀번호 설정" })).toBeInTheDocument()
  })

  it("새 비밀번호가 다르거나 짧으면 변경하지 않는다", async () => {
    sessionStorage.setItem(TOKEN_KEY, "kept-token")
    sessionStorage.setItem(EMAIL_KEY, "rail@example.com")
    const user = userEvent.setup()
    render(<FindPasswordTab />)

    await fillNewPassword(user, "password1", "password2")
    expect(showErrorToast).toHaveBeenLastCalledWith("새 비밀번호와 확인 비밀번호가 일치하지 않습니다.", "입력 오류")

    await user.clear(screen.getByLabelText("새 비밀번호"))
    await user.clear(screen.getByLabelText("새 비밀번호 확인"))
    await fillNewPassword(user, "short")
    expect(showErrorToast).toHaveBeenLastCalledWith("비밀번호는 8자 이상이어야 합니다.", "입력 오류")

    expect(updatePasswordMock).not.toHaveBeenCalled()
  })

  it("변경하면 완료 화면을 보여 주고 세션을 비운 뒤 3초 뒤 로그인으로 이동한다", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    sessionStorage.setItem(TOKEN_KEY, "kept-token")
    sessionStorage.setItem(EMAIL_KEY, "rail@example.com")
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    render(<FindPasswordTab />)

    await fillNewPassword(user, "password123")

    expect(updatePasswordMock).toHaveBeenCalledWith("password123", "kept-token")
    expect(await screen.findByRole("heading", { name: "비밀번호 변경 완료!" })).toBeInTheDocument()
    expect(sessionStorage.getItem(TOKEN_KEY)).toBeNull()
    expect(sessionStorage.getItem(EMAIL_KEY)).toBeNull()
    expect(push).not.toHaveBeenCalled()

    act(() => {
      vi.advanceTimersByTime(3000)
    })
    expect(push).toHaveBeenCalledWith("/login")
  })

  it("변경에 실패하면 안내하고 임시 토큰을 지운다", async () => {
    const error = new Error("expired")
    updatePasswordMock.mockRejectedValueOnce(error)
    sessionStorage.setItem(TOKEN_KEY, "kept-token")
    sessionStorage.setItem(EMAIL_KEY, "rail@example.com")
    const user = userEvent.setup()
    render(<FindPasswordTab />)

    await fillNewPassword(user, "password123")

    expect(showErrorToast).toHaveBeenCalledWith(error, "비밀번호 변경에 실패했습니다.")
    expect(sessionStorage.getItem(TOKEN_KEY)).toBeNull()
    expect(screen.getByRole("heading", { name: "새 비밀번호 설정" })).toBeInTheDocument()
  })
})
