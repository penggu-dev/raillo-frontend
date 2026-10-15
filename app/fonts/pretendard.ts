import localFont from "next/font/local";

/**
 * 본문 글꼴 — Pretendard 표준 글자 세트(KS X 1001) 가변 폰트 한 파일을 자체 호스팅한다(SIL OFL 1.1, LICENSE-Pretendard.txt).
 * 외부 CDN의 static 폰트는 굵기마다 약 750 KB였다. 가변 폰트 하나(284 KB)로 모든 굵기를 쓰고,
 * next/font가 @font-face를 앱 CSS에 넣어 외부 CSS 요청이 없다.
 * 미리 받지(preload) 않는다 — 느린 회선에서 285 KB가 우선순위 높게 먼저 받아지면 화면 JS 요청이 밀려
 * 검색 화면 모바일 LCP가 약 0.5초 늘었다(#244). 글꼴은 그만큼 늦게 바뀌고(swap) 그동안 대체 글꼴로 보인다.
 * 표준 밖 한글(서버에서 오는 드문 이름 글자 등)은 그 글자만 시스템 글꼴로 보인다.
 */
export const pretendard = localFont({
  src: "./PretendardStdVariable.woff2",
  weight: "45 920",
  display: "swap",
  preload: false,
  variable: "--font-pretendard",
});
