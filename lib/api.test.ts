import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { api, ApiError, UNAUTHORIZED_ERROR_CODE } from "./api"
import { useAuthStore } from "@/stores/auth-store"

type FakeResponse = { status: number; ok: boolean; text: () => Promise<string> }

const fetchMock = vi.fn<(url: string, init: RequestInit) => Promise<FakeResponse>>()
const reply = (status: number, body?: unknown): FakeResponse => ({
  status,
  ok: status >= 200 && status < 300,
  text: async () => (body === undefined ? "" : JSON.stringify(body)),
})
const caught = async (promise: Promise<unknown>): Promise<ApiError> => {
  try {
    await promise
  } catch (error) {
    if (error instanceof ApiError) return error
    throw error
  }
  throw new Error("오류가 나지 않음")
}

const refreshTokens = vi.fn<() => Promise<boolean>>()
const removeTokens = vi.fn()

beforeEach(() => {
  vi.stubGlobal("fetch", fetchMock)
  useAuthStore.setState({ accessToken: null, tokenExpiresIn: null, refreshTokens, removeTokens })
})

afterEach(() => {
  fetchMock.mockReset()
  refreshTokens.mockReset()
  removeTokens.mockReset()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe("api 성공 응답", () => {
  it("응답 본문을 그대로 돌려준다", async () => {
    fetchMock.mockResolvedValueOnce(reply(200, { message: "ok", result: { id: 1 } }))

    await expect(api.get<{ id: number }>("/items/1")).resolves.toEqual({ message: "ok", result: { id: 1 } })
  })

  it("성공 응답이 객체가 아니면 빈 객체를 돌려준다", async () => {
    fetchMock.mockResolvedValueOnce(reply(200, null))

    await expect(api.get("/items")).resolves.toEqual({})
  })

  it("204는 빈 객체를 돌려준다", async () => {
    fetchMock.mockResolvedValueOnce(reply(204))

    await expect(api.delete("/items/1")).resolves.toEqual({})
  })

  it("유효한 토큰이 있으면 Authorization 헤더를 붙이고 쿠키를 포함한다", async () => {
    useAuthStore.setState({ accessToken: "token", tokenExpiresIn: Date.now() + 60_000 })
    fetchMock.mockResolvedValueOnce(reply(200, { result: null }))

    await api.post("/items", { name: "a" })

    const [url, init] = fetchMock.mock.calls[0]
    expect(url.endsWith("/items")).toBe(true)
    expect(init.headers).toMatchObject({ Authorization: "Bearer token", "Content-Type": "application/json" })
    expect(init.credentials).toBe("include")
    expect(init.body).toBe(JSON.stringify({ name: "a" }))
  })
})

describe("api 오류 응답", () => {
  it("서버 오류 형식이면 오류 코드·시각·상세·상태를 담는다", async () => {
    const details = { field: "email" }
    fetchMock.mockResolvedValueOnce(reply(400, { errorMessage: "잘못된 요청", errorCode: "INVALID", timestamp: "2026-09-18T00:00:00Z", details }))

    const error = await caught(api.get("/items"))

    expect(error).toMatchObject({ message: "잘못된 요청", errorCode: "INVALID", timestamp: "2026-09-18T00:00:00Z", status: 400 })
    expect(error.details).toEqual(details)
  })

  it("오류 코드·상세가 없으면 UNKNOWN_ERROR와 null로 채운다", async () => {
    fetchMock.mockResolvedValueOnce(reply(409, { errorMessage: "중복" }))

    const error = await caught(api.get("/items"))

    expect(error).toMatchObject({ message: "중복", errorCode: "UNKNOWN_ERROR", details: null, status: 409 })
    expect(error.timestamp).not.toBe("")
  })

  it("message만 있으면 그 문구로 UNKNOWN_ERROR를 만든다", async () => {
    fetchMock.mockResolvedValueOnce(reply(500, { message: "서버 점검 중" }))

    await expect(caught(api.get("/items"))).resolves.toMatchObject({ message: "서버 점검 중", errorCode: "UNKNOWN_ERROR", details: null, status: 500 })
  })

  it("본문이 없으면 기본 문구를 쓴다", async () => {
    fetchMock.mockResolvedValueOnce(reply(502))

    await expect(caught(api.get("/items"))).resolves.toMatchObject({ message: "API 요청에 실패했습니다.", errorCode: "UNKNOWN_ERROR", status: 502 })
  })

  // JSON은 null·숫자·문자열도 될 수 있다 — 필드를 읽다 TypeError가 나면 안 된다
  it.each([
    ["null", null],
    ["숫자", 500],
    ["문자열", "서버 오류"],
  ])("본문이 객체가 아니면(%s) 기본 문구를 쓴다", async (_, body) => {
    fetchMock.mockResolvedValueOnce(reply(500, body))

    await expect(caught(api.get("/items"))).resolves.toMatchObject({ message: "API 요청에 실패했습니다.", errorCode: "UNKNOWN_ERROR", status: 500 })
  })

  it("오류 문구가 문자열이 아니면 기본 문구를 쓴다", async () => {
    fetchMock.mockResolvedValueOnce(reply(500, { errorMessage: 500, message: { ko: "오류" } }))

    await expect(caught(api.get("/items"))).resolves.toMatchObject({ message: "API 요청에 실패했습니다.", errorCode: "UNKNOWN_ERROR", status: 500 })
  })

  it("서버에 닿지 못하면 NETWORK_ERROR(상태 0)로 바꾼다", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => {})
    fetchMock.mockRejectedValueOnce(new TypeError("Failed to fetch"))

    await expect(caught(api.get("/items"))).resolves.toMatchObject({ errorCode: "NETWORK_ERROR", status: 0 })
  })
})

describe("api 401 처리", () => {
  it("토큰 재발급에 성공하면 한 번만 다시 요청한다", async () => {
    refreshTokens.mockResolvedValueOnce(true)
    fetchMock.mockResolvedValueOnce(reply(401, { errorMessage: "만료" })).mockResolvedValueOnce(reply(200, { result: "ok" }))

    await expect(api.get<string>("/me")).resolves.toEqual({ result: "ok" })
    expect(refreshTokens).toHaveBeenCalledTimes(1)
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it("다시 요청해도 401이면 더 재발급하지 않고 서버 오류를 그대로 전달한다", async () => {
    refreshTokens.mockResolvedValueOnce(true)
    fetchMock.mockResolvedValueOnce(reply(401, { errorMessage: "만료" })).mockResolvedValueOnce(reply(401, { errorMessage: "권한 없음", errorCode: "FORBIDDEN_TOKEN" }))

    await expect(caught(api.get("/me"))).resolves.toMatchObject({ message: "권한 없음", errorCode: "FORBIDDEN_TOKEN", status: 401 })
    expect(refreshTokens).toHaveBeenCalledTimes(1)
  })

  it("재발급에 실패하면 토큰을 지우고 세션 만료 오류를 낸다", async () => {
    refreshTokens.mockResolvedValueOnce(false)
    fetchMock.mockResolvedValueOnce(reply(401, { errorMessage: "만료" }))

    await expect(caught(api.get("/me"))).resolves.toMatchObject({ errorCode: UNAUTHORIZED_ERROR_CODE, status: 401, details: null })
    expect(removeTokens).toHaveBeenCalledTimes(1)
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })
})
