import { useInfiniteQuery } from "@tanstack/react-query";
import { searchTrains } from "@/lib/api/trains";
import type { TrainSearchRequest } from "@/types/trainType";

export const TRAIN_SEARCH_QUERY_KEY = ["trainSearch"] as const;

/**
 * 열차 조회(페이지 단위) — 조회 버튼으로 확정한 조건을 키로 쓰고, null이면 조회하지 않는다.
 * 좌석·운임은 수시로 바뀌므로 캐시는 재방문 때 먼저 보여 주는 용도로만 쓰고 매번 다시 받는다(staleTime 0).
 * 실패는 바로 알리도록 재시도하지 않는다.
 */
export const useTrainSearch = (request: TrainSearchRequest | null) => {
  return useInfiniteQuery({
    queryKey: [...TRAIN_SEARCH_QUERY_KEY, request],
    queryFn: ({ pageParam, signal }) => {
      if (!request) throw new Error("열차 조회 조건이 없습니다.");
      return searchTrains(request, { page: pageParam, signal });
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) =>
      lastPage.hasNext ? lastPage.currentPage + 1 : undefined,
    enabled: request !== null,
    staleTime: 0,
    retry: false,
  });
};
