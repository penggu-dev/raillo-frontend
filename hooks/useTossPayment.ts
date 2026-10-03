"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
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

/** 결제 위젯 불러오기 — SDK와 Toss 원격 스크립트를 결제할 때만 받는다 */
const loadWidget = async (): Promise<PaymentWidgetInstance> => {
  const { loadPaymentWidget } = await import("@tosspayments/payment-widget-sdk");
  const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY as string;
  return loadPaymentWidget(clientKey, getCustomerKey());
};

/**
 * 결제 위젯 생명주기 — 결제 준비(위젯 불러오기 + 주문 번호·금액) → 결제창 요청.
 * 결제 승인은 successUrl(`/ticket/reservation/success`)이 맡는다.
 */
export const useTossPayment = () => {
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const widgetRef = useRef<PaymentWidgetInstance | null>(null);
  // 불러오는 중인 위젯 — 연달아 눌러도 한 번만 불러온다. 실패하면 비워 다음 시도에서 다시 불러온다
  const widgetLoadRef = useRef<Promise<PaymentWidgetInstance> | null>(null);
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

  const ensureWidget = (): Promise<PaymentWidgetInstance> => {
    if (widgetRef.current) return Promise.resolve(widgetRef.current);
    if (!widgetLoadRef.current) {
      widgetLoadRef.current = loadWidget().then(
        (loaded) => {
          widgetRef.current = loaded;
          setWidget(loaded);
          return loaded;
        },
        (err: unknown) => {
          widgetLoadRef.current = null;
          throw err;
        },
      );
    }
    return widgetLoadRef.current;
  };

  /** 결제 준비 — 위젯을 불러오면서 주문 번호·금액을 받아 결제창을 띄울 준비를 한다 */
  const prepare = async (selected: PendingBookingCartItem[]) => {
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
      // 둘 다 기다려야 결제 화면을 열 수 있다 — 동시에 진행해 버튼을 누른 뒤 기다림이 늘지 않게
      const [widgetResult, prepareResult] = await Promise.allSettled([
        ensureWidget(),
        preparePayment({
          pendingBookingIds: selected.map((item) => item.pendingBookingId),
        }),
      ]);

      if (prepareResult.status === "rejected") {
        toast({
          title: "결제 준비 실패",
          description: handleError(
            prepareResult.reason,
            "결제 준비 중 오류가 발생했습니다.",
            false,
          ),
          variant: "destructive",
        });
        return;
      }

      if (widgetResult.status === "rejected") {
        toast({
          title: "결제 위젯을 불러오지 못했습니다",
          description: "잠시 후 다시 시도해주세요.",
          variant: "destructive",
        });
        return;
      }

      const { orderId, amount } = prepareResult.value;
      setPaymentInfo({ orderId, amount });
      setShowPaymentDialog(true);
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
