import { format } from "date-fns"
import { ko } from "date-fns/locale"

export const formatPrice = (price: number = 0): string => {
  return `${price.toLocaleString("ko-KR")}원`
}

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return format(date, "yyyy년 MM월 dd일(EEEE)", { locale: ko })
}

export const formatTime = (timeString: string): string => {
  return timeString.substring(0, 5)
}

/** ISO 날짜·시각 문자열 → "MM월 dd일 HH:mm" (결제 기한처럼 날짜와 시각을 함께 보일 때) */
export const formatDateTime = (isoString: string): string => {
  return format(new Date(isoString), "MM월 dd일 HH:mm", { locale: ko })
}
