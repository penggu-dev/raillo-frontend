import { render, screen, within } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import type { CarInfo, SeatInfo, TrainSchedule } from "@/types/trainType"
import { BookingPanel } from "./booking-panel"

const seatInfo: SeatInfo = {
  availableSeats: 10,
  totalSeats: 40,
  fare: 59800,
  status: "AVAILABLE",
  canReserve: true,
  displayText: "일반실",
}

const train: TrainSchedule = {
  trainScheduleId: 1,
  trainNumber: "101",
  trainName: "KTX",
  departureStationName: "서울",
  arrivalStationName: "부산",
  departureTime: "09:00:00",
  arrivalTime: "11:38:00",
  travelTime: "PT2H38M",
  standardSeat: seatInfo,
  firstClassSeat: { ...seatInfo, fare: 83700, displayText: "특실" },
  standing: null,
  formattedTravelTime: "2시간 38분",
  expressTrain: true,
}

// 1호차가 특실 — 패널의 호차 기본값(1)과 일반실 첫 호차가 다른 경우
const cars: CarInfo[] = [
  { id: 11, carNumber: "1", carType: "FIRST_CLASS", totalSeats: 30, remainingSeats: 12, seatArrangement: "2+1" },
  { id: 12, carNumber: "2", carType: "STANDARD", totalSeats: 40, remainingSeats: 25, seatArrangement: "2+2" },
]

const renderPanel = (props: { selectedSeatType?: "standardSeat" | "firstClassSeat"; selectedSeats?: string[]; selectedCar?: number }) =>
  render(
    <BookingPanel
      isOpen
      onClose={vi.fn()}
      selectedTrain={train}
      selectedSeatType={props.selectedSeatType ?? "standardSeat"}
      selectedSeats={props.selectedSeats ?? []}
      selectedCar={props.selectedCar ?? 1}
      onSeatSelection={vi.fn()}
      onBooking={vi.fn()}
      carList={cars}
      loadingCars={false}
      onRefreshSeats={vi.fn()}
      returnFocusRef={{ current: null }}
    />,
  )

// "객차 정보" 제목 아래 칸
const carSection = () => screen.getByRole("heading", { name: "객차 정보" }).parentElement as HTMLElement

describe("BookingPanel 객차 정보", () => {
  it("좌석 적용 전에는 고른 등급의 첫 호차를 배정 예정으로 보여 준다(1호차 특실이 아님)", () => {
    renderPanel({ selectedSeatType: "standardSeat", selectedCar: 1 })
    const section = within(carSection())
    expect(section.getByText("배정 예정 객차")).toBeInTheDocument()
    expect(section.getByText("2호차")).toBeInTheDocument()
    expect(section.getByText("일반실")).toBeInTheDocument()
    expect(section.queryByText("1호차")).not.toBeInTheDocument()
  })

  it("특실을 고르면 특실 첫 호차를 보여 준다", () => {
    renderPanel({ selectedSeatType: "firstClassSeat", selectedCar: 1 })
    const section = within(carSection())
    expect(section.getByText("1호차")).toBeInTheDocument()
    expect(section.getByText("특실")).toBeInTheDocument()
  })

  it("좌석을 적용한 뒤에는 적용한 호차를 선택된 객차로 보여 준다", () => {
    renderPanel({ selectedSeatType: "standardSeat", selectedSeats: ["3A"], selectedCar: 2 })
    const section = within(carSection())
    expect(section.getByText("선택된 객차")).toBeInTheDocument()
    expect(section.getByText("2호차")).toBeInTheDocument()
  })
})
