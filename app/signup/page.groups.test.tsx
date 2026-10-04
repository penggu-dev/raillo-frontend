import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import SignupPage from "./page"

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }))
vi.mock("@/lib/api/authentication", () => ({ signup: vi.fn() }))

// Radix 체크박스가 크기 측정에 쓰는데 jsdom에는 없다
vi.stubGlobal(
  "ResizeObserver",
  class {
    observe() {}
    unobserve() {}
    disconnect() {}
  },
)

// 입력 여러 개를 라벨 하나로 설명하는 칸 — 묶음 이름과 선택 상태가 낭독기에 전달돼야 한다
describe("회원가입 입력 묶음", () => {
  it("생년월일 선택 상자 세 개를 이름 있는 묶음으로 둔다", () => {
    render(<SignupPage />)

    const birth = screen.getByRole("group", { name: /생년월일/ })
    expect(within(birth).getAllByRole("combobox").map((el) => el.getAttribute("aria-label"))).toEqual([
      "출생 연도",
      "출생 월",
      "출생 일",
    ])
  })

  it("성별 버튼을 이름 있는 묶음으로 두고 고른 버튼의 선택 상태를 알린다", async () => {
    const user = userEvent.setup()
    render(<SignupPage />)

    const gender = within(screen.getByRole("group", { name: /성별/ }))
    const male = gender.getByRole("button", { name: "남성" })
    const female = gender.getByRole("button", { name: "여성" })
    expect(male).toHaveAttribute("aria-pressed", "false")
    expect(female).toHaveAttribute("aria-pressed", "false")

    await user.click(female)

    expect(female).toHaveAttribute("aria-pressed", "true")
    expect(male).toHaveAttribute("aria-pressed", "false")
  })

  it("제출 후 오류가 난 칸은 오류 상태와 그 오류 문구를 설명으로 가진다", async () => {
    const user = userEvent.setup()
    render(<SignupPage />)

    await user.click(screen.getByRole("button", { name: "회원가입 완료" }))
    await screen.findByText("이름은 필수입니다.")

    const fields: [HTMLElement, string][] = [
      [screen.getByLabelText(/^성명/), "이름은 필수입니다."],
      [screen.getByLabelText(/^이메일 주소/), "이메일은 필수입니다."],
      [screen.getByLabelText(/^비밀번호 \*$/), "비밀번호는 필수입니다."],
      [screen.getByLabelText(/^비밀번호 확인 \*$/), "비밀번호 확인은 필수입니다."],
      [screen.getByLabelText(/^휴대폰 번호/), "전화번호는 11자리 숫자여야 합니다."],
      [screen.getByRole("combobox", { name: "출생 연도" }), "생년월일을 모두 선택해주세요."],
      [screen.getByRole("combobox", { name: "출생 월" }), "생년월일을 모두 선택해주세요."],
      [screen.getByRole("combobox", { name: "출생 일" }), "생년월일을 모두 선택해주세요."],
      [screen.getByRole("checkbox", { name: /이용약관/ }), "이용약관에 동의해주세요."],
      [screen.getByRole("checkbox", { name: /개인정보/ }), "개인정보 수집 및 이용에 동의해주세요."],
    ]
    for (const [field, message] of fields) {
      expect(field).toHaveAttribute("aria-invalid", "true")
      expect(field).toHaveAccessibleDescription(message)
    }
    // 성별은 버튼 두 개라 묶음이 오류 문구를 설명으로 가진다
    expect(screen.getByRole("group", { name: /성별/ })).toHaveAccessibleDescription("성별을 선택해주세요.")
  })

  it("오류가 없으면 오류 상태·설명을 두지 않는다", () => {
    render(<SignupPage />)

    expect(screen.getByLabelText(/^성명/)).not.toHaveAttribute("aria-describedby")
    expect(screen.getByLabelText(/^성명/)).not.toHaveAttribute("aria-invalid", "true")
    expect(screen.getByRole("group", { name: /성별/ })).not.toHaveAttribute("aria-describedby")
  })
})
