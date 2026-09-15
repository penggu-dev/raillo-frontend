import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { THEME_INIT_SCRIPT } from "./theme"

type StorageMode = string | null | "blocked-getItem" | "blocked-access"
type MediaMode = boolean | "missing"

const originalMatchMedia = window.matchMedia

// 운영체제 다크 모드 설정 흉내 ("missing"은 matchMedia가 없는 환경)
const mockMatchMedia = (mode: MediaMode) => {
  if (mode === "missing") {
    // @ts-expect-error matchMedia가 없는 환경을 흉내 낸다
    delete window.matchMedia
    return
  }
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: query === "(prefers-color-scheme: dark)" ? mode : false,
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  })) as unknown as typeof window.matchMedia
}

// 저장값 설정 · getItem 예외 · localStorage 접근 자체 예외(사이트 데이터 차단)
const mockStorage = (mode: StorageMode) => {
  if (mode === "blocked-getItem") {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new DOMException("blocked", "SecurityError")
    })
  } else if (mode === "blocked-access") {
    vi.spyOn(window, "localStorage", "get").mockImplementation(() => {
      throw new DOMException("blocked", "SecurityError")
    })
  } else if (mode !== null) {
    localStorage.setItem("raillo-theme", mode)
  }
}

const isDark = () => document.documentElement.classList.contains("dark")

// 첫 페인트 스크립트 실행 결과
const runInitScript = () => {
  document.documentElement.classList.remove("dark")
  new Function(THEME_INIT_SCRIPT)()
  return isDark()
}

// 마운트 후 스토어 초기화 결과
const runStore = async () => {
  document.documentElement.classList.remove("dark")
  vi.resetModules()
  const { useThemeStore } = await import("@/stores/theme-store")
  useThemeStore.getState().initializeTheme()
  return isDark()
}

describe("THEME_INIT_SCRIPT", () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.classList.remove("dark")
  })
  afterEach(() => {
    vi.restoreAllMocks()
    window.matchMedia = originalMatchMedia
  })

  const storageModes: StorageMode[] = [null, "light", "dark", "system", "unknown", "blocked-getItem", "blocked-access"]
  const mediaModes: MediaMode[] = [true, false, "missing"]

  // 두 결과가 다르면 첫 페인트 뒤 테마가 한 번 바뀌어 깜빡임(FOUC)이 생긴다
  it.each(storageModes.flatMap((storage) => mediaModes.map((media) => [storage, media] as const)))(
    "저장소 %s · 운영체제 다크 %s — 첫 페인트 스크립트와 스토어가 같은 테마를 고른다",
    async (storage, media) => {
      mockMatchMedia(media)
      mockStorage(storage)
      const fromScript = runInitScript()
      const fromStore = await runStore()
      expect(fromScript).toBe(fromStore)
    },
  )

  it.each(["blocked-getItem", "blocked-access"] as const)(
    "저장소 접근이 막혀도(%s) 운영체제 다크 모드면 첫 페인트부터 다크를 적용한다",
    (storage) => {
      mockMatchMedia(true)
      mockStorage(storage)
      expect(runInitScript()).toBe(true)
    },
  )
})
