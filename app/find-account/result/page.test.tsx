import { StrictMode, type ReactNode } from "react"
import { render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { SESSION_STORAGE_KEYS } from "@/constants/storageKeys"
import FindAccountResultPage from "./page"

const navigation = vi.hoisted(() => ({ push: vi.fn() }))
vi.mock("next/navigation", () => ({ useRouter: () => navigation }))

// 헤더·푸터 등 레이아웃은 이 흐름과 무관
vi.mock("@/components/layout/PageLayout", () => ({
  default: ({ children }: { children: ReactNode }) => <>{children}</>,
}))

beforeEach(() => {
  vi.clearAllMocks()
  sessionStorage.clear()
})

describe("회원번호 찾기 결과", () => {
  it("개발 모드(StrictMode)에서도 찾은 회원번호를 보여 주고 찾기 화면으로 돌려보내지 않는다", () => {
    sessionStorage.setItem(SESSION_STORAGE_KEYS.FOUND_MEMBER_NUMBER, "M20260926001")

    render(
      <StrictMode>
        <FindAccountResultPage />
      </StrictMode>,
    )

    expect(screen.getByText("M20260926001")).toBeInTheDocument()
    expect(navigation.push).not.toHaveBeenCalled()
  })

  it("보여 준 뒤에는 저장해 둔 회원번호를 지운다 (새로고침하면 다시 볼 수 없음)", () => {
    sessionStorage.setItem(SESSION_STORAGE_KEYS.FOUND_MEMBER_NUMBER, "M20260926001")

    render(<FindAccountResultPage />)

    expect(sessionStorage.getItem(SESSION_STORAGE_KEYS.FOUND_MEMBER_NUMBER)).toBeNull()
  })

  it("찾은 회원번호 없이 들어오면 찾기 화면으로 보낸다", () => {
    render(<FindAccountResultPage />)

    expect(navigation.push).toHaveBeenCalledWith("/find-account")
  })
})
