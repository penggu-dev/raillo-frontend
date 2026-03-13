import { api } from "../api";
import type {
  PaymentProcessCardRequest,
  PaymentProcessAccountRequest,
  PaymentProcessResponse,
  PaymentHistoryResponse,
  PaymentCancelResponse,
} from "@/types/paymentsType";

const requireResult = <T>(result: T | undefined, message: string): T => {
  if (result === undefined) {
    throw new Error(message);
  }
  return result;
};

// 카드 결제 처리
export const processPaymentViaCard = async (
  request: PaymentProcessCardRequest,
): Promise<PaymentProcessResponse> => {
  const response = await api.post<PaymentProcessResponse>(
    "/api/v1/payments/card",
    request,
  );
  return requireResult(response.result, "카드 결제 응답 데이터가 없습니다.");
};

// 계좌이체 결제 처리
export const processPaymentViaBankAccount = async (
  request: PaymentProcessAccountRequest,
): Promise<PaymentProcessResponse> => {
  const response = await api.post<PaymentProcessResponse>(
    "/api/v1/payments/bank-account",
    request,
  );
  return requireResult(
    response.result,
    "계좌이체 결제 응답 데이터가 없습니다.",
  );
};

// 결제 취소
export const cancelPayment = async (
  paymentKey: string,
): Promise<PaymentCancelResponse> => {
  const response = await api.post<PaymentCancelResponse>(
    `/api/v1/payments/${paymentKey}/cancel`,
  );
  return requireResult(response.result, "결제 취소 응답 데이터가 없습니다.");
};

// 결제 내역 조회
export const getPaymentHistory = async (): Promise<
  PaymentHistoryResponse[]
> => {
  const response = await api.get<PaymentHistoryResponse[]>("/api/v1/payments");
  return requireResult(response.result, "결제 내역 응답 데이터가 없습니다.");
};
