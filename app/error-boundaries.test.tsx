import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import type { ComponentType } from "react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import RootError from "./error"
import MyPageError from "./mypage/error"
import TicketError from "./ticket/error"

const push = vi.hoisted(() => vi.fn())
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }))

type ErrorBoundary = ComponentType<{ error: Error & { digest?: string }; reset: () => void }>

// 경계마다 다른 것은 돌아갈 곳뿐 — 나머지는 같아야 한다
const boundaries: [string, ErrorBoundary, string, string][] = [
  ["app/error", RootError, "홈으로", "/"],
  ["app/mypage/error", MyPageError, "마이페이지로", "/mypage"],
  ["app/ticket/error", TicketError, "예매 내역으로", "/ticket/purchased"],
]

let consoleError: ReturnType<typeof vi.spyOn>

beforeEach(() => {
  consoleError = vi.spyOn(console, "error").mockImplementation(() => {})
})

afterEach(() => {
  consoleError.mockRestore()
  vi.clearAllMocks()
})

describe.each(boundaries)("%s", (_name, Boundary, backLabel, backHref) => {
  it("오류 안내를 보여 주고 오류를 기록한다", () => {
    const error = new Error("boom")
    render(<Boundary error={error} reset={vi.fn()} />)

    expect(screen.getByRole("heading", { level: 2, name: "오류가 발생했습니다" })).toBeInTheDocument()
    expect(screen.getByText("일시적인 오류입니다. 잠시 후 다시 시도해주세요.")).toBeInTheDocument()
    expect(consoleError).toHaveBeenCalledWith(error)
  })

  it("다시 시도는 reset을, 돌아갈 곳 버튼은 해당 화면으로 이동한다", async () => {
    const user = userEvent.setup()
    const reset = vi.fn()
    render(<Boundary error={new Error("boom")} reset={reset} />)

    await user.click(screen.getByRole("button", { name: "다시 시도" }))
    expect(reset).toHaveBeenCalledTimes(1)

    await user.click(screen.getByRole("button", { name: backLabel }))
    expect(push).toHaveBeenCalledWith(backHref)
  })
})
