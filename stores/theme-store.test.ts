import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

type Listener = () => void

// jsdom에는 matchMedia가 없어 운영체제 다크 모드 설정을 흉내 내는 목을 둔다
const mockMatchMedia = (initialDark: boolean) => {
  let dark = initialDark
  const listeners = new Set<Listener>()
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    get matches() {
      return query === "(prefers-color-scheme: dark)" ? dark : false
    },
    media: query,
    addEventListener: (_: string, listener: Listener) => listeners.add(listener),
    removeEventListener: (_: string, listener: Listener) => listeners.delete(listener),
  })) as unknown as typeof window.matchMedia
  return {
    setDark: (next: boolean) => {
      dark = next
      listeners.forEach((listener) => listener())
    },
    listenerCount: () => listeners.size,
  }
}

const loadStore = async () => {
  vi.resetModules()
  return (await import("./theme-store")).useThemeStore
}

describe("theme-store", () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.classList.remove("dark")
  })
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("저장값이 없으면 시스템 설정을 따른다", async () => {
    mockMatchMedia(true)
    const store = await loadStore()
    store.getState().initializeTheme()
    expect(store.getState().preference).toBe("system")
    expect(store.getState().theme).toBe("dark")
    expect(document.documentElement.classList.contains("dark")).toBe(true)
  })

  it.each([
    ["light", false, "light"],
    ["dark", false, "dark"],
    ["light", true, "light"],
    ["system", true, "dark"],
    ["unknown", false, "light"],
  ])("저장값 %s · 운영체제 다크 %s → %s", async (stored, osDark, expected) => {
    localStorage.setItem("raillo-theme", stored)
    mockMatchMedia(osDark)
    const store = await loadStore()
    store.getState().initializeTheme()
    expect(store.getState().theme).toBe(expected)
    expect(document.documentElement.classList.contains("dark")).toBe(expected === "dark")
  })

  it("시스템 모드에서는 운영체제 설정 변경을 바로 반영한다", async () => {
    const media = mockMatchMedia(false)
    const store = await loadStore()
    store.getState().initializeTheme()
    expect(store.getState().theme).toBe("light")
    media.setDark(true)
    expect(store.getState().theme).toBe("dark")
    expect(document.documentElement.classList.contains("dark")).toBe(true)
  })

  it("라이트·다크를 직접 고르면 운영체제 설정 변경을 무시한다", async () => {
    const media = mockMatchMedia(false)
    const store = await loadStore()
    store.getState().initializeTheme()
    store.getState().setPreference("light")
    media.setDark(true)
    expect(store.getState().theme).toBe("light")
    expect(document.documentElement.classList.contains("dark")).toBe(false)
  })

  it("선택값을 저장하고 적용한다", async () => {
    mockMatchMedia(true)
    const store = await loadStore()
    store.getState().initializeTheme()
    store.getState().setPreference("light")
    expect(localStorage.getItem("raillo-theme")).toBe("light")
    expect(store.getState().theme).toBe("light")
    store.getState().setPreference("system")
    expect(localStorage.getItem("raillo-theme")).toBe("system")
    expect(store.getState().theme).toBe("dark")
  })

  it("정리 함수는 운영체제 설정 구독을 해제한다", async () => {
    const media = mockMatchMedia(false)
    const store = await loadStore()
    const cleanup = store.getState().initializeTheme()
    expect(media.listenerCount()).toBe(1)
    cleanup()
    expect(media.listenerCount()).toBe(0)
  })
})
