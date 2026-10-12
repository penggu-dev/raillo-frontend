import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { EARLY_REISSUE_SCRIPT } from "@/lib/earlyReissue"
import { useAuthStore } from "./auth-store"

const fetchMock = vi.fn()
const tokenResponse = () =>
  new Response(JSON.stringify({ result: { accessToken: "early-token", accessTokenExpiresIn: 3600 } }), { status: 200 })

// 첫 페인트 전 스크립트를 실행한 상태를 만든다 — 그 fetch 응답은 earlyResponse가 정한다
const startEarlyReissue = (earlyResponse: Promise<Response>) => {
  document.cookie = "has_session=1; path=/"
  fetchMock.mockReturnValueOnce(earlyResponse)
  new Function(EARLY_REISSUE_SCRIPT)()
  fetchMock.mockClear()
}

beforeEach(() => {
  vi.stubGlobal("fetch", fetchMock)
  vi.spyOn(console, "warn").mockImplementation(() => {})
  useAuthStore.setState({ isInitialized: false, isAuthenticated: false, accessToken: null, tokenExpiresIn: null })
})

afterEach(() => {
  document.cookie = "has_session=; path=/; max-age=0"
  fetchMock.mockReset()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe("초기화가 첫 페인트 전 재발급을 넘겨받음", () => {
  it("앞서 시작한 재발급이 있으면 새로 요청하지 않고 그 응답으로 토큰을 받는다", async () => {
    startEarlyReissue(Promise.resolve(tokenResponse()))

    await useAuthStore.getState().initialize()

    expect(fetchMock).not.toHaveBeenCalled()
    expect(useAuthStore.getState()).toMatchObject({ isInitialized: true, isAuthenticated: true, accessToken: "early-token" })
  })

  it("앞선 재발급이 401이면 두 번째 경로를 요청하고, 그것도 실패하면 토큰을 지운다", async () => {
    startEarlyReissue(Promise.resolve(new Response("{}", { status: 401 })))
    fetchMock.mockResolvedValueOnce(new Response("{}", { status: 401 }))

    await useAuthStore.getState().initialize()

    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(fetchMock).toHaveBeenCalledWith(expect.stringMatching(/\/api\/v1\/auth\/reissue$/), expect.anything())
    expect(useAuthStore.getState()).toMatchObject({ isInitialized: true, isAuthenticated: false, accessToken: null })
  })

  it("앞선 재발급이 네트워크 오류여도 두 번째 경로로 이어간다", async () => {
    startEarlyReissue(Promise.reject(new TypeError("Failed to fetch")))
    fetchMock.mockResolvedValueOnce(tokenResponse())

    await useAuthStore.getState().initialize()

    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(useAuthStore.getState().accessToken).toBe("early-token")
  })

  it("앞서 시작한 재발급이 없으면(비로그인) 지금처럼 두 경로를 차례로 요청한다", async () => {
    fetchMock.mockResolvedValue(new Response("{}", { status: 401 }))

    await useAuthStore.getState().initialize()

    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(useAuthStore.getState().isAuthenticated).toBe(false)
  })
})
