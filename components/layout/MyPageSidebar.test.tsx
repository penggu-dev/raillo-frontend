import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import MyPageSidebar from "./MyPageSidebar"

describe("MyPageSidebar 회원 이름", () => {
  it("이름이 있으면 '이름 회원님'으로 표시한다", () => {
    render(<MyPageSidebar memberInfo={{ name: "홍길동" }} />)
    expect(screen.getByRole("heading", { name: "홍길동 회원님" })).toBeInTheDocument()
  })

  it("이름이 없으면(조회 실패 등) '회원 회원님' 대신 '회원님'으로 표시한다", () => {
    render(<MyPageSidebar />)
    expect(screen.getByRole("heading", { name: "회원님" })).toBeInTheDocument()
    expect(screen.queryByText(/회원 회원님/)).not.toBeInTheDocument()
  })

  it("조회 중이면 이름 대신 로딩 안내를 보여 준다", () => {
    render(<MyPageSidebar isLoading />)
    expect(screen.getByRole("status")).toHaveTextContent("회원 정보를 불러오는 중")
    expect(screen.queryByRole("heading", { name: /회원님/ })).not.toBeInTheDocument()
  })
})
