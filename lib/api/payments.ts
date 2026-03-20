import { api, requireResult } from "../api";
import type {
  PaymentPrepareRequest,
  PaymentPrepareResult,
  PaymentConfirmRequest,
  PaymentConfirmResult,
} from "@/types/paymentsType";

// 결제 준비
export const preparePayment = async (
  request: PaymentPrepareRequest,
): Promise<PaymentPrepareResult> => {
  const response = await api.post<PaymentPrepareResult>(
    "/api/v1/payments/prepare",
    request,
  );
  return requireResult(response.result, "결제 준비에 실패했습니다.");
};

// 결제 승인
export const confirmPayment = async (
  request: PaymentConfirmRequest,
): Promise<PaymentConfirmResult> => {
  const response = await api.post<PaymentConfirmResult>(
    "/api/v1/payments/confirm",
    request,
  );
  return requireResult(response.result, "결제 승인에 실패했습니다.");
};
