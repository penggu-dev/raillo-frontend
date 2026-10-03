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
})
