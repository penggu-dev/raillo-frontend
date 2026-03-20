import { useQuery } from "@tanstack/react-query";
import { getMemberInfo } from "@/lib/api/members";
import type { MemberInfo } from "@/types/userType";

export const useGetMemberInfo = () => {
  return useQuery<MemberInfo, Error>({
    queryKey: ["memberInfo"],
    queryFn: getMemberInfo,
  });
};
