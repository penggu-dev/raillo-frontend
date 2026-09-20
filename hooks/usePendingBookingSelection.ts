"use client";

import { useState } from "react";
import type { PendingBookingCartItem } from "@/types/bookingType";

/** 결제 기한이 지난 예약은 고를 수 없다 */
export const isExpired = (expiresAt?: string): boolean => {
  if (!expiresAt) return false;
  return new Date(expiresAt) <= new Date();
};

const totalFareOf = (reservation: PendingBookingCartItem): number =>
  reservation.totalFare ?? reservation.fare ?? 0;

/** 예약 목록의 선택 상태 — 유효한 예약만 대상으로 한다 */
export const usePendingBookingSelection = (
  reservations: PendingBookingCartItem[],
) => {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const validReservations = reservations.filter(
    (reservation) => !isExpired(reservation.expiresAt),
  );
  const selectedItems = reservations.filter((reservation) =>
    selectedIds.has(reservation.pendingBookingId),
  );
  const totalPrice = selectedItems.reduce(
    (sum, reservation) => sum + totalFareOf(reservation),
    0,
  );
  const allSelected =
    validReservations.length > 0 &&
    validReservations.every((reservation) =>
      selectedIds.has(reservation.pendingBookingId),
    );

  const toggle = (pendingBookingId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(pendingBookingId)) {
        next.delete(pendingBookingId);
      } else {
        next.add(pendingBookingId);
      }
      return next;
    });
  };

  const toggleAll = () => {
    setSelectedIds(
      allSelected
        ? new Set()
        : new Set(validReservations.map((item) => item.pendingBookingId)),
    );
  };

  /** 취소한 예약을 선택에서 뺀다 */
  const deselect = (pendingBookingId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.delete(pendingBookingId);
      return next;
    });
  };

  return {
    selectedIds,
    validReservations,
    selectedItems,
    totalPrice,
    allSelected,
    toggle,
    toggleAll,
    deselect,
  };
};
