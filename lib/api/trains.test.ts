import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { searchTrains, TRAIN_SEARCH_PAGE_SIZE } from "./trains"
import type { TrainSearchRequest, TrainSearchResponse } from "@/types/trainType"

const request: TrainSearchRequest = {
  departureStationId: 1,
  arrivalStationId: 2,
  operationDate: "2099-12-31",
  passengerCount: 1,
  departureHour: "00",
}

const slice: TrainSearchResponse = {
  content: [],
  currentPage: 0,
  pageSize: TRAIN_SEARCH_PAGE_SIZE,
  numberOfElements: 0,
  hasNext: false,
  hasPrevious: false,
  first: true,
  last: true,
}

const fetchMock = vi.fn()

const respond = (body: unknown, status = 200) =>
  fetchMock.mockResolvedValueOnce({
    status,
    ok: status >= 200 && status < 300,
    text: async () => JSON.stringify(body),
  })

const lastCall = () => {
  const [url, init] = fetchMock.mock.calls.at(-1) as [string, RequestInit]
  return { url: new URL(url, "http://localhost"), init }
}

beforeEach(() => {
  vi.stubGlobal("fetch", fetchMock)
})

afterEach(() => {
  fetchMock.mockReset()
  vi.unstubAllGlobals()
})

describe("searchTrains", () => {
  it("페이지를 지정하지 않으면 page=0, size=20을 쿼리로 보낸다", async () => {
    respond({ result: slice })

    await searchTrains(request)

    const { url, init } = lastCall()
    expect(url.pathname).toMatch(/\/api\/v1\/trains\/search$/)
    expect(url.searchParams.get("page")).toBe("0")
    expect(url.searchParams.get("size")).toBe("20")
    expect(init.method).toBe("POST")
  })

  it("검색 조건은 쿼리가 아니라 본문으로 보낸다", async () => {
    respond({ result: slice })

    await searchTrains(request, { page: 1 })

    const { url, init } = lastCall()
    expect(JSON.parse(String(init.body))).toEqual(request)
    expect([...url.searchParams.keys()].sort()).toEqual(["page", "size"])
  })

  it("지정한 page와 size를 쿼리로 보낸다", async () => {
    respond({ result: slice })

    await searchTrains(request, { page: 2, size: 10 })

    const { url } = lastCall()
    expect(url.searchParams.get("page")).toBe("2")
    expect(url.searchParams.get("size")).toBe("10")
  })

  it("취소 신호를 요청에 넘긴다", async () => {
    respond({ result: slice })
    const controller = new AbortController()

    await searchTrains(request, { page: 0, signal: controller.signal })

    expect(lastCall().init.signal).toBe(controller.signal)
  })

  it("응답의 Slice 페이지 정보를 그대로 돌려준다", async () => {
    const page = { ...slice, currentPage: 2, numberOfElements: 13, hasPrevious: true, first: false }
    respond({ result: page })

    await expect(searchTrains(request, { page: 2 })).resolves.toEqual(page)
  })

  it("result가 없으면 오류를 던진다", async () => {
    respond({ message: "ok" })

    await expect(searchTrains(request)).rejects.toThrow("열차 조회에 실패했습니다.")
  })
})
