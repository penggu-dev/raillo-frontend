"use client";

import { useEffect, useRef, useState } from "react";

/**
 * 인증 유효 시간 — 만료 시각과의 차이로 남은 시간을 계산한다.
 * 1초씩 빼지 않는 이유: 백그라운드 탭에서는 타이머가 느려지거나 멈춰 실제 시간과 어긋난다.
 * 탭으로 돌아올 때도 다시 확인하고, 만료되면 onExpire를 한 번만 호출한다.
 */
export const useVerificationTimer = (
  expiresAt: number | null,
  onExpire: () => void,
) => {
  const [remainingMs, setRemainingMs] = useState(() =>
    expiresAt === null ? 0 : Math.max(0, expiresAt - Date.now()),
  );
  const onExpireRef = useRef(onExpire);
  onExpireRef.current = onExpire;

  useEffect(() => {
    if (expiresAt === null) {
      setRemainingMs(0);
      return;
    }

    let expired = false;
    const check = () => {
      const left = Math.max(0, expiresAt - Date.now());
      setRemainingMs(left);
      if (left === 0 && !expired) {
        expired = true;
        onExpireRef.current();
      }
    };

    check();
    const interval = setInterval(check, 1000);
    // 자리를 비운 사이 만료됐을 수 있다
    document.addEventListener("visibilitychange", check);
    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", check);
    };
  }, [expiresAt]);

  return remainingMs;
};

/** 남은 시간 표시 (m:ss) */
export const formatRemaining = (remainingMs: number): string => {
  const total = Math.ceil(remainingMs / 1000);
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
};
