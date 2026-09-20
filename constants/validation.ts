export const PASSWORD_MIN_LENGTH = 8; // 비밀번호 최소 길이
export const AUTH_CODE_LENGTH = 6; // 이메일 인증 코드 자리 수

// 회원정보 변경 전 이메일 인증의 유효 시간 — 지나면 변경 단계를 닫고 다시 인증받는다
export const VERIFICATION_TTL_MS = 5 * 60 * 1000;

export const SEARCH_HISTORY_MAX = 3; // 검색 기록 최대 저장 개수
