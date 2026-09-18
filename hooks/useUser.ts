import { useQuery } from "@tanstack/react-query";
import { getMemberInfo } from "@/lib/api/members";
import type { MemberInfo } from "@/types/userType";

interface UseGetMemberInfoOptions {
  /** 인증 확인이 끝나기 전 조회를 막을 때 false (기본값 true) */
  enabled?: boolean;
}

export const useGetMemberInfo = ({ enabled = true }: UseGetMemberInfoOptions = {}) => {
  return useQuery<MemberInfo, Error>({
    queryKey: ["memberInfo"],
    queryFn: getMemberInfo,
    enabled,
  });
};
