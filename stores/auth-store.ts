import { create } from "zustand";
import { TokenReissueResponse } from "@/types/authType";
import { AUTH_API_BASE_URL, REISSUE_PATH, takeEarlyReissue } from "@/lib/earlyReissue";
let refreshPromise: Promise<boolean> | null = null;
let initializePromise: Promise<void> | null = null;

interface AuthState {
  isInitialized: boolean;
  isAuthenticated: boolean;
  accessToken: string | null;
  tokenExpiresIn: number | null;

  setTokens: (accessToken: string, expiresIn: number) => void;
  removeTokens: () => void;
  getToken: () => string | null;
  hasValidToken: () => boolean;
  refreshTokens: () => Promise<boolean>;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()((set, get) => ({
  isInitialized: false,
  isAuthenticated: false,
  accessToken: null,
  tokenExpiresIn: null,

  setTokens: (accessToken: string, expiresIn: number) => {
    set({
      isAuthenticated: true,
      accessToken,
      tokenExpiresIn: expiresIn,
    });
    // middleware에서 인증 여부 확인용 쿠키 (7일)
    document.cookie = `has_session=1; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
  },

  removeTokens: () => {
    set({
      isAuthenticated: false,
      accessToken: null,
      tokenExpiresIn: null,
    });
    document.cookie = "has_session=; path=/; max-age=0; SameSite=Lax";
  },

  getToken: () => get().accessToken,

  hasValidToken: () => {
    const { accessToken, tokenExpiresIn } = get();

    if (!accessToken || !tokenExpiresIn) {
      return false;
    }

    return Date.now() < tokenExpiresIn;
  },

  refreshTokens: async () => {
    if (refreshPromise) {
      return refreshPromise;
    }

    refreshPromise = (async () => {
      const reissueEndpoints = [REISSUE_PATH, "/api/v1/auth/reissue"];
      let lastError: unknown = null;

      for (const endpoint of reissueEndpoints) {
        try {
          // 첫 페인트 전에 같은 경로로 보낸 재발급이 있으면 새로 보내지 않고 그 응답을 쓴다(lib/earlyReissue)
          const early = endpoint === REISSUE_PATH ? takeEarlyReissue() : null;
          const response = await (early ??
            fetch(`${AUTH_API_BASE_URL}${endpoint}`, {
              method: "POST",
              credentials: "include",
              headers: {
                "Content-Type": "application/json",
              },
            }));

          if (response.status >= 200 && response.status < 300) {
            const data = (await response.json()) as TokenReissueResponse;
            if (!data?.result) {
              continue;
            }
            const { accessToken, accessTokenExpiresIn } = data.result;
            const expiresIn = Date.now() + accessTokenExpiresIn * 1000;
            get().setTokens(accessToken, expiresIn);
            return true;
          }

          if (response.status === 401 || response.status === 404) {
            continue;
          }
        } catch (error) {
          lastError = error;
          continue;
        }
      }

      if (lastError) {
        const message =
          lastError instanceof Error ? lastError.message : String(lastError);
        console.warn("토큰 갱신 서버 연결 실패:", message);
      }

      get().removeTokens();
      return false;
    })().finally(() => {
      refreshPromise = null;
    });

    return refreshPromise;
  },

  // 앱 초기화 시 HttpOnly 쿠키의 refresh token으로 access token 발급
  initialize: async () => {
    if (get().isInitialized) {
      return;
    }

    if (initializePromise) {
      return initializePromise;
    }

    initializePromise = (async () => {
      await get().refreshTokens();
      set({ isInitialized: true });
    })().finally(() => {
      initializePromise = null;
    });

    return initializePromise;
  },
}));
