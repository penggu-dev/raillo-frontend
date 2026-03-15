import { useAuthStore } from "@/stores/auth-store";

// API 기본 설정
const DIRECT_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const resolveApiBaseUrl = (): string => {
    if (DIRECT_API_BASE_URL) {
        return DIRECT_API_BASE_URL;
    }

    if (typeof window !== "undefined") {
        return "/__api";
    }

    return "";
};

// API 응답 타입 정의
export interface ApiResponse<T = any> {
    message?: string;
    result?: T;
}

// 서버 에러 응답 타입 정의
export interface ApiErrorResponse {
    timestamp: string;
    errorCode: string;
    errorMessage: string;
    details: any;
}

// 커스텀 API 에러 클래스
export class ApiError extends Error {
    public timestamp: string;
    public errorCode: string;
    public details: any;
    public status: number;

    constructor(message: string, errorCode: string, timestamp: string, details: any, status: number) {
        super(message);
        this.name = 'ApiError';
        this.errorCode = errorCode;
        this.timestamp = timestamp;
        this.details = details;
        this.status = status;
    }
}

export const UNAUTHORIZED_ERROR_CODE = "UNAUTHORIZED";

const hasValidAccessToken = (): boolean => {
    const { accessToken, tokenExpiresIn } = useAuthStore.getState();
    return Boolean(accessToken) && Boolean(tokenExpiresIn) && Date.now() < (tokenExpiresIn ?? 0);
};

// 기본 헤더 설정 (토큰 자동 포함)
const getDefaultHeaders = async (): Promise<Record<string, string>> => {
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
    };

    // 토큰이 있고 유효하면 Authorization 헤더 추가
    if (hasValidAccessToken()) {
        const token = useAuthStore.getState().getToken();
        if (token) {
            headers.Authorization = `Bearer ${token}`;
        }
    }

    return headers;
};

// API 요청 공통 함수
async function apiRequest<T>(
    endpoint: string,
    options: RequestInit = {},
    retryCount: number = 0
): Promise<ApiResponse<T>> {
    const apiBaseUrl = resolveApiBaseUrl();
    if (!apiBaseUrl) {
        throw new Error("NEXT_PUBLIC_API_BASE_URL 환경 변수가 설정되지 않았습니다.");
    }

    const url = `${apiBaseUrl}${endpoint}`;
    const startTime = new Date();

    const config: RequestInit = {
        headers: await getDefaultHeaders(),
        credentials: 'include', // HttpOnly 쿠키 포함
        ...options,
    };

    try {
        const response = await fetch(url, config);

        // 204 No Content 처리
        if (response.status === 204) {
            return {} as ApiResponse<T>;
        }

        const text = await response.text();
        const data = text ? JSON.parse(text) : {};
        const endTime = new Date();
        const duration = endTime.getTime() - startTime.getTime();

        if (!response.ok) {
            // 401 에러이고 재시도하지 않은 경우 토큰 갱신 시도
            if (response.status === 401 && retryCount === 0) {
                const refreshSuccess = await useAuthStore.getState().refreshTokens();
                
                if (refreshSuccess) {
                    // 토큰 갱신 성공 시 재시도 (최대 1회)
                    return apiRequest<T>(endpoint, options, retryCount + 1);
                }

                useAuthStore.getState().removeTokens();
                throw new ApiError(
                    "로그인 세션이 만료되었습니다. 다시 로그인해주세요.",
                    UNAUTHORIZED_ERROR_CODE,
                    new Date().toISOString(),
                    null,
                    401
                );
            }

            // 서버 에러 응답 형식에 맞게 처리
            const errorData = data as ApiErrorResponse;
            
            if (errorData.errorMessage) {
                throw new ApiError(
                    errorData.errorMessage,
                    errorData.errorCode || 'UNKNOWN_ERROR',
                    errorData.timestamp || new Date().toISOString(),
                    errorData.details || null,
                    response.status
                );
            } else if (data.message) {
                throw new ApiError(
                    data.message,
                    'UNKNOWN_ERROR',
                    new Date().toISOString(),
                    null,
                    response.status
                );
            } else {
                throw new ApiError(
                    'API 요청에 실패했습니다.',
                    'UNKNOWN_ERROR',
                    new Date().toISOString(),
                    null,
                    response.status
                );
            }
        }

        return data as ApiResponse<T>;
    } catch (error: unknown) {
        const endTime = new Date();
        const duration = endTime.getTime() - startTime.getTime();
        const isNetworkError =
            error instanceof TypeError ||
            (error instanceof Error && error.message === 'Failed to fetch');
        
        // 네트워크 에러 등 기타 에러 로그
        const logPayload = {
            url,
            method: config.method || 'GET',
            error: error instanceof Error ? error.message : String(error),
            duration: `${duration}ms`,
            timestamp: endTime.toISOString(),
            retryCount
        };

        if (isNetworkError) {
            console.warn('🌐 API Network Unreachable:', logPayload);
            throw new ApiError(
                '서버에 연결할 수 없습니다. 백엔드 서버 상태와 CORS 설정을 확인해주세요.',
                'NETWORK_ERROR',
                new Date().toISOString(),
                null,
                0
            );
        }

        if (process.env.NODE_ENV === "development") {
            console.error('💥 API Error:', logPayload);
        }
        throw error;
    }
}

// HTTP 메서드별 함수들
export const api = {
    // 커스텀 요청 (헤더/옵션 오버라이드 필요 시 사용)
    request: <T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> => {
        return apiRequest<T>(endpoint, options);
    },

    // GET 요청
    get: <T>(endpoint: string, params?: Record<string, unknown>): Promise<ApiResponse<T>> => {
        const normalizedEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
        const url = new URL(normalizedEndpoint, "http://localhost");
        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    url.searchParams.append(key, String(value));
                }
            });
        }

        return apiRequest<T>(url.pathname + url.search);
    },

    // POST 요청
    post: <T>(endpoint: string, data?: unknown): Promise<ApiResponse<T>> => {
        return apiRequest<T>(endpoint, {
            method: 'POST',
            body: data ? JSON.stringify(data) : undefined,
        });
    },

    // PUT 요청
    put: <T>(endpoint: string, data?: unknown): Promise<ApiResponse<T>> => {
        return apiRequest<T>(endpoint, {
            method: 'PUT',
            body: data ? JSON.stringify(data) : undefined,
        });
    },

    // PATCH 요청
    patch: <T>(endpoint: string, data?: unknown): Promise<ApiResponse<T>> => {
        return apiRequest<T>(endpoint, {
            method: 'PATCH',
            body: data ? JSON.stringify(data) : undefined,
        });
    },

    // DELETE 요청
    delete: <T>(endpoint: string, data?: unknown): Promise<ApiResponse<T>> => {
        return apiRequest<T>(endpoint, {
            method: 'DELETE',
            body: data ? JSON.stringify(data) : undefined,
        });
    },
};

export default api;
