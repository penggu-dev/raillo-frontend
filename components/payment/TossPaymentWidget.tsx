"use client";

import { useEffect, useRef } from "react";
import { PaymentWidgetInstance } from "@tosspayments/payment-widget-sdk";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils/format";

interface TossPaymentWidgetProps {
  paymentWidget: PaymentWidgetInstance;
  paymentInfo: { orderId: string; amount: number };
  onCancel: () => void;
  onRequestPayment: () => void;
}

/**
 * Toss Payments 결제 수단 위젯 컴포넌트
 *
 * shadcn Dialog의 Portal 렌더링 특성상 부모 컴포넌트에서 renderPaymentMethods를 호출하면
 * #payment-widget DOM 요소가 아직 마운트되지 않은 시점일 수 있습니다.
 * 이 컴포넌트를 Dialog 내부에 조건부 렌더링하면, 컴포넌트 자신의 useEffect가
 * 마운트 이후에 실행되므로 DOM 존재를 보장할 수 있습니다.
 */
export function TossPaymentWidget({
  paymentWidget,
  paymentInfo,
  onCancel,
  onRequestPayment,
}: TossPaymentWidgetProps) {
  const paymentMethodsWidgetRef = useRef<ReturnType<
    PaymentWidgetInstance["renderPaymentMethods"]
  > | null>(null);

  useEffect(() => {
    const render = async () => {
      try {
        const widget = paymentWidget.renderPaymentMethods(
          "#payment-widget",
          { value: paymentInfo.amount },
          { variantKey: "DEFAULT" },
        );
        paymentMethodsWidgetRef.current = widget;
      } catch (err) {
        console.error("결제 수단 UI 렌더링 실패:", err);
      }
    };
    render();

    return () => {
      paymentMethodsWidgetRef.current = null;
    };
  }, [paymentWidget, paymentInfo.amount]);

  return (
    <>
      <div id="payment-widget" className="mb-4" />
      <div className="flex space-x-3">
        <Button variant="outline" onClick={onCancel} className="flex-1">
          취소
        </Button>
        <Button
          onClick={onRequestPayment}
          className="flex-1 bg-blue-600 hover:bg-blue-700"
        >
          {formatPrice(paymentInfo.amount)} 결제하기
        </Button>
      </div>
    </>
  );
}
