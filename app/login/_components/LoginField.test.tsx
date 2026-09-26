import { StrictMode } from "react"
import { render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { LOCAL_STORAGE_KEYS, SESSION_STORAGE_KEYS } from "@/constants/storageKeys"
import LoginField from "./LoginField"

vi.mock("@/lib/api/authentication", () => ({ login: vi.fn() }))
vi.mock("@/hooks/useToast", () => ({ useToast: () => ({ toast: vi.fn() }) }))

const memberNumberInput = () => screen.getByLabelText(/회원번호/) as HTMLInputElement

const renderLogin = () =>
  render(
    <StrictMode>
      <LoginField />
    </StrictMode>,
  )

beforeEach(() => {
  sessionStorage.clear()
  localStorage.clear()
})

describe("로그인 회원번호 자동 입력", () => {
  it("회원번호 찾기에서 넘어오면 찾은 회원번호로 칸을 채우고 저장소에서 지운다", () => {
    sessionStorage.setItem(SESSION_STORAGE_KEYS.FOUND_MEMBER_NUMBER, "M20260926001")

    renderLogin()

    expect(memberNumberInput().value).toBe("M20260926001")
    expect(sessionStorage.getItem(SESSION_STORAGE_KEYS.FOUND_MEMBER_NUMBER)).toBeNull()
  })

  it("회원가입 완료에서 넘어오면 기존처럼 가입한 회원번호로 채운다", () => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.SIGNUP_MEMBER_NUMBER, "M20260926002")

    renderLogin()

    expect(memberNumberInput().value).toBe("M20260926002")
    expect(localStorage.getItem(LOCAL_STORAGE_KEYS.SIGNUP_MEMBER_NUMBER)).toBeNull()
  })

  it("둘 다 있으면 방금 찾은 회원번호를 쓰고 둘 다 지운다", () => {
    sessionStorage.setItem(SESSION_STORAGE_KEYS.FOUND_MEMBER_NUMBER, "M20260926001")
    localStorage.setItem(LOCAL_STORAGE_KEYS.SIGNUP_MEMBER_NUMBER, "M20260926002")

    renderLogin()

    expect(memberNumberInput().value).toBe("M20260926001")
    expect(sessionStorage.getItem(SESSION_STORAGE_KEYS.FOUND_MEMBER_NUMBER)).toBeNull()
    expect(localStorage.getItem(LOCAL_STORAGE_KEYS.SIGNUP_MEMBER_NUMBER)).toBeNull()
  })

  it("넘겨받은 회원번호가 없으면 비워 둔다", () => {
    renderLogin()

    expect(memberNumberInput().value).toBe("")
  })
})
