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

export const login = async (data: {
  memberNo: string;
  password: string;
}): Promise<ApiResponse<MemberNoLoginResult>> => {
  return api.post<MemberNoLoginResult>("/auth/login", data);
};

export const logout = async (): Promise<ApiResponse> => {
  return api.post("/auth/logout");
};

export const reissueToken = async (): Promise<ApiResponse<TokenReissueResult>> => {
  return api.post<TokenReissueResult>("/auth/reissue");
};

export const findMemberNo = async (
  data: FindMemberNoRequest,
): Promise<ApiResponse<FindMemberNoResponse>> => {
  return api.post<FindMemberNoResponse>("/auth/member-no", data);
};

export const verifyMemberNo = async (
  data: VerifyMemberNoRequest,
): Promise<ApiResponse<VerifyMemberNoResponse>> => {
  return api.post<VerifyMemberNoResponse>("/auth/member-no/verify", data);
};

export const findPassword = async (
  data: FindPasswordRequest,
): Promise<ApiResponse<FindPasswordResponse>> => {
  return api.post<FindPasswordResponse>("/auth/password", data);
};

export const verifyPassword = async (
  data: VerifyPasswordRequest,
): Promise<ApiResponse<VerifyPasswordResponse>> => {
  return api.post<VerifyPasswordResponse>("/auth/password/verify", data);
};

export const changePassword = async (
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
};
