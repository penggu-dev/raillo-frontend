// ========== 결제 준비 ==========

export interface PaymentPrepareRequest {
  pendingBookingIds: string[];
}

export interface PaymentPrepareResult {
  orderId: string;
  amount: number;
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
