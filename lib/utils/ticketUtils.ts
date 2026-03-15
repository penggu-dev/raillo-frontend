export const getTrainTypeColor = (trainName: string): string => {
  switch (trainName) {
    case "KTX":
    case "KTX-산천":
      return "bg-blue-600 text-white"
    case "ITX-새마을":
      return "bg-green-600 text-white"
    case "무궁화호":
      return "bg-orange-600 text-white"
    case "ITX-청춘":
      return "bg-purple-600 text-white"
    default:
      return "bg-gray-600 text-white"
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
