"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { loadPaymentWidget, PaymentWidgetInstance } from "@tosspayments/payment-widget-sdk";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
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
import { formatPrice, formatDate, formatTime } from "@/lib/utils/format";
import { getTrainTypeColor } from "@/lib/utils/ticketUtils";
import {
  Clock,
  MapPin,
  ArrowRight,
  CreditCard,
  ShoppingCart,
  ChevronUp,
  ChevronDown,
  CheckCircle,
} from "lucide-react";
import { deletePendingBookings } from "@/lib/api/pendingBookings";
import { handleError } from "@/lib/utils/errorHandler";
import { useGetPendingBookingList } from "@/hooks/usePendingBooking";
import type { PendingBookingInfo } from "@/types/bookingType";
import { usePostPaymentPrepare } from "@/hooks/usePayment";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

export default function ReservationPage() {
  const searchParams = useSearchParams();
  const requestedPendingBookingId = searchParams.get("pendingBookingId");
  const router = useRouter();
  const { isAuthenticated, isChecking } = useAuth({ redirectPath: "/ticket/reservation" });
  const {
    data,
    isLoading,
    isError,
    error: queryError,
  } = useGetPendingBookingList();
  const [selectedBooking, setSelectedBooking] =
    useState<PendingBookingInfo | null>(null);
  const [timeRemaining, setTimeRemaining] = useState("");
  const [isNoticeOpen, setIsNoticeOpen] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showCartDialog, setShowCartDialog] = useState(false);
  const [showCartSuccessDialog, setShowCartSuccessDialog] = useState(false);
  const paymentWidgetRef = useRef<PaymentWidgetInstance | null>(null);
  const paymentMethodsWidgetRef = useRef<ReturnType<PaymentWidgetInstance["renderPaymentMethods"]> | null>(null);
  const [showPaymentWidget, setShowPaymentWidget] = useState(false);
  const [paymentInfo, setPaymentInfo] = useState<{ orderId: string; amount: number } | null>(null);
  const { mutateAsync: preparePayment } = usePostPaymentPrepare();
  const { toast } = useToast();

  // 대기 예약 목록에서 첫 번째 항목을 선택 (또는 선택된 항목이 있으면 유지)
  useEffect(() => {
    if (data?.result && data.result.length > 0) {
      if (requestedPendingBookingId) {
        const requestedBooking = data.result.find(
          (booking) => booking.pendingBookingId === requestedPendingBookingId
        );
        if (requestedBooking) {
          setSelectedBooking(requestedBooking);
          return;
        }
      }

      // 첫 번째 항목을 기본으로 선택
      if (!selectedBooking) {
        setSelectedBooking(data.result[0]);
      } else {
        // 선택된 항목이 있으면 리스트에서 찾아서 업데이트
        const found = data.result.find(
          (b) => b.pendingBookingId === selectedBooking.pendingBookingId
        );
        if (found) {
          setSelectedBooking(found);
        } else {
          // 선택된 항목이 리스트에 없으면 첫 번째 항목 선택
          setSelectedBooking(data.result[0]);
        }
      }
    }
  }, [data, requestedPendingBookingId, selectedBooking]);

  // 대기 예약은 만료 시간이 없으므로 타이머 제거
  // 필요시 다른 로직으로 대체 가능

  // 토스 페이먼츠 위젯 초기화
  useEffect(() => {
    if (isChecking || !isAuthenticated) {
      return;
    }

    const initPaymentWidget = async () => {
      try {
        // TODO: 실제 클라이언트 키로 변경 필요
        const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY || "test_ck_D5GePWvyJnrK0W0k6q8gLzN97Eoq";
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
      } catch (error) {
        console.error("토스 페이먼츠 위젯 초기화 실패:", error);
      }
    };

    initPaymentWidget();
  }, [isAuthenticated, isChecking]);

  // 결제 수단 선택 UI 렌더링
  useEffect(() => {
    if (isChecking || !isAuthenticated) {
      return;
    }

    if (!showPaymentWidget || !paymentWidgetRef.current || !paymentInfo) return;

    const renderPaymentMethods = async () => {
      try {
        const paymentMethodsWidget = paymentWidgetRef.current!.renderPaymentMethods(
          "#payment-widget",
          { value: paymentInfo.amount },
          { variantKey: "DEFAULT" }
        );
        paymentMethodsWidgetRef.current = paymentMethodsWidget;
      } catch (error) {
        console.error("결제 수단 UI 렌더링 실패:", error);
      }
    };

    renderPaymentMethods();

    return () => {
      if (paymentMethodsWidgetRef.current) {
        paymentMethodsWidgetRef.current = null;
      }
    };
  }, [isAuthenticated, isChecking, showPaymentWidget, paymentInfo]);

  // 예약하기 버튼 클릭 핸들러 - 결제 준비 API 호출 후 결제 수단 선택 UI 표시
  const handleReservation = async () => {
    if (!paymentWidgetRef.current) {
      toast({
        title: "결제 위젯 준비 중",
        description: "잠시 후 다시 시도해주세요.",
        variant: "destructive",
      });
      return;
    }

    if (!selectedBooking) {
      toast({
        title: "예약 정보 없음",
        description: "예약 정보를 찾을 수 없습니다.",
        variant: "destructive",
      });
      return;
    }

    try {
      // 결제 준비 API 호출 - 대기 예약 ID 목록과 함께 전송
      const response = await preparePayment({
        pendingBookingIds: [selectedBooking.pendingBookingId],
      });
      
      if (response.result) {
        // 받아온 orderId와 amount 저장
        setPaymentInfo({
          orderId: response.result.orderId,
          amount: response.result.amount,
        });
        
        // 결제 수단 선택 UI 표시
        setShowPaymentWidget(true);
      }
    } catch (error) {
      console.error("결제 준비 실패:", error);
      toast({
        title: "결제 준비 실패",
        description:
          error instanceof Error
            ? error.message
            : "결제 준비 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  // 결제 요청 핸들러
  const handleRequestPayment = async () => {
    if (!paymentWidgetRef.current || !selectedBooking || !paymentInfo) {
      return;
    }

    try {
      // 결제 위젯 요청 (서버에서 받아온 orderId 사용)
      await paymentWidgetRef.current.requestPayment({
        orderId: paymentInfo.orderId,
        orderName: `${selectedBooking.trainName} ${selectedBooking.trainNumber} 승차권`,
        successUrl: `${window.location.origin}/ticket/reservation/success`,
        failUrl: `${window.location.origin}/ticket/reservation/fail`,
      });
    } catch (error: unknown) {
      const paymentError = error as { code?: string; message?: string };
      const errorCode = String(paymentError.code ?? "");
      const errorMessage = String(paymentError.message ?? "");
      const isUserCancel =
        errorCode === "USER_CANCEL" ||
        errorCode.includes("CANCEL") ||
        errorMessage.includes("취소");

      // 사용자가 결제창에서 취소한 경우는 오류로 취급하지 않음
      if (isUserCancel) {
        setShowPaymentWidget(false);
        return;
      }

      console.error("결제 요청 실패:", error);
      toast({
        title: "결제 요청 실패",
        description: "결제 요청 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  const handleCancelReservation = () => {
    setShowCancelDialog(true);
  };

  const confirmCancelReservation = async () => {
    setShowCancelDialog(false);
    try {
      if (selectedBooking) {
        const response = await deletePendingBookings([selectedBooking.pendingBookingId]);
        const successMessage =
          response.message ??
          response.result?.message ??
          "대기 예약이 취소되었습니다.";

        toast({
          title: "대기 예약 취소",
          description: successMessage,
        });
        router.push("/");
      } else {
        toast({
          title: "예약 정보 없음",
          description: "예약 정보를 찾을 수 없습니다.",
          variant: "destructive",
        });
      }
    } catch (e: unknown) {
      const errorMessage = handleError(e, "예약 취소 중 오류가 발생했습니다.", false);
      toast({
        title: "예약 취소 실패",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleAddToCart = () => {
    setShowCartDialog(true);
  };

  const confirmAddToCart = async () => {
    setShowCartDialog(false);
    try {
      if (selectedBooking) {
        // 대기 예약은 일반 예약과 다르므로 장바구니 추가 로직이 다를 수 있음
        // 필요시 대기 예약 전용 API 호출
        toast({
          title: "장바구니 추가 불가",
          description: "대기 예약은 장바구니에 추가할 수 없습니다.",
          variant: "destructive",
        });
        // const response = await addToCart({ reservationId: selectedBooking.pendingBookingId })
        // if (response.message) {
        //   setShowCartSuccessDialog(true)
        // } else {
        //   alert('장바구니 추가에 실패했습니다.')
        // }
      } else {
        toast({
          title: "예약 정보 없음",
          description: "예약 정보를 찾을 수 없습니다.",
          variant: "destructive",
        });
      }
    } catch (e: unknown) {
      const errorMessage = handleError(
        e,
        "장바구니 추가 중 오류가 발생했습니다.",
        false
      );
      toast({
        title: "장바구니 추가 실패",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleCartSuccessConfirm = () => {
    setShowCartSuccessDialog(false);
    // 현재 페이지에 머물기 (아무 동작 안함)
  };

  const handleGoToCart = () => {
    setShowCartSuccessDialog(false);
    router.push("/cart");
  };

  const handlePayment = () => {
    if (selectedBooking) {
      // 대기 예약 ID를 세션 스토리지에 저장하고 결제 페이지로 이동
      sessionStorage.setItem(
        "tempPendingBookingId",
        selectedBooking.pendingBookingId
      );
      router.push("/ticket/payment");
    }
  };

  // 대기 예약에는 fare 정보가 없음
  const getTotalPrice = () => {
    return 0;
  };

  if (isChecking) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p className="text-gray-600">로그인 상태를 확인하고 있습니다...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const loading = isLoading;
  const error = queryError?.message || null;
  const reservation = selectedBooking;

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">대기 예약 정보를 불러오고 있습니다...</p>
      </div>
    );
  }

  if (isError || !data?.result || data.result.length === 0 || !reservation) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="text-red-600 mb-4">
          <p className="text-lg font-semibold">
            대기 예약 정보를 불러올 수 없습니다
          </p>
          <p className="text-sm">{error || "대기 예약이 없습니다."}</p>
        </div>
        <Button onClick={() => router.push("/")} variant="outline">
          홈으로 돌아가기
        </Button>
      </div>
    );
  }

  return (
    <div>
      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Page Title */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              대기 예약 목록
            </h2>
            <p className="text-gray-600">
              대기 예약 목록입니다. 좌석이 확정되면 알림을 드립니다.
            </p>
          </div>

          {/* Payment Deadline Warning */}
          <Card className="mb-6 bg-red-50 border-red-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-center space-x-2 text-red-700">
                <Clock className="h-5 w-5" />
                <span className="font-medium">
                  결제기한이 지난 목록은 자동 삭제됩니다
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Reservation Details */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="border-l-4 border-blue-500 pl-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <Badge
                      className={`${getTrainTypeColor(
                        reservation.trainName
                      )} px-3 py-1`}
                    >
                      {reservation.trainName}
                    </Badge>
                    <span className="text-xl font-bold">
                      {reservation.trainNumber}
                    </span>
                    <span className="text-gray-600">
                      {formatDate(reservation.operationDate)}
                    </span>
                    <Badge variant="outline" className="ml-2">
                      대기 예약
                    </Badge>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCancelReservation}
                    >
                      예약취소
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleReservation}>
                      예약하기
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                  {/* Route Information */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                      <MapPin className="h-4 w-4 mr-2" />
                      운행 정보
                    </h3>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-4">
                        <span className="text-lg font-semibold">
                          {reservation.departureStationName}
                        </span>
                        <ArrowRight className="h-4 w-4 text-gray-400" />
                        <span className="text-lg font-semibold">
                          {reservation.arrivalStationName}
                        </span>
                      </div>
                      <div className="flex items-center space-x-4 text-gray-600">
                        <span>{formatTime(reservation.departureTime)}</span>
                        <span>~</span>
                        <span>{formatTime(reservation.arrivalTime)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Seat Information */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">
                      좌석 정보
                    </h3>
                    <div className="space-y-2">
                      <div className="space-y-1">
                        {reservation.seats.map((seat, index) => (
                          <div
                            key={seat.seatId || index}
                            className="flex items-center justify-between"
                          >
                            <div className="flex items-center space-x-2">
                              <span className="font-medium">
                                {seat.carType === "FIRST_CLASS"
                                  ? "특실"
                                  : seat.carType === "STANDARD"
                                  ? "일반실"
                                  : "일반실"}
                              </span>
                              <span className="text-gray-600">
                                {seat.carNumber}호차 {seat.seatNumber}
                              </span>
                              <Badge variant="outline" className="text-xs">
                                {seat.passengerType === "ADULT"
                                  ? "어른"
                                  : seat.passengerType === "CHILD"
                                  ? "어린이"
                                  : seat.passengerType === "SENIOR"
                                  ? "경로"
                                  : seat.passengerType === "DISABLED_HEAVY"
                                  ? "중증장애인"
                                  : seat.passengerType === "DISABLED_LIGHT"
                                  ? "경증장애인"
                                  : seat.passengerType === "VETERAN"
                                  ? "국가유공자"
                                  : seat.passengerType === "INFANT"
                                  ? "유아"
                                  : seat.passengerType}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="border-t pt-2">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold">대기 예약</span>
                          <span className="text-sm text-gray-600">
                            좌석 확정 대기 중
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 대기 예약 안내 */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-5 w-5 text-blue-600" />
                    <span className="font-medium text-blue-800">
                      대기 예약 상태
                    </span>
                  </div>
                  <p className="text-sm text-blue-700 mt-2">
                    좌석이 확정되면 알림을 드립니다. 대기 예약은 좌석이 확정될
                    때까지 대기 상태입니다.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 결제 수단 선택 UI */}
          {showPaymentWidget && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>결제 수단 선택</CardTitle>
              </CardHeader>
              <CardContent>
                <div id="payment-widget" className="mb-4"></div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowPaymentWidget(false)}
                  >
                    취소
                  </Button>
                  <Button onClick={handleRequestPayment} className="flex-1">
                    결제하기
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 대기 예약은 결제 불가 */}
          {data.result.length > 1 && !showPaymentWidget && (
            <div className="text-center mb-8">
              <p className="text-gray-600 mb-4">
                다른 대기 예약 {data.result.length - 1}개가 있습니다.
              </p>
            </div>
          )}

          {/* Notice Section */}
          <Card>
            <Collapsible open={isNoticeOpen} onOpenChange={setIsNoticeOpen}>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">안내</CardTitle>
                    {isNoticeOpen ? (
                      <ChevronUp className="h-5 w-5" />
                    ) : (
                      <ChevronDown className="h-5 w-5" />
                    )}
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="pt-0">
                  <div className="space-y-2 text-sm text-gray-600">
                    <p>• 대기 예약은 좌석이 확정될 때까지 대기 상태입니다.</p>
                    <p>• 좌석이 확정되면 알림을 드립니다.</p>
                    <p>• 대기 예약은 취소할 수 있습니다.</p>
                    <p>• 대기 예약 ID: {reservation.pendingBookingId}</p>
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        </div>
      </main>

      {/* Cancel Reservation Dialog */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>예약 취소</AlertDialogTitle>
            <AlertDialogDescription>
              예약을 취소하시겠습니까?
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

      {/* Add to Cart Dialog */}
      <AlertDialog open={showCartDialog} onOpenChange={setShowCartDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>장바구니 추가</AlertDialogTitle>
            <AlertDialogDescription>
              해당 목록을 장바구니로 이동하시겠습니까?
              <br />
              장바구니에서 여러 승차권을 함께 결제할 수 있습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction onClick={confirmAddToCart}>
              확인
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Cart Success Dialog */}
      <AlertDialog
        open={showCartSuccessDialog}
        onOpenChange={setShowCartSuccessDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center space-x-2">
              <CheckCircle className="h-6 w-6 text-green-600" />
              <span>장바구니 등록 완료</span>
            </AlertDialogTitle>
            <AlertDialogDescription>
              장바구니에 등록되었습니다.
              <br />
              장바구니에서 여러 승차권을 함께 결제하거나 현재 페이지에서 계속
              이용하실 수 있습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCartSuccessConfirm}>
              확인
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleGoToCart}
              className="bg-blue-600 hover:bg-blue-700"
            >
              장바구니로 이동
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
