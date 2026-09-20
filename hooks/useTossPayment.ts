"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { loadPaymentWidget } from "@tosspayments/payment-widget-sdk";
import type { PaymentWidgetInstance } from "@tosspayments/payment-widget-sdk";
import { preparePayment } from "@/lib/api/payments";
import { LOCAL_STORAGE_KEYS } from "@/constants/storageKeys";
import { handleError } from "@/lib/utils/errorHandler";
import { getPaymentFailNotice } from "@/lib/utils/paymentRedirect";
import { useToast } from "@/hooks/useToast";
import type { PendingBookingCartItem } from "@/types/bookingType";

interface PaymentInfo {
  orderId: string;
  amount: number;
}

/** 결제창에 보여 줄 주문 이름 — 여러 건이면 첫 열차 기준으로 묶어 적는다 */
const orderNameOf = (selected: PendingBookingCartItem[]): string => {
  const [first] = selected;
  return selected.length > 1
    ? `${first.trainName} ${first.trainNumber} 외 ${selected.length - 1}매`
    : `${first.trainName} ${first.trainNumber} 승차권`;
};

/** 결제 위젯을 열 때 쓰는 고객 키 — 한 번 만들어 보관한다 */
const getCustomerKey = (): string => {
  const stored = localStorage.getItem(LOCAL_STORAGE_KEYS.TOSS_CUSTOMER_KEY);
  if (stored) return stored;

  const created =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? `customer-${crypto.randomUUID()}`
      : `customer-${Math.random().toString(36).slice(2)}`;
  localStorage.setItem(LOCAL_STORAGE_KEYS.TOSS_CUSTOMER_KEY, created);
  return created;
};

/**
 * 결제 위젯 생명주기 — 위젯 초기화 → 결제 준비(주문 번호·금액) → 결제창 요청.
 * 결제 승인은 successUrl(`/ticket/reservation/success`)이 맡는다.
 */
export const useTossPayment = ({ enabled }: { enabled: boolean }) => {
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const widgetRef = useRef<PaymentWidgetInstance | null>(null);
  // 렌더에도 쓰이므로 상태로 함께 둔다 — 로드가 끝나면 결제 화면을 그릴 수 있다
  const [widget, setWidget] = useState<PaymentWidgetInstance | null>(null);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo | null>(null);
  const [paymentLoading, setPaymentLoading] = useState(false);

  // 결제 실패·취소로 돌아온 경우(failUrl의 code·message) 안내 후 주소에서 제거
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

  useEffect(() => {
    if (!enabled) return;

    const init = async () => {
      try {
        const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY as string;
        const loaded = await loadPaymentWidget(clientKey, getCustomerKey());
        widgetRef.current = loaded;
        setWidget(loaded);
      } catch {
        // 위젯 초기화 실패 시 결제 UI 미표시
      }
    };

    init();
  }, [enabled]);

  /** 결제 준비 — 주문 번호·금액을 받아 결제창을 띄울 준비를 한다 */
  const prepare = async (selected: PendingBookingCartItem[]) => {
    if (!widgetRef.current) {
      toast({
        title: "결제 위젯 준비 중",
        description: "잠시 후 다시 시도해주세요.",
        variant: "destructive",
      });
      return;
    }

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
      setPaymentInfo({ orderId: result.orderId, amount: result.amount });
      setShowPaymentDialog(true);
    } catch (err) {
      toast({
        title: "결제 준비 실패",
        description: handleError(err, "결제 준비 중 오류가 발생했습니다.", false),
        variant: "destructive",
      });
    } finally {
      setPaymentLoading(false);
    }
  };

  /** 결제창 요청 — 성공하면 Toss가 successUrl로 보내고 그 화면이 승인한다 */
  const requestPayment = async (selected: PendingBookingCartItem[]) => {
    if (!widgetRef.current || !paymentInfo || selected.length === 0) return;

    try {
      await widgetRef.current.requestPayment({
        orderId: paymentInfo.orderId,
        orderName: orderNameOf(selected),
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

      // 사용자가 닫은 것은 오류가 아니다 — 조용히 결제 화면만 닫는다
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

  return {
    widget,
    paymentInfo,
    paymentLoading,
    showPaymentDialog,
    setShowPaymentDialog,
    prepare,
    requestPayment,
  };
};
