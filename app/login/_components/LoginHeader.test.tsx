import { render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import LoginHeader from "./LoginHeader"

const navigation = vi.hoisted(() => ({ params: new URLSearchParams() }))
vi.mock("next/navigation", () => ({ useSearchParams: () => navigation.params }))

beforeEach(() => {
  navigation.params = new URLSearchParams()
})

describe("로그인 화면 머리", () => {
  it("돌아갈 화면(redirectTo)이 없으면 제목만 보여 준다", () => {
    render(<LoginHeader />)

    expect(screen.getByRole("heading", { level: 1, name: "로그인" })).toBeInTheDocument()
    expect(screen.queryByText("로그인이 필요한 서비스입니다.")).not.toBeInTheDocument()
  })

  it("로그인이 필요한 화면에서 넘어오면 안내를 보여 준다", () => {
    navigation.params = new URLSearchParams("redirectTo=%2Fticket%2Fhistory")
    render(<LoginHeader />)

    expect(screen.getByRole("heading", { level: 1, name: "로그인" })).toBeInTheDocument()
    expect(screen.getByRole("note")).toHaveTextContent("로그인이 필요한 서비스입니다.")
  })
})
