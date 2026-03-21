import { api, requireResult } from "../api";
import type {
  MemberNoLoginResult,
  TokenReissueResult,
  SignupRequest,
  SignupResult,
} from "@/types/authType";

export const login = async (data: {
  memberNo: string;
  password: string;
}): Promise<MemberNoLoginResult> => {
  const response = await api.post<MemberNoLoginResult>("/auth/login", data);
  return requireResult(response.result, "로그인에 실패했습니다.");
};

export const logout = async (): Promise<void> => {
  await api.post("/auth/logout");
};

export const reissueToken = async (): Promise<TokenReissueResult> => {
  const response = await api.post<TokenReissueResult>("/auth/reissue");
  return requireResult(response.result, "토큰 재발급에 실패했습니다.");
};

export const signup = async (
  signupData: SignupRequest,
): Promise<SignupResult> => {
  const response = await api.post<SignupResult>("/auth/signup", signupData);
  return requireResult(response.result, "회원가입에 실패했습니다.");
};

export const sendMemberEmailVerification = async (): Promise<{
  email: string;
}> => {
  const response = await api.post<{ email: string }>("/auth/members/emails");
  return requireResult(response.result, "인증코드 발송에 실패했습니다.");
};

export const verifyMemberEmail = async (
  email: string,
  authCode: string,
): Promise<{ isVerified: boolean }> => {
  const response = await api.post<{ isVerified: boolean }>(
    "/auth/emails/verify",
    {
      email,
      authCode,
    },
  );
  return requireResult(response.result, "이메일 인증에 실패했습니다.");
};
