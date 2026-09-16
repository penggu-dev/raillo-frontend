import type { RefObject } from "react";

/** 오버레이가 닫힐 때 포커스를 돌려줄 대상 (트리거 없이 상태로 여닫는 모달이라 Radix가 알 수 없음) */
export type ReturnFocusRef = RefObject<HTMLElement | null>;

const hasOpenOverlay = (): boolean =>
  !!document.querySelector('[data-state="open"][role="dialog"], [data-state="open"][role="alertdialog"]');

/**
 * 오버레이가 닫힌 뒤 포커스 복귀.
 * - 전환(예매 패널 → 좌석 선택)처럼 다른 모달이 이미 열려 있으면 그 모달에서 포커스를 뺏지 않도록 건너뛴다.
 * - 언마운트가 포커스를 body로 되돌릴 수 있어, 다음 프레임에 상태를 다시 확인하고 한 번 더 맞춘다.
 */
export const restoreFocus = (target: HTMLElement | null): void => {
  if (hasOpenOverlay()) return;
  if (target?.isConnected) target.focus();

  requestAnimationFrame(() => {
    if (!target?.isConnected || hasOpenOverlay()) return;
    if (document.activeElement !== target) target.focus();
  });
};
