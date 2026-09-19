import type { PaymentConfirmRequest } from "@/types/paymentsType";

// Toss 결제 리다이렉트 쿼리 해석 — successUrl·failUrl 뒤에 결제 결과가 쿼리로 붙어 돌아온다
type SearchParamsReader = Pick<URLSearchParams, "get">;

/**
 * 결제 성공 쿼리(`paymentKey`·`orderId`·`amount`)를 승인 요청으로 변환한다.
 * 값이 빠졌거나 금액이 양의 정수가 아니면 null
 */
export const parsePaymentSuccessParams = (
  params: SearchParamsReader,
): PaymentConfirmRequest | null => {
  const paymentKey = params.get("paymentKey");
  const orderId = params.get("orderId");
  const amountParam = params.get("amount");
  if (!paymentKey || !orderId || !amountParam) return null;

  const amount = Number(amountParam);
  if (!Number.isSafeInteger(amount) || amount <= 0) return null;

  return { paymentKey, orderId, amount };
};
