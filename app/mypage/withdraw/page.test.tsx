import { act, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import type { ReactNode } from "react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { deleteAccount } from "@/lib/api/members"
import { useAuthStore } from "@/stores/auth-store"
import WithdrawPage from "./page"

const router = vi.hoisted(() => ({ push: vi.fn(), back: vi.fn() }))
vi.mock("next/navigation", () => ({ useRouter: () => router }))
vi.mock("@/lib/api/members", () => ({ deleteAccount: vi.fn() }))
vi.mock("@/components/auth/AuthGuard", () => ({ default: ({ children }: { children: ReactNode }) => <>{children}</> }))

// Radix 체크박스가 크기 측정에 쓰는데 jsdom에는 없다
vi.stubGlobal(
  "ResizeObserver",
  class {
    observe() {}
    unobserve() {}
    disconnect() {}
  },
)

const deleteAccountMock = vi.mocked(deleteAccount)
const removeTokens = vi.fn()

beforeEach(() => {
  deleteAccountMock.mockResolvedValue(undefined)
  useAuthStore.setState({ removeTokens })
})

afterEach(() => {
  vi.clearAllMocks()
  vi.useRealTimers()
})

type User = ReturnType<typeof userEvent.setup>

const withdrawButton = () => screen.getByRole("button", { name: "회원탈퇴" })

const fillAll = async (user: User) => {
  await user.type(screen.getByLabelText("확인 문구 입력"), "회원탈퇴")
  await user.click(screen.getByRole("checkbox", { name: /개인정보 삭제에 동의합니다/ }))
  await user.click(screen.getByRole("checkbox", { name: /서비스 이용 종료에 동의합니다/ }))
  await user.click(screen.getByRole("checkbox", { name: /탈퇴 후 복구 불가능함을 확인합니다/ }))
}

describe("회원탈퇴 화면", () => {
  it("확인 문구와 필수 동의 3개를 모두 채워야 탈퇴 버튼이 열린다", async () => {
    const user = userEvent.setup()
    render(<WithdrawPage />)

    expect(withdrawButton()).toBeDisabled()

    await user.type(screen.getByLabelText("확인 문구 입력"), "회원 탈퇴")
    await user.click(screen.getByRole("checkbox", { name: /개인정보 삭제에 동의합니다/ }))
    await user.click(screen.getByRole("checkbox", { name: /서비스 이용 종료에 동의합니다/ }))
    await user.click(screen.getByRole("checkbox", { name: /탈퇴 후 복구 불가능함을 확인합니다/ }))
    // 문구가 정확히 일치하지 않으면 닫혀 있다
    expect(withdrawButton()).toBeDisabled()

    await user.clear(screen.getByLabelText("확인 문구 입력"))
    await user.type(screen.getByLabelText("확인 문구 입력"), "회원탈퇴")
    expect(withdrawButton()).toBeEnabled()

    await user.click(screen.getByRole("checkbox", { name: /서비스 이용 종료에 동의합니다/ }))
    expect(withdrawButton()).toBeDisabled()
  })

  it("탈퇴하면 토큰을 지우고 완료 화면을 보여 준 뒤 3초 뒤 홈으로 이동한다", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    render(<WithdrawPage />)

    await fillAll(user)
    await user.click(withdrawButton())

    expect(deleteAccountMock).toHaveBeenCalledTimes(1)
    expect(await screen.findByRole("heading", { name: "회원탈퇴 완료" })).toBeInTheDocument()
    expect(removeTokens).toHaveBeenCalledTimes(1)
    expect(router.push).not.toHaveBeenCalled()

    act(() => {
      vi.advanceTimersByTime(3000)
    })
    expect(router.push).toHaveBeenCalledWith("/")
  })

  it("탈퇴에 실패하면 사유를 보여 주고 토큰은 그대로 둔다", async () => {
    deleteAccountMock.mockRejectedValueOnce(new Error("진행 중인 예약이 있어 탈퇴할 수 없습니다."))
    const user = userEvent.setup()
    render(<WithdrawPage />)

    await fillAll(user)
    await user.click(withdrawButton())

    expect(await screen.findByText("진행 중인 예약이 있어 탈퇴할 수 없습니다.")).toBeInTheDocument()
    expect(removeTokens).not.toHaveBeenCalled()
    expect(withdrawButton()).toBeEnabled()
  })
})
