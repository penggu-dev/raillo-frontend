import type { PaymentConfirmRequest } from "@/types/paymentsType";

// Toss 결제 리다이렉트 쿼리 해석 — successUrl·failUrl 뒤에 결제 결과가 쿼리로 붙어 돌아온다
type SearchParamsReader = Pick<URLSearchParams, "get">;

/** 사용자가 결제창을 닫거나 취소했을 때 failUrl로 전달되는 코드 */
const USER_CANCEL_CODE = "PAY_PROCESS_CANCELED";

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

export interface PaymentFailNotice {
  title: string;
  description: string;
  /** 사용자 취소 여부 — 오류가 아니라 안내로 표시 */
  canceled: boolean;
}

/** 결제 실패 쿼리(`code`·`message`)를 안내 문구로 변환한다. 실패 쿼리가 없으면 null */
export const getPaymentFailNotice = (
  params: SearchParamsReader,
): PaymentFailNotice | null => {
  const code = params.get("code");
  if (!code) return null;

  if (code === USER_CANCEL_CODE) {
    return {
      title: "결제 취소",
      description: "결제가 취소되었습니다.",
      canceled: true,
    };
  }

  return {
    title: "결제 실패",
    description:
      params.get("message") || "결제가 완료되지 않았습니다. 다시 시도해주세요.",
    canceled: false,
  };
};
