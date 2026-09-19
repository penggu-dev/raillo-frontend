"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import AuthGuard from "@/components/auth/AuthGuard";
import { Button, buttonVariants } from "@/components/ui/button";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { ErrorState } from "@/components/common/ErrorState";
import { confirmPayment } from "@/lib/api/payments";
import { PENDING_BOOKINGS_QUERY_KEY } from "@/hooks/usePendingBooking";
import { handleError } from "@/lib/utils/errorHandler";
import { parsePaymentSuccessParams } from "@/lib/utils/paymentRedirect";
import { useToast } from "@/hooks/useToast";

type ConfirmStatus = "confirming" | "invalid" | "failed";

// Toss 결제 인증 후 돌아오는 successUrl — 쿼리의 결제 정보로 승인해야 발권된다
function PaymentSuccessPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [status, setStatus] = useState<ConfirmStatus>("confirming");
  const [errorMessage, setErrorMessage] = useState("");
  // 개발 모드 effect 이중 실행에도 승인은 한 번만 요청
  const requestedRef = useRef(false);

  const confirm = useCallback(async () => {
    const request = parsePaymentSuccessParams(searchParams);
    if (!request) {
      setStatus("invalid");
      return;
    }

    setStatus("confirming");
    try {
      await confirmPayment(request);
      queryClient.invalidateQueries({ queryKey: PENDING_BOOKINGS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
      toast({ description: "결제가 완료되었습니다." });
      // 결제 정보가 담긴 주소를 히스토리에 남기지 않음 — 뒤로 가기로 다시 승인하지 않도록
      router.replace("/ticket/purchased");
    } catch (err: unknown) {
      setErrorMessage(handleError(err, "결제 승인에 실패했습니다.", false));
      setStatus("failed");
    }
  }, [searchParams, queryClient, toast, router]);

  useEffect(() => {
    if (requestedRef.current) return;
    requestedRef.current = true;
    confirm();
  }, [confirm]);

  if (status === "confirming") {
    return (
      <div className="min-h-screen">
        <div
          className="container mx-auto px-4 py-16 text-center"
          role="status"
        >
          <LoadingSpinner className="mx-auto mb-4" />
          <p className="text-muted-foreground">결제를 승인하는 중입니다...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-foreground mb-8 text-center">
            결제 확인
          </h2>
          {status === "invalid" ? (
            <ErrorState
              title="결제 정보를 확인할 수 없습니다"
              description="결제 결과 정보가 올바르지 않습니다. 예약 목록에서 결제 상태를 확인해주세요."
              action={
                <Link href="/ticket/reservations" className={buttonVariants()}>
                  예약 목록으로
                </Link>
              }
            />
          ) : (
            <ErrorState
              title="결제를 승인하지 못했습니다"
              description={`${errorMessage} 다시 시도하거나 예약 목록에서 결제 상태를 확인해주세요.`}
              action={
                <>
                  <Button onClick={confirm}>다시 시도</Button>
                  <Link
                    href="/ticket/reservations"
                    className={buttonVariants({ variant: "outline" })}
                  >
                    예약 목록으로
                  </Link>
                </>
              }
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <AuthGuard>
      <PaymentSuccessPageContent />
    </AuthGuard>
  );
}
