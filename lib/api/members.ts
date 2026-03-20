import { api, requireResult } from "../api";
import type { MemberInfoResponse, MemberInfo } from "@/types/userType";

export const getMyInfo = async (): Promise<MemberInfoResponse> => {
  const response = await api.get<MemberInfoResponse>("/api/v1/members/me");
  return requireResult(response.result, "회원 정보를 찾을 수 없습니다.");
};

export const deleteAccount = async (): Promise<void> => {
  await api.delete("/api/v1/members");
};

export const updatePassword = async (
  newPassword: string,
  temporaryToken?: string,
): Promise<void> => {
  if (temporaryToken) {
    await api.request("/api/v1/members/password", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${temporaryToken}`,
      },
      body: JSON.stringify({ newPassword }),
    });
    return;
  }
  await api.put("/api/v1/members/password", { newPassword });
};

export const updatePhoneNumber = async (
  newPhoneNumber: string,
): Promise<void> => {
  await api.put("/api/v1/members/phone-number", { newPhoneNumber });
};

export const getMemberInfo = async (): Promise<MemberInfo> => {
  const data = await getMyInfo();
  return {
    memberId: data.memberDetailInfo.memberNo,
    name: data.name,
    email: data.memberDetailInfo.email,
    phoneNumber: data.phoneNumber,
    birthDate: data.memberDetailInfo.birthDate,
    gender: data.memberDetailInfo.gender === "M" ? "남성" : "여성",
  };
};
