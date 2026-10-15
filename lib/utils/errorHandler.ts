/**
 * 중앙화된 에러 처리 유틸리티
 */

export interface ErrorResponse {
  timestamp?: string
  errorCode?: string
  errorMessage?: string
  details?: unknown
  message?: string
}

const isObject = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null
}

/**
 * 에러 객체에서 사용자에게 표시할 메시지를 추출합니다.
 * @param error - 에러 객체
 * @param defaultMessage - 기본 에러 메시지
 * @returns 사용자에게 표시할 에러 메시지
 */
export const extractErrorMessage = (error: unknown, defaultMessage: string = '오류가 발생했습니다.'): string => {
  if (error instanceof Error && error.message) {
    return error.message
  }

  if (isObject(error) && typeof error.errorMessage === "string") {
    return error.errorMessage
  }

  if (isObject(error) && typeof error.message === "string") {
    return error.message
  }

  if (isObject(error) && isObject(error.response) && isObject(error.response.data)) {
    if (typeof error.response.data.errorMessage === "string") {
      return error.response.data.errorMessage
    }
    if (typeof error.response.data.message === "string") {
      return error.response.data.message
    }
  }

  return defaultMessage
}

/**
 * 에러에서 사용자에게 보여 줄 문구를 꺼낸다(extractErrorMessage와 같음).
 * 안내를 띄우지는 않는다 — 돌려받은 문구로 토스트 등은 호출하는 쪽이 띄운다.
 * @param error - 에러 객체
 * @param defaultMessage - 문구를 찾지 못했을 때 쓸 기본 문구
 * @returns 사용자에게 보여 줄 문구
 */
export const handleError = (
  error: unknown,
  defaultMessage: string = '오류가 발생했습니다.',
): string => extractErrorMessage(error, defaultMessage)
