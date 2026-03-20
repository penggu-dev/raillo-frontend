"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { loadPaymentWidget } from "@tosspayments/payment-widget-sdk";
import type { PaymentWidgetInstance } from "@tosspayments/payment-widget-sdk";
import AuthGuard from "@/components/auth/AuthGuard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  MapPin,
  Clock,
  ArrowRight,
  X,
  AlertTriangle,
  Info,
  CreditCard,
} from "lucide-react";
import { formatPrice, formatDate, formatTime } from "@/lib/utils/format";
import { getTrainTypeColor } from "@/lib/utils/ticketUtils";
import { deletePendingBookings } from "@/lib/api/pendingBookings";
import {
  useGetPendingBookingList,
  PENDING_BOOKINGS_QUERY_KEY,
} from "@/hooks/usePendingBooking";
import type { PendingBookingCartItem } from "@/types/bookingType";
import { handleError } from "@/lib/utils/errorHandler";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { preparePayment } from "@/lib/api/payments";
import { useAuth } from "@/hooks/use-auth";
import { TossPaymentWidget } from "@/components/payment/TossPaymentWidget";

function ReservationsPageContent() {
  const router = useRouter();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { isAuthenticated, isChecking } = useAuth({
    redirectPath: "/ticket/reservations",
  });
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [selectedCancelId, setSelectedCancelId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const { data, isLoading, isError, error } = useGetPendingBookingList();
  const reservations = data ?? [];

  const paymentWidgetRef = useRef<PaymentWidgetInstance | null>(null);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [paymentInfo, setPaymentInfo] = useState<{
    orderId: string;
    amount: number;
  } | null>(null);
  const [paymentLoading, setPaymentLoading] = useState(false);

  // Toss 위젯 초기화
  useEffect(() => {
    if (isChecking || !isAuthenticated) return;

    const initPaymentWidget = async () => {
      try {
        const clientKey =
          process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY ||
          "test_ck_D5GePWvyJnrK0W0k6q8gLzN97Eoq";
        const storedCustomerKey = localStorage.getItem("tossCustomerKey");
        const customerKey =
          storedCustomerKey ??
          (typeof crypto !== "undefined" && "randomUUID" in crypto
            ? `customer-${crypto.randomUUID()}`
            : `customer-${Math.random().toString(36).slice(2)}`);

        if (!storedCustomerKey) {
          localStorage.setItem("tossCustomerKey", customerKey);
        }

        const paymentWidget = await loadPaymentWidget(clientKey, customerKey);
        paymentWidgetRef.current = paymentWidget;
      } catch (err) {
        console.error("토스 페이먼츠 위젯 초기화 실패:", err);
      }
    };

    initPaymentWidget();
  }, [isAuthenticated, isChecking]);

  const getTotalPrice = (reservation: PendingBookingCartItem) => {
    return reservation.totalFare ?? reservation.fare ?? 0;
  };

  const getSeatSummary = (seats: PendingBookingCartItem["seats"]) => {
    const seatType = seats[0]?.carType === "FIRST_CLASS" ? "특실" : "일반실";
    return `${seatType} ${seats.length}매`;
  };

  const isExpired = (expiresAt?: string) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) <= new Date();
  };

  const toggleItemSelection = (pendingBookingId: string) => {
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

  const toggleAllSelection = () => {
    const valid = reservations.filter((r) => !isExpired(r.expiresAt));
    const allSelected = valid.every((item) =>
      selectedIds.has(item.pendingBookingId),
    );
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(valid.map((item) => item.pendingBookingId)));
    }
  };

  const handleCancelReservation = (pendingBookingId: string) => {
    setSelectedCancelId(pendingBookingId);
    setShowCancelDialog(true);
  };

  const confirmCancelReservation = async () => {
    if (selectedCancelId) {
      try {
        await deletePendingBookings([selectedCancelId]);
        toast({ description: "예약이 취소되었습니다." });
        setSelectedIds((prev) => {
          const next = new Set(prev);
          next.delete(selectedCancelId);
          return next;
        });
        queryClient.invalidateQueries({ queryKey: PENDING_BOOKINGS_QUERY_KEY });
      } catch (err) {
        toast({
          title: "오류",
          description: handleError(
            err,
            "예약 취소 중 오류가 발생했습니다.",
            false,
          ),
          variant: "destructive",
        });
      }
    }
    setShowCancelDialog(false);
    setSelectedCancelId(null);
  };

  const handlePaymentClick = async () => {
    if (!paymentWidgetRef.current) {
      toast({
        title: "결제 위젯 준비 중",
        description: "잠시 후 다시 시도해주세요.",
        variant: "destructive",
      });
      return;
    }

    const selected = reservations.filter((item) =>
      selectedIds.has(item.pendingBookingId),
    );
    if (selected.length === 0) {
      toast({
        title: "선택 필요",
        description: "결제할 예약을 선택해주세요.",
        variant: "destructive",
      });
      return;
    }

    setPaymentLoading(true);
    try {
      const result = await preparePayment({
        pendingBookingIds: selected.map((item) => item.pendingBookingId),
      });
      setPaymentInfo({
        orderId: result.orderId,
        amount: result.amount,
      });
      setShowPaymentDialog(true);
    } catch (err) {
      toast({
        title: "결제 준비 실패",
        description: handleError(
          err,
          "결제 준비 중 오류가 발생했습니다.",
          false,
        ),
        variant: "destructive",
      });
    } finally {
      setPaymentLoading(false);
    }
  };

  const handleRequestPayment = async () => {
    if (!paymentWidgetRef.current || !paymentInfo) return;

    const selected = reservations.filter((item) =>
      selectedIds.has(item.pendingBookingId),
    );
    const orderName =
      selected.length > 1
        ? `${selected[0].trainName} ${selected[0].trainNumber} 외 ${selected.length - 1}매`
        : `${selected[0].trainName} ${selected[0].trainNumber} 승차권`;

    try {
      await paymentWidgetRef.current.requestPayment({
        orderId: paymentInfo.orderId,
        orderName,
        successUrl: `${window.location.origin}/ticket/reservation/success`,
        failUrl: `${window.location.origin}/ticket/reservations`,
      });
    } catch (err: unknown) {
      const paymentError = err as { code?: string; message?: string };
      const errorCode = String(paymentError.code ?? "");
      const errorMessage = String(paymentError.message ?? "");
      const isUserCancel =
        errorCode === "USER_CANCEL" ||
        errorCode.includes("CANCEL") ||
        errorMessage.includes("취소");

      if (isUserCancel) {
        setShowPaymentDialog(false);
        return;
      }

      toast({
        title: "결제 요청 실패",
        description: "결제 요청 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  const validReservations = reservations.filter((r) => !isExpired(r.expiresAt));
  const selectedItems = reservations.filter((item) =>
    selectedIds.has(item.pendingBookingId),
  );
  const totalPrice = selectedItems.reduce(
    (sum, item) => sum + getTotalPrice(item),
    0,
  );
  const allSelected =
    validReservations.length > 0 &&
    validReservations.every((item) => selectedIds.has(item.pendingBookingId));

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">예약 목록을 불러오고 있습니다...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="text-red-600 mb-4">
          <p className="text-lg font-semibold">
            예약 목록을 불러올 수 없습니다
          </p>
          <p className="text-sm">{error?.message}</p>
        </div>
        <Button onClick={() => router.push("/")} variant="outline">
          홈으로 돌아가기
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white pb-24">
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Page Title */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              예약승차권 조회
            </h2>
            <p className="text-gray-600">
              예약한 승차권을 확인하고 결제하거나 취소할 수 있습니다
            </p>
          </div>

          {/* Notice */}
          <Card className="mb-8 bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2 text-blue-700">
                <Info className="h-5 w-5" />
                <span className="font-medium">
                  결제 기한이 지난 목록은 자동 삭제됩니다
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Reservation List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">예약 내역</h3>
              {validReservations.length > 0 && (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={allSelected}
                    onCheckedChange={toggleAllSelection}
                    className="data-[state=checked]:bg-blue-600"
                  />
                  <span className="text-sm text-gray-600">
                    전체선택 ({selectedItems.length}/{validReservations.length})
                  </span>
                </div>
              )}
            </div>

            {reservations.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Clock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    예약 내역이 없습니다
                  </h3>
                  <p className="text-gray-600 mb-6">
                    새로운 예약을 진행하세요.
                  </p>
                  <Link href="/ticket/booking">
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      승차권 예매하기
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : validReservations.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Clock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    유효한 예약이 없습니다
                  </h3>
                  <p className="text-gray-600 mb-6">
                    결제 기한이 지난 예약은 자동으로 삭제됩니다.
                  </p>
                  <Link href="/ticket/booking">
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      승차권 예매하기
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              validReservations.map((reservation) => (
                <Card
                  key={reservation.pendingBookingId}
                  className={`border-blue-200 ${selectedIds.has(reservation.pendingBookingId) ? "ring-2 ring-blue-500" : ""}`}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-3">
                      <Checkbox
                        checked={selectedIds.has(reservation.pendingBookingId)}
                        onCheckedChange={() =>
                          toggleItemSelection(reservation.pendingBookingId)
                        }
                        className="mt-1 data-[state=checked]:bg-blue-600"
                      />
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <Badge
                              className={`${getTrainTypeColor(reservation.trainName)} px-3 py-1`}
                            >
                              {reservation.trainName}
                            </Badge>
                            <span className="text-lg font-bold">
                              {reservation.trainNumber}
                            </span>
                            <span className="text-gray-600">
                              {formatDate(reservation.operationDate)}
                            </span>
                          </div>
                          <div className="text-right">
                            <div className="text-xl font-bold text-blue-600">
                              {formatPrice(getTotalPrice(reservation))}
                            </div>
                            <div className="text-xs text-gray-500">
                              예약번호: {reservation.pendingBookingId}
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                              <MapPin className="h-4 w-4 mr-1" />
                              운행 정보
                            </h4>
                            <div className="space-y-1">
                              <div className="flex items-center space-x-2">
                                <span className="font-medium">
                                  {reservation.departureStationName}
                                </span>
                                <ArrowRight className="h-3 w-3 text-gray-400" />
                                <span className="font-medium">
                                  {reservation.arrivalStationName}
                                </span>
                              </div>
                              <div className="text-sm text-gray-600">
                                {formatTime(reservation.departureTime)} ~{" "}
                                {formatTime(reservation.arrivalTime)}
                              </div>
                            </div>
                          </div>

                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">
                              좌석 정보
                            </h4>
                            <div className="text-sm font-medium">
                              {getSeatSummary(reservation.seats)}
                            </div>
                          </div>

                          <div>
                            <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                              <Clock className="h-4 w-4 mr-1" />
                              결제 기한
                            </h4>
                          </div>
                        </div>

                        <div className="flex justify-end pt-4 border-t">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleCancelReservation(
                                reservation.pendingBookingId,
                              )
                            }
                            className="text-red-600 border-red-600 hover:bg-red-50"
                          >
                            <X className="h-4 w-4 mr-1" />
                            예약취소
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Notice */}
          <Card className="mt-8 bg-yellow-50 border-yellow-200">
            <CardContent className="p-6">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div className="space-y-2 text-sm text-yellow-800">
                  <h3 className="font-semibold">예약승차권 조회 안내</h3>
                  <ul className="space-y-1 list-disc list-inside">
                    <li>
                      예약 후 10분 이내에 결제하지 않으면 자동으로 취소됩니다.
                    </li>
                    <li>결제 기한이 지난 예약은 자동으로 삭제됩니다.</li>
                    <li>예약 취소는 결제 기한 내에만 가능합니다.</li>
                    <li>예약번호는 예약 완료 시 발급된 번호입니다.</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Bottom Payment Bar */}
      {selectedItems.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4 z-50">
          <div className="container mx-auto max-w-4xl flex items-center justify-between">
            <div>
              <span className="font-semibold">
                {selectedItems.length}개 선택
              </span>
              <span className="text-gray-400 mx-2">·</span>
              <span className="text-lg font-bold text-blue-600">
                {formatPrice(totalPrice)}
              </span>
            </div>
            <Button
              onClick={handlePaymentClick}
              disabled={paymentLoading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {paymentLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              ) : (
                <CreditCard className="h-4 w-4 mr-2" />
              )}
              결제하기
            </Button>
          </div>
        </div>
      )}

      {/* Toss 결제 Dialog — TossPaymentWidget이 마운트될 때 #payment-widget이 DOM에 존재함 */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>결제 수단 선택</DialogTitle>
            <DialogDescription>
              {selectedItems.length}개 항목 · 총 {formatPrice(totalPrice)}
            </DialogDescription>
          </DialogHeader>
          {showPaymentDialog && paymentWidgetRef.current && paymentInfo && (
            <TossPaymentWidget
              paymentWidget={paymentWidgetRef.current}
              paymentInfo={paymentInfo}
              onCancel={() => setShowPaymentDialog(false)}
              onRequestPayment={handleRequestPayment}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Cancel Reservation Dialog */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>예약 취소</AlertDialogTitle>
            <AlertDialogDescription>
              선택한 예약을 취소하시겠습니까?
              <br />
              취소된 예약은 복구할 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmCancelReservation}
              className="bg-red-600 hover:bg-red-700"
            >
              확인
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default function ReservationsPage() {
  return (
    <AuthGuard redirectPath="/ticket/reservations">
      <ReservationsPageContent />
    </AuthGuard>
  );
}
