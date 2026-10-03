import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"
import GuestTicketSearchPage from "./page"

const toast = vi.hoisted(() => vi.fn())
vi.mock("@/hooks/useToast", () => ({ useToast: () => ({ toast }) }))

afterEach(() => {
  vi.clearAllMocks()
})

describe("비회원 승차권 확인 화면", () => {
  it("빈 항목이 있으면 조회하지 않고 안내한다", async () => {
    const user = userEvent.setup()
    render(<GuestTicketSearchPage />)

    await user.type(screen.getByLabelText("이름"), "김철수")
    await user.type(screen.getByLabelText("휴대폰 번호"), "01012345678")
    await user.click(screen.getByRole("button", { name: "비회원 승차권 확인" }))

    expect(toast).toHaveBeenCalledWith(
      expect.objectContaining({ title: "입력 오류", description: "모든 항목을 입력해주세요." }),
    )
  })

  it("비밀번호는 5자리까지만 받는다", async () => {
    const user = userEvent.setup()
    render(<GuestTicketSearchPage />)

    const password = screen.getByLabelText("비밀번호")
    await user.type(password, "1234567")

    expect(password).toHaveValue("12345")
  })
})
