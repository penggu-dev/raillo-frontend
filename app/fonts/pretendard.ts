import localFont from "next/font/local";

/**
 * 본문 글꼴 — Pretendard 표준 글자 세트(KS X 1001) 가변 폰트 한 파일을 자체 호스팅한다(SIL OFL 1.1, LICENSE-Pretendard.txt).
 * 외부 CDN의 static 폰트는 굵기마다 약 750 KB였다. 가변 폰트 하나(284 KB)로 모든 굵기를 쓰고,
 * next/font가 @font-face를 앱 CSS에 넣고 미리 받아(preload) 외부 CSS 요청이 없다.
 * 표준 밖 한글(서버에서 오는 드문 이름 글자 등)은 그 글자만 시스템 글꼴로 보인다.
 */
export const pretendard = localFont({
  src: "./PretendardStdVariable.woff2",
  weight: "45 920",
  display: "swap",
  variable: "--font-pretendard",
});
