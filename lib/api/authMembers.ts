import { api, ApiResponse } from "../api";
import type {
  FindMemberNoRequest,
  FindMemberNoResponse,
  VerifyMemberNoRequest,
  VerifyMemberNoResponse,
  FindPasswordRequest,
  FindPasswordResponse,
  VerifyPasswordRequest,
  VerifyPasswordResponse,
} from "@/types/authType";

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

export const sendEmailVerificationCode = async (
  email: string,
): Promise<ApiResponse<{ message: string }>> => {
  return api.post<{ message: string }>("/auth/members/me/email-code", { email });
};

export const updateEmail = async (
  email: string,
  authCode: string,
): Promise<ApiResponse<{ message: string }>> => {
  return api.put<{ message: string }>("/auth/members/me/email-code", {
    newEmail: email,
    authCode,
  });
};
