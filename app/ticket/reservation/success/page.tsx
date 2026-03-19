"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { confirmPayment } from "@/lib/api/payments";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { PaymentConfirmResult } from "@/types/paymentsType";

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [paymentResult, setPaymentResult] = useState<PaymentConfirmResult | null>(null);
  const [isConfirming, setIsConfirming] = useState(true);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const confirm = async () => {
      // 쿼리 파라미터에서 결제 정보 가져오기
      const paymentKey = searchParams.get("paymentKey");
      const orderId = searchParams.get("orderId");
      const amount = searchParams.get("amount");

      if (!paymentKey || !orderId || !amount) {
        setIsConfirming(false);
        return;
      }

      try {
        // 결제 확정 API 호출
        const response = await confirmPayment({
          paymentKey,
          orderId,
          amount: Number(amount),
        });

        if (response.result) {
          setPaymentResult(response.result);
        }
      } catch (err) {
        console.error("결제 확정 실패:", err);
        setIsError(true);
        setError(err instanceof Error ? err : new Error("결제 확정에 실패했습니다."));
      } finally {
        setIsConfirming(false);
      }
    };

    confirm();
  }, [searchParams, confirmPayment]);

  const getPaymentMethodName = (method: string) => {
    switch (method) {
      case "CREDIT_CARD":
        return "신용카드";
      case "BANK_TRANSFER":
        return "계좌이체";
      case "VIRTUAL_ACCOUNT":
        return "가상계좌";
      case "MOBILE":
        return "휴대폰";
      default:
        return method;
    }
  };

  const getPaymentStatusName = (status: string) => {
    switch (status) {
      case "PENDING":
        return "대기중";
      case "DONE":
        return "완료";
      case "CANCELED":
        return "취소됨";
      case "FAILED":
        return "실패";
      default:
        return status;
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "DONE":
        return "bg-green-600 text-white";
      case "PENDING":
        return "bg-yellow-600 text-white";
      case "CANCELED":
      case "FAILED":
        return "bg-red-600 text-white";
      default:
        return "bg-gray-600 text-white";
    }
  };

  if (isConfirming) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        <div className="container mx-auto px-4 py-16 text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">결제를 확인하는 중입니다...</p>
        </div>
      </div>
    );
  }

  if (isError || !paymentResult) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        <div className="container mx-auto px-4 py-16 text-center">
          <XCircle className="h-16 w-16 text-red-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">결제 확인 실패</h2>
          <p className="text-gray-600 mb-6">
            {error?.message || "결제 정보를 확인할 수 없습니다."}
          </p>
          <Button onClick={() => router.push("/")} variant="outline">
            홈으로 돌아가기
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* 성공 메시지 */}
          <div className="text-center mb-8">
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-gray-900 mb-2">결제가 완료되었습니다</h2>
            <p className="text-gray-600">결제 정보가 확인되었습니다.</p>
          </div>

          {/* 결제 정보 카드 */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>결제 정보</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">결제 ID</span>
                <span className="font-semibold">{paymentResult.paymentId}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">주문 ID</span>
                <span className="font-semibold">{paymentResult.orderId}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">결제 수단</span>
                <Badge variant="outline">
                  {getPaymentMethodName(paymentResult.paymentMethod)}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">결제 상태</span>
                <Badge className={getPaymentStatusColor(paymentResult.paymentStatus)}>
                  {getPaymentStatusName(paymentResult.paymentStatus)}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">결제 금액</span>
                <span className="text-lg font-bold text-blue-600">
                  {paymentResult.amount.toLocaleString()}원
                </span>
              </div>
              {paymentResult.paidAt && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">결제 일시</span>
                  <span className="font-semibold">
                    {format(new Date(paymentResult.paidAt), "yyyy년 MM월 dd일 HH:mm:ss", {
                      locale: ko,
                    })}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 버튼 */}
          <div className="flex space-x-4">
            <Button
              onClick={() => router.push("/")}
              variant="outline"
              className="flex-1"
            >
              홈으로
            </Button>
            <Button
              onClick={() => router.push("/ticket/reservation")}
              className="flex-1"
            >
              예약 내역 보기
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
