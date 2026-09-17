import type { PassengerCounts } from "@/types/passengerType";
import type { SeatDetail } from "@/types/trainType";

// 대기 예약 요청의 승객 유형 — 이 순서로 인원 수만큼 펼친다
const PASSENGER_TYPES: ReadonlyArray<readonly [keyof PassengerCounts, string]> = [
  ["adult", "ADULT"],
  ["child", "CHILD"],
  ["infant", "INFANT"],
  ["senior", "SENIOR"],
  ["severelydisabled", "DISABLED_HEAVY"],
  ["mildlydisabled", "DISABLED_LIGHT"],
  ["veteran", "VETERAN"],
];

export const toPassengerTypes = (counts: PassengerCounts): string[] =>
  PASSENGER_TYPES.flatMap(([key, type]) =>
    Array.from({ length: counts[key] > 0 ? Math.ceil(counts[key]) : 0 }, () => type),
  );

// 좌석 번호를 좌석 ID로 바꾼다 — 조회한 좌석 목록에 없는 번호는 뺀다
export const toSeatIds = (seatNumbers: string[], seatList: SeatDetail[]): number[] =>
  seatNumbers
    .map((seatNumber) => seatList.find((seat) => seat.seatNumber === seatNumber)?.seatId || 0)
    .filter((id) => id > 0);
