import { describe, it, expect } from "vitest"
import { toPassengerTypes, toSeatIds } from "./pendingBooking"
import type { PassengerCounts } from "@/types/passengerType"
import type { SeatDetail } from "@/types/trainType"

const counts = (partial: Partial<PassengerCounts>): PassengerCounts => ({
  adult: 0, child: 0, infant: 0, senior: 0, severelydisabled: 0, mildlydisabled: 0, veteran: 0, ...partial,
})

const seat = (seatId: number, seatNumber: string): SeatDetail => ({
  seatId, seatNumber, isAvailable: true, seatDirection: "FORWARD", seatType: "WINDOW", remarks: "",
})

describe("toPassengerTypes", () => {
  it("정해진 유형 순서로 인원 수만큼 펼친다", () => {
    expect(toPassengerTypes(counts({ veteran: 1, adult: 2, child: 1, mildlydisabled: 1, severelydisabled: 1, senior: 1, infant: 1 }))).toEqual([
      "ADULT", "ADULT", "CHILD", "INFANT", "SENIOR", "DISABLED_HEAVY", "DISABLED_LIGHT", "VETERAN",
    ])
  })

  it("0명·음수는 넣지 않는다", () => {
    expect(toPassengerTypes(counts({ adult: 0, child: -1, senior: 1 }))).toEqual(["SENIOR"])
  })
})

describe("toSeatIds", () => {
  const seatList = [seat(7, "1A"), seat(8, "1B")]

  it("고른 순서대로 좌석 ID를 돌려준다", () => {
    expect(toSeatIds(["1B", "1A"], seatList)).toEqual([8, 7])
  })

  it("조회한 좌석 목록에 없는 번호는 뺀다", () => {
    expect(toSeatIds(["1A", "9Z"], seatList)).toEqual([7])
  })
})
