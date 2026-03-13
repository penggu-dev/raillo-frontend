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

export interface SignupResponse {
  message: string;
  result: SignupResult;
}

// ========== 인증된 사용자용 이메일 인증코드 전송 ==========

export interface AuthMemberSendEmailCodeResult {
  email: string;
}

export interface AuthMemberSendEmailCodeResponse {
  message: string;
  result: AuthMemberSendEmailCodeResult;
}

// ========== 로그아웃 ==========

export interface LogoutResponse {
  message: string;
  result: Record<string, never>;
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

export interface MemberNoLoginResponse {
  message: string;
  result: MemberNoLoginResult;
}

// ========== 인증되지 않은 사용자용 이메일 인증코드 전송 ==========

export interface SendEmailCodeRequest {
  email: string;
}

export interface SendEmailCodeResult {
  email: string;
}

export interface SendEmailCodeResponse {
  message: string;
  result: SendEmailCodeResult;
}

// ========== 이메일 인증 코드 검증 ==========

export interface VerifyEmailCodeRequest {
  email: string;
  authCode: string;
}

export interface VerifyEmailCodeResult {
  isVerified: boolean;
}

export interface VerifyEmailCodeResponse {
  message: string;
  result: VerifyEmailCodeResult;
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
