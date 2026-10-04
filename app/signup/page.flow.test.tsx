import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { signup } from "@/lib/api/authentication"
import { LOCAL_STORAGE_KEYS } from "@/constants/storageKeys"
import SignupPage from "./page"

const push = vi.hoisted(() => vi.fn())
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }))
vi.mock("@/lib/api/authentication", () => ({ signup: vi.fn() }))

const signupMock = vi.mocked(signup)

// Radix 체크박스·선택 상자가 쓰는 브라우저 기능 — jsdom에는 없다
vi.stubGlobal(
  "ResizeObserver",
  class {
    observe() {}
    unobserve() {}
    disconnect() {}
  },
)
Element.prototype.hasPointerCapture = () => false
Element.prototype.releasePointerCapture = () => {}
Element.prototype.scrollIntoView = () => {}

type User = ReturnType<typeof userEvent.setup>

const choose = async (user: User, trigger: string, option: string) => {
  await user.click(screen.getByRole("combobox", { name: trigger }))
  await user.click(await screen.findByRole("option", { name: option }))
}

const fillValidForm = async (user: User) => {
  await user.type(screen.getByLabelText(/성명/), "홍길동")
  await user.type(screen.getByLabelText(/이메일 주소/), "rail@example.com")
  await user.type(screen.getByLabelText(/^비밀번호 \*$/), "abcd1234!")
  await user.type(screen.getByLabelText(/^비밀번호 확인 \*$/), "abcd1234!")
  await user.type(screen.getByLabelText(/휴대폰 번호/), "01012345678")
  await choose(user, "출생 연도", "2000년")
  await choose(user, "출생 월", "2월")
  await choose(user, "출생 일", "9일")
  await user.click(screen.getByRole("button", { name: "여성" }))
  await user.click(screen.getByRole("checkbox", { name: /이용약관/ }))
  await user.click(screen.getByRole("checkbox", { name: /개인정보/ }))
}

beforeEach(() => {
  vi.clearAllMocks()
  localStorage.clear()
})

// 입력 묶음으로 나누기 전 동작을 고정하는 특성 테스트
describe("회원가입 흐름", () => {
  it("빈 채로 제출하면 칸마다 필수 안내를 보여 주고 가입을 요청하지 않는다", async () => {
    const user = userEvent.setup()
    render(<SignupPage />)

    await user.click(screen.getByRole("button", { name: "회원가입 완료" }))

    for (const message of [
      "이름은 필수입니다.",
      "이메일은 필수입니다.",
      "비밀번호는 필수입니다.",
      "비밀번호 확인은 필수입니다.",
      "전화번호는 11자리 숫자여야 합니다.",
      "생년월일을 모두 선택해주세요.",
      "성별을 선택해주세요.",
      "이용약관에 동의해주세요.",
      "개인정보 수집 및 이용에 동의해주세요.",
    ]) {
      expect(await screen.findByText(message)).toBeInTheDocument()
    }
    expect(signupMock).not.toHaveBeenCalled()
  })

  it("휴대폰 번호는 입력하는 대로 하이픈을 넣고 11자리까지만 받는다", async () => {
    const user = userEvent.setup()
    render(<SignupPage />)

    await user.type(screen.getByLabelText(/휴대폰 번호/), "010123456789")

    expect(screen.getByLabelText(/휴대폰 번호/)).toHaveValue("010-1234-5678")
  })

  it("비밀번호 두 칸은 각자의 보기 버튼으로 보이고 숨긴다", async () => {
    const user = userEvent.setup()
    render(<SignupPage />)
    const password = screen.getByLabelText(/^비밀번호 \*$/)
    const confirm = screen.getByLabelText(/^비밀번호 확인 \*$/)

    await user.click(screen.getByRole("button", { name: "비밀번호 보기" }))

    expect(password).toHaveAttribute("type", "text")
    expect(confirm).toHaveAttribute("type", "password")
    expect(screen.getByRole("button", { name: "비밀번호 숨기기" })).toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: "비밀번호 확인 보기" }))
    expect(confirm).toHaveAttribute("type", "text")
  })

  it("비밀번호 확인을 입력하면 일치 여부를 바로 알린다", async () => {
    const user = userEvent.setup()
    render(<SignupPage />)

    await user.type(screen.getByLabelText(/^비밀번호 \*$/), "abcd1234!")
    await user.type(screen.getByLabelText(/^비밀번호 확인 \*$/), "abcd1234")
    expect(screen.getByText("비밀번호가 일치하지 않습니다.")).toBeInTheDocument()

    await user.type(screen.getByLabelText(/^비밀번호 확인 \*$/), "!")
    expect(screen.getByText("비밀번호가 일치합니다.")).toBeInTheDocument()
  })

  it("출생 일은 연·월을 고른 뒤에 열리고 그 달의 날 수만큼 보여 주며, 연도를 바꾸면 월·일을 비운다", async () => {
    const user = userEvent.setup()
    render(<SignupPage />)
    const day = screen.getByRole("combobox", { name: "출생 일" })

    expect(day).toBeDisabled()

    await choose(user, "출생 연도", "2024년")
    expect(day).toBeDisabled()
    await choose(user, "출생 월", "2월")
    expect(day).toBeEnabled()

    await user.click(day)
    expect(await screen.findAllByRole("option")).toHaveLength(29)
    await user.click(screen.getByRole("option", { name: "29일" }))
    expect(day).toHaveTextContent("29일")

    await choose(user, "출생 연도", "2023년")
    expect(screen.getByRole("combobox", { name: "출생 월" })).toHaveTextContent("월")
    expect(day).toHaveTextContent("일")
    expect(day).toBeDisabled()
  })

  it("모두 입력해 제출하면 하이픈 없는 번호·YYYY-MM-DD 생년월일로 가입을 요청하고, 회원번호를 저장한 뒤 완료 화면으로 간다", async () => {
    signupMock.mockResolvedValueOnce({ memberNo: "202610040001" } as never)
    const user = userEvent.setup()
    render(<SignupPage />)

    await fillValidForm(user)
    await user.click(screen.getByRole("button", { name: "회원가입 완료" }))

    await waitFor(() => expect(push).toHaveBeenCalledWith("/signup/complete"))
    expect(signupMock).toHaveBeenCalledWith({
      name: "홍길동",
      phoneNumber: "01012345678",
      password: "abcd1234!",
      email: "rail@example.com",
      birthDate: "2000-02-09",
      gender: "F",
    })
    expect(localStorage.getItem(LOCAL_STORAGE_KEYS.SIGNUP_MEMBER_NUMBER)).toBe("202610040001")
  })

  it("가입 요청이 실패하면 완료 화면으로 가지 않고 다시 제출할 수 있다", async () => {
    signupMock.mockRejectedValueOnce(new Error("이미 가입된 이메일입니다."))
    const user = userEvent.setup()
    render(<SignupPage />)

    await fillValidForm(user)
    await user.click(screen.getByRole("button", { name: "회원가입 완료" }))

    await waitFor(() => expect(signupMock).toHaveBeenCalledTimes(1))
    expect(await screen.findByRole("button", { name: "회원가입 완료" })).toBeEnabled()
    expect(push).not.toHaveBeenCalled()
    expect(localStorage.getItem(LOCAL_STORAGE_KEYS.SIGNUP_MEMBER_NUMBER)).toBeNull()
  })
})
