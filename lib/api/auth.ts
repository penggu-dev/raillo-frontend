import { api, ApiResponse } from "../api";
import type {
  MemberNoLoginResult,
  TokenReissueResult,
  FindMemberNoRequest,
  FindMemberNoResponse,
  VerifyMemberNoRequest,
  VerifyMemberNoResponse,
  FindPasswordRequest,
  FindPasswordResponse,
  VerifyPasswordRequest,
  VerifyPasswordResponse,
  ChangePasswordRequest,
} from "@/types/authType";

// 인증 관련 API
export const authAPI = {
  // 로그인
  login: async (data: {
    memberNo: string;
    password: string;
  }): Promise<ApiResponse<MemberNoLoginResult>> => {
    return api.post<MemberNoLoginResult>("/auth/login", data);
  },

  // 로그아웃
  logout: async (): Promise<ApiResponse> => {
    return api.post("/auth/logout");
  },

  // 토큰 갱신
  reissueToken: async (): Promise<ApiResponse<TokenReissueResult>> => {
    return api.post<TokenReissueResult>("/auth/reissue");
  },

  // 회원번호 찾기 (이메일 인증 코드 전송)
  findMemberNo: async (
    data: FindMemberNoRequest,
  ): Promise<ApiResponse<FindMemberNoResponse>> => {
    return api.post<FindMemberNoResponse>("/auth/member-no", data);
  },

  // 회원번호 찾기 인증 코드 검증
  verifyMemberNo: async (
    data: VerifyMemberNoRequest,
  ): Promise<ApiResponse<VerifyMemberNoResponse>> => {
    return api.post<VerifyMemberNoResponse>("/auth/member-no/verify", data);
  },

  // 비밀번호 찾기 (이메일 인증 코드 전송)
  findPassword: async (
    data: FindPasswordRequest,
  ): Promise<ApiResponse<FindPasswordResponse>> => {
    return api.post<FindPasswordResponse>("/auth/password", data);
  },

  // 비밀번호 찾기 인증 코드 검증
  verifyPassword: async (
    data: VerifyPasswordRequest,
  ): Promise<ApiResponse<VerifyPasswordResponse>> => {
    return api.post<VerifyPasswordResponse>("/auth/password/verify", data);
  },

  // 비밀번호 변경 (임시 토큰 사용)
  changePassword: async (
    requestData: ChangePasswordRequest,
    temporaryToken: string,
  ): Promise<ApiResponse> => {
    return api.request("/members/password", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${temporaryToken}`,
      },
      body: JSON.stringify(requestData),
    });
  },
};

// 기존 호환성을 위한 export
export const login = authAPI.login;
export const logout = authAPI.logout;
