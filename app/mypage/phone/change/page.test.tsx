import { render, screen } from "@testing-library/react"
import type { ReactNode } from "react"
import { describe, expect, it, vi } from "vitest"
import PhoneChangePage from "./page"

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }))
vi.mock("@/hooks/useToast", () => ({ useToast: () => ({ toast: vi.fn() }) }))
vi.mock("@/lib/api/authentication", () => ({
  sendMemberEmailVerification: vi.fn(),
  verifyMemberEmail: vi.fn(),
}))
vi.mock("@/lib/api/members", () => ({ updatePhoneNumber: vi.fn() }))
vi.mock("@/hooks/useUser", () => ({ useGetMemberInfo: () => ({ data: null, isLoading: false }) }))
vi.mock("@/components/layout/MyPageSidebar", () => ({ default: () => null }))
vi.mock("@/components/auth/AuthGuard", () => ({ default: ({ children }: { children: ReactNode }) => <>{children}</> }))

describe("휴대폰 번호 변경 화면", () => {
  it("인증 전에는 변경 폼을 그리지 않는다", () => {
    render(<PhoneChangePage />)

    expect(screen.getByRole("button", { name: "인증코드 발송" })).toBeInTheDocument()
    expect(screen.queryByPlaceholderText("010")).not.toBeInTheDocument()
    expect(screen.getByRole("heading", { level: 1, name: "휴대폰 번호 변경" })).toBeInTheDocument()
  })
})
