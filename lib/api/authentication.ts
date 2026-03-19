import { api, ApiResponse } from "../api";
import type {
  MemberNoLoginResult,
  TokenReissueResult,
  SignupRequest,
  SignupResult,
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

export const signup = async (signupData: SignupRequest): Promise<SignupResult> => {
  const response = await api.post<SignupResult>("/auth/signup", signupData);

  if (response.result) {
    return response.result;
  }

  throw new Error(response.message || "회원가입에 실패했습니다.");
};

export const sendMemberEmailVerification = async (): Promise<
  ApiResponse<{ email: string }>
> => {
  return api.post<{ email: string }>("/auth/members/emails");
};

export const verifyMemberEmail = async (
  email: string,
  authCode: string,
): Promise<ApiResponse<{ isVerified: boolean }>> => {
  return api.post<{ isVerified: boolean }>("/auth/emails/verify", {
    email,
    authCode,
  });
};
