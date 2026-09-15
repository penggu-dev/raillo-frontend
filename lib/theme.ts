/** 테마 설정 저장 키 */
export const THEME_STORAGE_KEY = "raillo-theme";
/** 운영체제 다크 모드 미디어 쿼리 */
export const DARK_THEME_QUERY = "(prefers-color-scheme: dark)";

/**
 * 첫 페인트 전에 실행하는 테마 적용 스크립트 (app/layout.tsx에서 인라인 삽입)
 *
 * stores/theme-store.ts와 같은 규칙: 저장값 dark, 또는 light·dark가 아닌 값(없음·system)이면서 운영체제가 다크 모드면 dark.
 * 저장소 읽기는 따로 감싸, localStorage 접근이 막혀도(쿠키·사이트 데이터 차단 등) 스토어처럼 운영체제 설정을 따른다.
 */
export const THEME_INIT_SCRIPT = `(function(){var t=null;try{t=localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)})}catch(e){}try{if(t==='dark'||(t!=='light'&&window.matchMedia(${JSON.stringify(DARK_THEME_QUERY)}).matches)){document.documentElement.classList.add('dark')}}catch(e){}})()`;
