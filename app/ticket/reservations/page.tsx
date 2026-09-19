"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { loadPaymentWidget } from "@tosspayments/payment-widget-sdk";
import type { PaymentWidgetInstance } from "@tosspayments/payment-widget-sdk";
import AuthGuard from "@/components/auth/AuthGuard";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { useToast } from "@/hooks/useToast";
import { preparePayment } from "@/lib/api/payments";
import { getPaymentFailNotice } from "@/lib/utils/paymentRedirect";
import { useAuth } from "@/hooks/useAuth";
import { TossPaymentWidget } from "@/components/payment/TossPaymentWidget";
import { LOCAL_STORAGE_KEYS } from "@/constants/storageKeys";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { TrainTypeBadge } from "@/components/ticket/TrainTypeBadge";
import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { CardListSkeleton } from "@/components/common/CardListSkeleton";

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

  const { data, isLoading, isError, error, refetch } = useGetPendingBookingList();
  const reservations = data ?? [];

  const paymentWidgetRef = useRef<PaymentWidgetInstance | null>(null);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [paymentInfo, setPaymentInfo] = useState<{
    orderId: string;
    amount: number;
  } | null>(null);
  const [paymentLoading, setPaymentLoading] = useState(false);

  // 결제 실패·취소로 돌아온 경우(failUrl의 code·message) 안내 후 주소에서 제거
  const searchParams = useSearchParams();
  const failNoticeShownRef = useRef(false);
  useEffect(() => {
    const notice = getPaymentFailNotice(searchParams);
    if (!notice || failNoticeShownRef.current) return;
    failNoticeShownRef.current = true;
    toast({
      title: notice.title,
      description: notice.description,
      variant: notice.canceled ? "default" : "destructive",
    });
    router.replace("/ticket/reservations");
  }, [searchParams, toast, router]);

  // Toss 위젯 초기화
  useEffect(() => {
    if (isChecking || !isAuthenticated) return;

    const initPaymentWidget = async () => {
      try {
        const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY as string;
        const storedCustomerKey = localStorage.getItem(
          LOCAL_STORAGE_KEYS.TOSS_CUSTOMER_KEY,
        );
        const customerKey =
          storedCustomerKey ??
          (typeof crypto !== "undefined" && "randomUUID" in crypto
            ? `customer-${crypto.randomUUID()}`
            : `customer-${Math.random().toString(36).slice(2)}`);

        if (!storedCustomerKey) {
          localStorage.setItem(
            LOCAL_STORAGE_KEYS.TOSS_CUSTOMER_KEY,
            customerKey,
          );
        }

        const paymentWidget = await loadPaymentWidget(clientKey, customerKey);
        paymentWidgetRef.current = paymentWidget;
      } catch {
        // 위젯 초기화 실패 시 결제 UI 미표시
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

  if (isLoading || isError) {
    return (
      <div className="min-h-screen pb-24">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-foreground mb-2">
                예약승차권 조회
              </h2>
              <p className="text-muted-foreground">
                예약한 승차권을 확인하고 결제하거나 취소할 수 있습니다
              </p>
            </div>
            {isLoading ? (
              <CardListSkeleton label="예약 목록을 불러오는 중" />
            ) : (
              <ErrorState
                title="예약 목록을 불러올 수 없습니다"
                description={error?.message ?? "일시적인 오류로 조회하지 못했습니다. 잠시 후 다시 시도해주세요."}
                action={
                  <>
                    <Button variant="outline" onClick={() => router.push("/")}>
                      홈으로 돌아가기
                    </Button>
                    <Button onClick={() => refetch()}>다시 시도</Button>
                  </>
                }
              />
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Page Title */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-foreground mb-2">
              예약승차권 조회
            </h2>
            <p className="text-muted-foreground">
              예약한 승차권을 확인하고 결제하거나 취소할 수 있습니다
            </p>
          </div>

          {/* Notice */}
          <Alert variant="info" role="note" className="mb-8">
            <Info className="h-4 w-4" />
            <AlertDescription className="font-medium">
              결제 기한이 지난 목록은 자동 삭제됩니다
            </AlertDescription>
          </Alert>

          {/* Reservation List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-foreground">예약 내역</h3>
              {validReservations.length > 0 && (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="select-all-reservations"
                    checked={allSelected}
                    onCheckedChange={toggleAllSelection}
                    className="data-[state=checked]:bg-primary"
                  />
                  <label
                    htmlFor="select-all-reservations"
                    className="cursor-pointer text-sm text-muted-foreground"
                  >
                    전체선택 ({selectedItems.length}/{validReservations.length})
                  </label>
                </div>
              )}
            </div>

            {reservations.length === 0 ? (
              <EmptyState
                icon={Clock}
                title="예약 내역이 없습니다"
                description="새로운 예약을 진행하세요."
                action={
                  <Button asChild>
                    <Link href="/">승차권 예매하기</Link>
                  </Button>
                }
              />
            ) : validReservations.length === 0 ? (
              <EmptyState
                icon={Clock}
                title="유효한 예약이 없습니다"
                description="결제 기한이 지난 예약은 자동으로 삭제됩니다."
                action={
                  <Button asChild>
                    <Link href="/">승차권 예매하기</Link>
                  </Button>
                }
              />
            ) : (
              validReservations.map((reservation) => (
                <Card
                  key={reservation.pendingBookingId}
                  className={`shadow-elev-sm transition-all duration-200 hover:shadow-elev-md ${selectedIds.has(reservation.pendingBookingId) ? "border-primary ring-[3px] ring-secondary" : ""}`}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-3">
                      <Checkbox
                        checked={selectedIds.has(reservation.pendingBookingId)}
                        onCheckedChange={() =>
                          toggleItemSelection(reservation.pendingBookingId)
                        }
                        aria-label={`${reservation.trainName} ${reservation.trainNumber} ${formatDate(reservation.operationDate)} ${reservation.departureStationName} 출발 ${reservation.arrivalStationName} 도착 예약 선택`}
                        className="mt-1 data-[state=checked]:bg-primary"
                      />
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <TrainTypeBadge trainName={reservation.trainName} />
                            <span className="text-lg font-bold">
                              {reservation.trainNumber}
                            </span>
                            <span className="text-muted-foreground">
                              {formatDate(reservation.operationDate)}
                            </span>
                          </div>
                          <div className="text-right">
                            <div className="text-xl font-bold text-primary">
                              {formatPrice(getTotalPrice(reservation))}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              예약번호: {reservation.pendingBookingId}
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div>
                            <h4 className="font-medium text-foreground mb-2 flex items-center">
                              <MapPin className="h-4 w-4 mr-1" />
                              운행 정보
                            </h4>
                            <div className="space-y-1">
                              <div className="flex items-center space-x-2">
                                <span className="font-medium">
                                  {reservation.departureStationName}
                                </span>
                                <ArrowRight className="h-3 w-3 text-muted-foreground" />
                                <span className="font-medium">
                                  {reservation.arrivalStationName}
                                </span>
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {formatTime(reservation.departureTime)} ~{" "}
                                {formatTime(reservation.arrivalTime)}
                              </div>
                            </div>
                          </div>

                          <div>
                            <h4 className="font-medium text-foreground mb-2">
                              좌석 정보
                            </h4>
                            <div className="text-sm font-medium">
                              {getSeatSummary(reservation.seats)}
                            </div>
                          </div>

                          <div>
                            <h4 className="font-medium text-foreground mb-2 flex items-center">
                              <Clock className="h-4 w-4 mr-1" />
                              결제 기한
                            </h4>
                          </div>
                        </div>

                        <div className="flex justify-end pt-4 border-t">
                          <Button
                            variant="outline-destructive"
                            size="sm"
                            onClick={() =>
                              handleCancelReservation(
                                reservation.pendingBookingId,
                              )
                            }
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
          <Alert variant="warning" role="note" className="mt-8">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle asChild>
              <h3 className="mb-2 font-semibold">예약승차권 조회 안내</h3>
            </AlertTitle>
            <AlertDescription>
              <ul className="space-y-1 list-disc list-inside">
                <li>
                  예약 후 10분 이내에 결제하지 않으면 자동으로 취소됩니다.
                </li>
                <li>결제 기한이 지난 예약은 자동으로 삭제됩니다.</li>
                <li>예약 취소는 결제 기한 내에만 가능합니다.</li>
                <li>예약번호는 예약 완료 시 발급된 번호입니다.</li>
              </ul>
            </AlertDescription>
          </Alert>
        </div>
      </div>

      {/* Bottom Payment Bar */}
      {selectedItems.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-card border-t shadow-elev-lg p-4 z-50">
          <div className="container mx-auto max-w-4xl flex items-center justify-between">
            <div>
              <span className="font-semibold">
                {selectedItems.length}개 선택
              </span>
              <span className="text-muted-foreground mx-2">·</span>
              <span className="text-lg font-bold text-primary">
                {formatPrice(totalPrice)}
              </span>
            </div>
            <Button
              onClick={handlePaymentClick}
              disabled={paymentLoading}
            >
              {paymentLoading ? (
                <LoadingSpinner size="sm" color="white" className="mr-2" />
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
              className={buttonVariants({ variant: "destructive" })}
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
