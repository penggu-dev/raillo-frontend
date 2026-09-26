import type { CarInfo, SeatType } from "@/types/trainType";

// 좌석 등급에 맞는 객차인지 — 호차 선택과 목록 필터가 같은 기준을 쓴다
export const matchesSeatType = (car: CarInfo, seatType: SeatType): boolean => {
  if (seatType === "firstClassSeat") return car.carType === "FIRST_CLASS";
  if (seatType === "standardSeat") return car.carType === "STANDARD";
  return true;
};

/**
 * 보여 줄 호차 — 적용된 호차가 등급에 맞으면 그 호차, 아니면 등급에 맞는 첫 호차.
 * 예매 패널과 좌석 선택 창이 같은 규칙을 써야 두 화면이 같은 호차를 가리킨다.
 */
export const pickSeatCar = (
  carList: CarInfo[],
  seatType: SeatType,
  appliedCar: number | null,
): CarInfo | undefined => {
  const candidates = carList.filter((car) => matchesSeatType(car, seatType));
  const appliedMatch =
    appliedCar === null
      ? undefined
      : candidates.find((car) => parseInt(car.carNumber) === appliedCar);
  return appliedMatch ?? candidates[0];
};
