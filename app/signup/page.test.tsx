import { render, screen } from "@testing-library/react"
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

describe("회원가입 화면", () => {
  it("형식이 틀린 이메일로 제출해도 브라우저 검증 대신 앱 오류 문구를 모두 보여 준다", async () => {
    const user = userEvent.setup()
    render(<SignupPage />)

    await user.type(screen.getByLabelText(/이메일 주소/), "rail")
    await user.click(screen.getByRole("button", { name: "회원가입 완료" }))

    expect(await screen.findByText("올바른 이메일 형식이 아닙니다.")).toBeInTheDocument()
    expect(screen.getByText("이름은 필수입니다.")).toBeInTheDocument()
  })
})
