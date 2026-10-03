import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { findMemberNo, verifyMemberNo } from "@/lib/api/authMembers"
import { SESSION_STORAGE_KEYS } from "@/constants/storageKeys"
import { FindMemberTab } from "./FindMemberTab"

const push = vi.hoisted(() => vi.fn())
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }))

const showErrorToast = vi.hoisted(() => vi.fn())
vi.mock("@/hooks/useErrorToast", () => ({ default: () => ({ showErrorToast }) }))

vi.mock("@/lib/api/authMembers", () => ({ findMemberNo: vi.fn(), verifyMemberNo: vi.fn() }))

const findMemberNoMock = vi.mocked(findMemberNo)
const verifyMemberNoMock = vi.mocked(verifyMemberNo)

beforeEach(() => {
  sessionStorage.clear()
  findMemberNoMock.mockResolvedValue({ email: "rail@example.com" })
  verifyMemberNoMock.mockResolvedValue({ memberNo: "2025000001" })
})

afterEach(() => {
  vi.clearAllMocks()
})

describe("회원번호 찾기 탭", () => {
  it("휴대폰번호는 숫자 11자리까지만 받고, 11자리가 아니면 찾지 않는다", async () => {
    const user = userEvent.setup()
    render(<FindMemberTab />)

    const phone = screen.getByLabelText("휴대폰번호")
    await user.type(phone, "010-1234-56789")
    expect(phone).toHaveValue("01012345678")

    await user.clear(phone)
    await user.type(phone, "0101234")
    await user.type(screen.getByLabelText("이름"), "김철수")
    await user.click(screen.getByRole("button", { name: "회원번호 찾기" }))

    expect(findMemberNoMock).not.toHaveBeenCalled()
    expect(showErrorToast).toHaveBeenCalledWith("휴대폰 번호는 11자리여야 합니다.", "입력 오류")
  })

  it("찾기 → 이메일 인증 → 결과 화면으로 회원번호를 넘긴다", async () => {
    const user = userEvent.setup()
    render(<FindMemberTab />)

    await user.type(screen.getByLabelText("이름"), "김철수")
    await user.type(screen.getByLabelText("휴대폰번호"), "01012345678")
    await user.click(screen.getByRole("button", { name: "회원번호 찾기" }))

    expect(findMemberNoMock).toHaveBeenCalledWith({ name: "김철수", phoneNumber: "01012345678" })
    expect(await screen.findByRole("heading", { name: "이메일 인증" })).toBeInTheDocument()
    expect(screen.getByText("rail@example.com")).toBeInTheDocument()

    await user.type(screen.getByLabelText("인증 코드"), "123456")
    await user.click(screen.getByRole("button", { name: "인증 확인" }))

    expect(verifyMemberNoMock).toHaveBeenCalledWith({ email: "rail@example.com", authCode: "123456" })
    expect(sessionStorage.getItem(SESSION_STORAGE_KEYS.FOUND_MEMBER_NUMBER)).toBe("2025000001")
    expect(push).toHaveBeenCalledWith("/find-account/result")
  })

  it("인증 코드는 숫자만 받고, 6자리가 아니면 확인하지 않는다", async () => {
    const user = userEvent.setup()
    render(<FindMemberTab />)

    await user.type(screen.getByLabelText("이름"), "김철수")
    await user.type(screen.getByLabelText("휴대폰번호"), "01012345678")
    await user.click(screen.getByRole("button", { name: "회원번호 찾기" }))
    await screen.findByRole("heading", { name: "이메일 인증" })

    await user.type(screen.getByLabelText("인증 코드"), "12a34")
    expect(screen.getByLabelText("인증 코드")).toHaveValue("1234")
    await user.click(screen.getByRole("button", { name: "인증 확인" }))

    expect(verifyMemberNoMock).not.toHaveBeenCalled()
    expect(showErrorToast).toHaveBeenCalledWith("인증 코드는 6자리여야 합니다.", "입력 오류")
  })

  it("뒤로가기는 찾기 단계로 돌아간다", async () => {
    const user = userEvent.setup()
    render(<FindMemberTab />)

    await user.type(screen.getByLabelText("이름"), "김철수")
    await user.type(screen.getByLabelText("휴대폰번호"), "01012345678")
    await user.click(screen.getByRole("button", { name: "회원번호 찾기" }))
    await user.click(await screen.findByRole("button", { name: "뒤로가기" }))

    expect(screen.getByRole("button", { name: "회원번호 찾기" })).toBeInTheDocument()
  })
})
