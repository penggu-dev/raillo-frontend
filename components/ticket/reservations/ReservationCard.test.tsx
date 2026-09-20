import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import type { PendingBookingCartItem } from "@/types/bookingType"
import { ReservationCard } from "./ReservationCard"

const reservation = (expiresAt?: string): PendingBookingCartItem =>
  ({
    pendingBookingId: "pb-1",
    trainName: "KTX",
    trainNumber: "101",
    operationDate: "2026-09-24",
    departureStationName: "서울",
    arrivalStationName: "부산",
    departureTime: "05:13:00",
    arrivalTime: "07:50:00",
    totalFare: 59800,
    expiresAt,
    seats: [{ carType: "STANDARD", seatNumber: "1A" }],
  }) as unknown as PendingBookingCartItem

const renderCard = (expiresAt?: string) =>
  render(
    <ReservationCard
      reservation={reservation(expiresAt)}
      selected={false}
      onToggle={vi.fn()}
      onCancel={vi.fn()}
    />,
  )

describe("ReservationCard 결제 기한", () => {
  it("기한 시각을 보여 준다", () => {
    renderCard("2026-09-24T09:30:00")

    expect(screen.getByText("09월 24일 09:30까지")).toBeInTheDocument()
  })

  it("기한이 없으면 대체 문구를 보여 준다", () => {
    renderCard(undefined)

    expect(screen.getByText("기한 정보 없음")).toBeInTheDocument()
  })
})
