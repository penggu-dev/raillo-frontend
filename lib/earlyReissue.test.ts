import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { EARLY_REISSUE_SCRIPT, takeEarlyReissue } from "./earlyReissue"

const fetchMock = vi.fn()
const runScript = () => new Function(EARLY_REISSUE_SCRIPT)()

beforeEach(() => {
  vi.stubGlobal("fetch", fetchMock)
  fetchMock.mockResolvedValue(new Response("{}"))
})

afterEach(() => {
  takeEarlyReissue()
  document.cookie = "has_session=; path=/; max-age=0"
  fetchMock.mockReset()
  vi.unstubAllGlobals()
})

describe("첫 페인트 전 토큰 재발급", () => {
  it("세션 쿠키가 있으면 재발급을 시작하고, 그 응답은 한 번만 넘겨준다", async () => {
    document.cookie = "has_session=1; path=/"

    runScript()

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringMatching(/\/auth\/reissue$/),
      expect.objectContaining({ method: "POST", credentials: "include" }),
    )
    await expect(takeEarlyReissue()).resolves.toBeInstanceOf(Response)
    expect(takeEarlyReissue()).toBeNull()
  })

  it("세션 쿠키가 없으면(비로그인) 보내지 않는다", () => {
    runScript()

    expect(fetchMock).not.toHaveBeenCalled()
    expect(takeEarlyReissue()).toBeNull()
  })
})
