// ========== 결제 처리 ==========

export interface PaymentProcessCardRequest {
  reservationId: number;
  amount: number;
  cardNumber: string;
  validThru: string;
  rrn: string;
  installmentMonths: number;
  cardPassword: number;
}

export interface PaymentProcessAccountRequest {
  reservationId: number;
  amount: number;
  bankCode: string;
  accountNumber: string;
  accountHolderName: string;
  identificationNumber: string;
  accountPassword: string;
}

export interface PaymentProcessResponse {
  paymentId: number;
  paymentKey: string;
  amount: number;
  paymentMethod: string;
  paymentStatus: string;
  paidAt: string;
}

export interface PaymentHistoryResponse {
  paymentId: number;
  paymentKey: string;
  reservationCode: string;
  amount: number;
  paymentMethod: string;
  paymentStatus: string;
  paidAt: string;
  cancelledAt?: string;
  refundedAt?: string;
}

export interface PaymentCancelResponse {
  paymentId: number;
  paymentKey: string;
  amount: number;
  cancelledAt: string;
  refundAmount: number;
}

// ========== 결제 준비 ==========

export interface PaymentPrepareRequest {
  pendingBookingIds: string[];
}

export interface PaymentPrepareResult {
  orderId: string;
  amount: number;
}

export interface PaymentPrepareResponse {
  message: string;
  result: PaymentPrepareResult;
}

// ========== 결제 승인 ==========

export interface PaymentConfirmRequest {
  paymentKey: string;
  orderId: string;
  amount: number;
}

export interface PaymentConfirmResult {
  paymentId: number;
  orderId: string;
  paymentKey: string;
  amount: number;
  paymentMethod: string;
  paymentStatus: string;
  paidAt: string;
}

export interface PaymentConfirmResponse {
  message: string;
  result: PaymentConfirmResult;
}
