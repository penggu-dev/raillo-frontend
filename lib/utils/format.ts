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
