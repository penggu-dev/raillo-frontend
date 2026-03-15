import { api, ApiResponse } from "../api";
import type {
  MemberDetailInfo,
  MemberInfoResponse,
  MemberInfo,
} from "@/types/userType";

// 사용자 관련 API
export const userAPI = {
  // 내 정보 조회
  getMyInfo: async (): Promise<ApiResponse<MemberInfoResponse>> => {
    return api.get<MemberInfoResponse>("/api/v1/members/me");
  },

  // 회원 탈퇴
  deleteAccount: async (): Promise<ApiResponse<{ message: string }>> => {
    return api.delete<{ message: string }>("/api/v1/members");
  },

  // 이메일 변경 인증코드 발송
  sendEmailVerificationCode: async (
    email: string,
  ): Promise<ApiResponse<{ message: string }>> => {
    return api.post<{ message: string }>("/auth/members/me/email-code", {
      email,
    });
  },

  // 이메일 변경 (인증코드 확인 후)
  updateEmail: async (
    email: string,
    authCode: string,
  ): Promise<ApiResponse<{ message: string }>> => {
    return api.put<{ message: string }>("/auth/members/me/email-code", {
      newEmail: email,
      authCode,
    });
  },

  // 비밀번호 변경
  updatePassword: async (
    newPassword: string,
  ): Promise<ApiResponse<{ message: string }>> => {
    return api.put<{ message: string }>("/api/v1/members/password", {
      newPassword,
    });
  },

  // 휴대폰 번호 변경
  updatePhoneNumber: async (
    newPhoneNumber: string,
  ): Promise<ApiResponse<{ message: string }>> => {
    return api.put<{ message: string }>("/api/v1/members/phone-number", {
      newPhoneNumber,
    });
  },

  // 이메일 인증코드 발송
  sendMemberEmailVerification: async (): Promise<
    ApiResponse<{ email: string }>
  > => {
    return api.post<{ email: string }>("/auth/members/emails");
  },

  // 이메일 인증코드 확인
  verifyMemberEmail: async (
    email: string,
    authCode: string,
  ): Promise<ApiResponse<{ isVerified: boolean }>> => {
    return api.post<{ isVerified: boolean }>("/auth/emails/verify", {
      email,
      authCode,
    });
  },
};

// 기존 호환성을 위한 export
export const getMyInfo = userAPI.getMyInfo;
export const deleteAccount = userAPI.deleteAccount;
export const sendEmailVerificationCode = userAPI.sendEmailVerificationCode;
export const updateEmail = userAPI.updateEmail;
export const updatePassword = userAPI.updatePassword;
export const updatePhoneNumber = userAPI.updatePhoneNumber;
export const sendMemberEmailVerification = userAPI.sendMemberEmailVerification;
export const verifyMemberEmail = userAPI.verifyMemberEmail;

// 마이페이지용 회원 정보 조회 함수
export const getMemberInfo = async (): Promise<MemberInfo> => {
  try {
    const response = await userAPI.getMyInfo();
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
  } catch (error) {
    console.error("회원 정보 조회 실패:", error);
    throw error;
  }
};
