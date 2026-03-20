import { api, requireResult } from "../api";
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
): Promise<FindMemberNoResponse> => {
  const response = await api.post<FindMemberNoResponse>(
    "/auth/member-no",
    data,
  );
  return requireResult(response.result, "회원번호 찾기에 실패했습니다.");
};

export const verifyMemberNo = async (
  data: VerifyMemberNoRequest,
): Promise<VerifyMemberNoResponse> => {
  const response = await api.post<VerifyMemberNoResponse>(
    "/auth/member-no/verify",
    data,
  );
  return requireResult(response.result, "회원번호 인증에 실패했습니다.");
};

export const findPassword = async (
  data: FindPasswordRequest,
): Promise<FindPasswordResponse> => {
  const response = await api.post<FindPasswordResponse>("/auth/password", data);
  return requireResult(response.result, "비밀번호 찾기에 실패했습니다.");
};

export const verifyPassword = async (
  data: VerifyPasswordRequest,
): Promise<VerifyPasswordResponse> => {
  const response = await api.post<VerifyPasswordResponse>(
    "/auth/password/verify",
    data,
  );
  return requireResult(response.result, "비밀번호 인증에 실패했습니다.");
};

export const sendEmailVerificationCode = async (
  email: string,
): Promise<{ email: string }> => {
  const response = await api.post<{ email: string }>(
    "/auth/members/me/email-code",
    { email },
  );
  return requireResult(response.result, "인증코드 발송에 실패했습니다.");
};

export const updateEmail = async (
  email: string,
  authCode: string,
): Promise<void> => {
  await api.put("/auth/members/me/email-code", {
    newEmail: email,
    authCode,
  });
};
