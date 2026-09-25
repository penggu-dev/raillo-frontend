import { describe, expect, it } from "vitest"
import type { CarInfo } from "@/types/trainType"
import { pickSeatCar } from "./seat-car"

const car = (carNumber: string, carType: CarInfo["carType"]): CarInfo => ({
  id: Number(carNumber) + 10,
  carNumber,
  carType,
  totalSeats: 40,
  remainingSeats: 20,
  seatArrangement: "2+2",
})
// 1호차가 특실인 열차 — 목 데이터와 같은 구성
const cars = [car("1", "FIRST_CLASS"), car("2", "STANDARD"), car("3", "STANDARD")]

describe("pickSeatCar", () => {
  it("적용한 호차가 없으면 등급에 맞는 첫 호차를 고른다(1호차가 특실이어도 일반실은 2호차)", () => {
    expect(pickSeatCar(cars, "standardSeat", null)?.carNumber).toBe("2")
    expect(pickSeatCar(cars, "firstClassSeat", null)?.carNumber).toBe("1")
  })

  it("적용한 호차가 등급에 맞으면 그 호차를 유지한다", () => {
    expect(pickSeatCar(cars, "standardSeat", 3)?.carNumber).toBe("3")
  })

  it("적용한 호차가 등급과 다르거나 목록에 없으면 첫 호차로 되돌린다", () => {
    expect(pickSeatCar(cars, "standardSeat", 1)?.carNumber).toBe("2")
    expect(pickSeatCar(cars, "standardSeat", 9)?.carNumber).toBe("2")
  })

  it("등급에 맞는 호차가 없으면 아무것도 고르지 않는다", () => {
    expect(pickSeatCar([car("2", "STANDARD")], "firstClassSeat", null)).toBeUndefined()
    expect(pickSeatCar([], "standardSeat", null)).toBeUndefined()
  })
})
