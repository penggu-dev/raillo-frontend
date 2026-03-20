import { api } from "../api";
import type {
  PaymentPrepareRequest,
  PaymentPrepareResponse,
  PaymentConfirmRequest,
  PaymentConfirmResponse,
} from "@/types/paymentsType";

const requireResult = <T>(result: T | undefined, message: string): T => {
  if (result === undefined) {
    throw new Error(message);
  }
  return result;
};

// 결제 준비
export const preparePayment = async (
  request: PaymentPrepareRequest,
): Promise<PaymentPrepareResponse> => {
  const response = await api.post<PaymentPrepareResponse["result"]>(
    "/api/v1/payments/prepare",
    request,
  );
  if (!response.result) {
    throw new Error(response.message ?? "결제 준비에 실패했습니다.");
  }
  return {
    message: response.message ?? "결제 준비가 완료되었습니다.",
    result: response.result,
  };
};

// 결제 승인
export const confirmPayment = async (
  request: PaymentConfirmRequest,
): Promise<PaymentConfirmResponse> => {
  const response = await api.post<PaymentConfirmResponse["result"]>(
    "/api/v1/payments/confirm",
    request,
  );
  if (!response.result) {
    throw new Error(response.message ?? "결제 승인에 실패했습니다.");
  }
  return {
    message: response.message ?? "결제 승인이 완료되었습니다.",
    result: response.result,
  };
};
