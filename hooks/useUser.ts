import { useQuery } from "@tanstack/react-query";
import { getMemberInfo } from "@/lib/api/user";
import type { MemberInfo } from "@/types/userType";

export const useGetMemberInfo = () => {
  return useQuery<MemberInfo, Error>({
    queryKey: ["memberInfo"],
    queryFn: getMemberInfo,
  });
};
