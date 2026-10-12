"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { ApiError } from "@/lib/api";
import { AuthInitializer } from "./AuthInitializer";

// 조회 재시도 — 4xx는 다시 보내도 같으므로 바로 실패(401은 lib/api가 이미 재발급·1회 재시도함),
// 네트워크 오류·5xx 등은 한 번만 다시 시도한다. 기본(3회·지수 백오프)이면 실패 화면이 약 7초 늦게 뜬다
const retryQuery = (failureCount: number, error: Error): boolean => {
  if (error instanceof ApiError && error.status >= 400 && error.status < 500) return false;
  return failureCount < 1;
};

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1분
            refetchOnWindowFocus: false,
            retry: retryQuery,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AuthInitializer />
      {children}
    </QueryClientProvider>
  );
}
