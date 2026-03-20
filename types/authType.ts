// ========== 회원가입 ==========

export interface SignupRequest {
  name: string;
  phoneNumber: string;
  password: string;
  email: string;
  birthDate: string;
  gender: "M" | "F";
}

export interface SignupResult {
  memberNo: string;
}

// ========== 회원번호 로그인 ==========

export interface MemberNoLoginRequest {
  memberNo: string;
  password: string;
}

export interface MemberNoLoginResult {
  grantType: string;
  accessToken: string;
  accessTokenExpiresIn: number;
}

// ========== 회원번호 찾기 ==========

export interface FindMemberNoRequest {
  name: string;
  phoneNumber: string;
}

export interface FindMemberNoResponse {
  email: string;
}

export interface VerifyMemberNoRequest {
  email: string;
  authCode: string;
}

export interface VerifyMemberNoResponse {
  memberNo: string;
}

// ========== 비밀번호 찾기 ==========

export interface FindPasswordRequest {
  name: string;
  memberNo: string;
}

export interface FindPasswordResponse {
  email: string;
}

export interface VerifyPasswordRequest {
  email: string;
  authCode: string;
}

export interface VerifyPasswordResponse {
  temporaryToken: string;
}

export interface ChangePasswordRequest {
  newPassword: string;
}

// ========== 토큰 재발급 ==========

export interface TokenReissueResult {
  grantType: string;
  accessToken: string;
  accessTokenExpiresIn: number;
}

export interface TokenReissueResponse {
  message: string;
  result: TokenReissueResult;
}
