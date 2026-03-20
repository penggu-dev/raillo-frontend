import { api, ApiResponse } from "../api";
import type {
  MemberInfoResponse,
  MemberInfo,
} from "@/types/userType";

export const getMyInfo = async (): Promise<ApiResponse<MemberInfoResponse>> => {
  return api.get<MemberInfoResponse>("/api/v1/members/me");
};

export const deleteAccount = async (): Promise<ApiResponse<{ message: string }>> => {
  return api.delete<{ message: string }>("/api/v1/members");
};

export const updatePassword = async (
  newPassword: string,
  temporaryToken?: string,
): Promise<ApiResponse<{ message: string }>> => {
  if (temporaryToken) {
    return api.request<{ message: string }>("/api/v1/members/password", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${temporaryToken}`,
      },
      body: JSON.stringify({ newPassword }),
    });
  }
  return api.put<{ message: string }>("/api/v1/members/password", { newPassword });
};

export const updatePhoneNumber = async (
  newPhoneNumber: string,
): Promise<ApiResponse<{ message: string }>> => {
  return api.put<{ message: string }>("/api/v1/members/phone-number", { newPhoneNumber });
};

export const getMemberInfo = async (): Promise<MemberInfo> => {
  const response = await getMyInfo();
  const data = response.result;

  if (!data) {
    throw new Error("회원 정보를 찾을 수 없습니다.");
  }

  const getGradeDisplayName = (membership: string): string => {
    switch (membership) {
      case "FAMILY":
        return "패밀리";
      case "BUSINESS":
        return "비즈니스";
      case "VIP":
        return "VIP";
      case "VVIP":
        return "VVIP";
      default:
        return "일반";
    }
  };

  return {
    memberId: data.memberDetailInfo.memberNo,
    name: data.name,
    email: data.memberDetailInfo.email,
    phoneNumber: data.phoneNumber,
    birthDate: data.memberDetailInfo.birthDate,
    gender: data.memberDetailInfo.gender === "M" ? "남성" : "여성",
    memberGrade: getGradeDisplayName(data.memberDetailInfo.membership),
    mileage: data.memberDetailInfo.totalMileage,
  };
};
