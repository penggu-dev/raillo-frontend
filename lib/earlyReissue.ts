/** 토큰 재발급 API 기준 주소 — auth-store와 첫 페인트 전 스크립트가 함께 쓴다 */
export const AUTH_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "/__api";
/** 첫 재발급 경로 — 첫 페인트 전 스크립트가 이 경로로 먼저 보낸다 */
export const REISSUE_PATH = "/auth/reissue";

const EARLY_REISSUE_KEY = "__railloEarlyReissue";

/**
 * 첫 페인트 전에 시작하는 토큰 재발급 (app/layout.tsx에서 인라인 삽입)
 *
 * 회원 화면은 재발급이 끝나야 데이터를 요청하는데, 재발급이 하이드레이션 뒤에 시작하면
 * JS 다운로드·실행 → 재발급 → 데이터가 모두 직렬로 쌓인다. HTML을 읽는 즉시 보내 JS 처리와 겹치게 한다.
 * 세션 쿠키(has_session)가 있을 때만 보내고, 응답은 auth-store의 첫 재발급이 takeEarlyReissue로 넘겨받는다.
 * 넘겨받기 전에 실패해도 처리되지 않은 거부로 보고되지 않게 빈 catch를 붙여 둔다(넘겨받은 쪽은 그대로 실패를 받음).
 */
export const EARLY_REISSUE_SCRIPT = `(function(){try{if(!/(?:^|;\\s*)has_session=1(?:;|$)/.test(document.cookie))return;var p=fetch(${JSON.stringify(AUTH_API_BASE_URL + REISSUE_PATH)},{method:"POST",credentials:"include",headers:{"Content-Type":"application/json"}});p.catch(function(){});window.${EARLY_REISSUE_KEY}=p}catch(e){}})()`;

/** 첫 페인트 전에 시작한 재발급 응답을 한 번만 넘겨준다(없으면 null) */
export const takeEarlyReissue = (): Promise<Response> | null => {
  const holder = window as unknown as Record<string, Promise<Response> | undefined>;
  const early = holder[EARLY_REISSUE_KEY] ?? null;
  delete holder[EARLY_REISSUE_KEY];
  return early;
};
