import { TRAIN_TYPE } from "@/constants/trainType";
import type { SeatType } from "@/types/trainType";

export const getTrainTypeColor = (trainName: string): string => {
  switch (trainName) {
    case TRAIN_TYPE.KTX:
    case TRAIN_TYPE.KTX_SANCHEON:
      return "bg-blue-600 text-white dark:bg-blue-600"
    case TRAIN_TYPE.ITX_SAEMAUL:
      // 라이트 green-600 위 흰 글자 3.30:1 → green-700(5.02:1)
      return "bg-green-700 text-white dark:bg-green-700"
    case TRAIN_TYPE.MUGUNGHWA:
      // 라이트 orange-600 위 흰 글자 3.56:1 → orange-700(5.18:1)
      return "bg-orange-700 text-white dark:bg-orange-700"
    case TRAIN_TYPE.ITX_CHEONGCHUN:
      return "bg-purple-600 text-white dark:bg-purple-600"
    default:
      return "bg-gray-600 text-white dark:bg-gray-500"
  }
}

export const getSeatTypeName = (seatType: SeatType): string => {
  switch (seatType) {
    case "standardSeat":
      return "일반실"
    case "firstClassSeat":
      return "특실"
    default:
      return ""
  }
}

export const getCarTypeName = (carType: string): string => {
  switch (carType) {
    case "STANDARD":
      return "일반실"
    case "FIRST_CLASS":
      return "특실"
    default:
      return carType
  }
}

export const getPassengerTypeName = (passengerType: string): string => {
  switch (passengerType) {
    case "ADULT":
      return "어른"
    case "CHILD":
      return "어린이"
    case "INFANT":
      return "유아"
    case "SENIOR":
      return "경로"
    case "DISABLED_HEAVY":
      return "중증장애인"
    case "DISABLED_LIGHT":
      return "경증장애인"
    case "VETERAN":
      return "국가유공자"
    default:
      return passengerType
  }
}

export const getPaymentMethodName = (paymentMethod: string): string => {
  switch (paymentMethod) {
    case "CARD":
      return "카드결제"
    case "BANK_TRANSFER":
    case "TRANSFER":
      return "계좌이체"
    case "EASY_PAY":
      return "간편결제"
    default:
      return paymentMethod
  }
}
