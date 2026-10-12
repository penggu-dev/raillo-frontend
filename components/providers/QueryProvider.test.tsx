import { renderHook, waitFor } from "@testing-library/react"
import { useQuery } from "@tanstack/react-query"
import { describe, expect, it, vi } from "vitest"
import { ApiError } from "@/lib/api"
import { QueryProvider } from "./QueryProvider"

vi.mock("@/stores/auth-store", () => ({ useAuthStore: () => () => {} }))

const apiError = (status: number) => new ApiError("실패", "E", "", null, status)

// 실패가 확정될 때까지의 조회 함수 호출 수
const callsUntilError = async (key: string, error: Error) => {
  const queryFn = vi.fn(async () => {
    throw error
  })
  const { result } = renderHook(() => useQuery({ queryKey: [key], queryFn }), { wrapper: QueryProvider })
  await waitFor(() => expect(result.current.isError).toBe(true), { timeout: 3000 })
  return queryFn.mock.calls.length
}

describe("조회 재시도 기본값", () => {
  it.each([400, 401, 404])("%i 요청 오류는 다시 보내도 같으므로 재시도하지 않는다", async (status) => {
    expect(await callsUntilError(`client-${status}`, apiError(status))).toBe(1)
  })

  it.each([
    ["서버 오류(500)", apiError(500)],
    ["네트워크 오류(상태 0)", apiError(0)],
    ["ApiError가 아닌 오류", new Error("unknown")],
  ])("%s는 한 번만 다시 시도한다", async (name, error) => {
    expect(await callsUntilError(name, error)).toBe(2)
  })
})
