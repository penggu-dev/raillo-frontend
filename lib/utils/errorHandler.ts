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
 * 에러를 처리하고 사용자에게 알림을 표시합니다.
 * @param error - 에러 객체
 * @param defaultMessage - 기본 에러 메시지
 * @param showAlert - alert 표시 여부 (기본값: true)
 * @returns 추출된 에러 메시지
 */
export const handleError = (
  error: unknown, 
  defaultMessage: string = '오류가 발생했습니다.',
  showAlert: boolean = true
): string => {
  const message = extractErrorMessage(error, defaultMessage)
  
  return message
}

/**
 * API 호출을 래핑하여 에러 처리를 자동화하는 함수
 * @param apiCall - API 호출 함수
 * @param defaultMessage - 기본 에러 메시지
 * @param showAlert - alert 표시 여부
 * @returns API 호출 결과 또는 null (에러 시)
 */
export const withErrorHandling = async <T>(
  apiCall: () => Promise<T>,
  defaultMessage: string = '오류가 발생했습니다.',
  showAlert: boolean = true
): Promise<T | null> => {
  try {
    return await apiCall()
  } catch (error) {
    handleError(error, defaultMessage, showAlert)
    return null
  }
} 
