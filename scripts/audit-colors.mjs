// @ts-check
/**
 * 하드코딩 색상 감사
 *
 * 시맨틱 토큰(bg-card, text-muted-foreground 등) 대신 Tailwind 팔레트 색을 직접 쓴 곳을 영역별로 집계한다.
 * 다크모드 마이그레이션 진행 확인용 리포트로, 결과와 관계없이 exit 0으로 끝난다.
 *
 * 사용법
 *   pnpm audit:colors                            영역별 요약
 *   pnpm audit:colors --files                    파일별 상세
 *   pnpm audit:colors components/ticket/search   경로 범위 필터 (여러 개 지정 가능)
 *
 * 집계 규칙
 *   - 팔레트 shade(bg-blue-600), white/black(bg-white, bg-black/80), 임의 HEX(bg-[#fff])를 variant 포함해 감지
 *   - dark: 변형 자체와, 같은 줄에 dark: 짝(같은 variant·유틸리티)이 있는 라이트 색은 테마 대응으로 보고 제외
 *   - EXCEPTIONS에 사유와 함께 등록된 예외는 제외하고 따로 표시
 */

import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join, sep } from "node:path";

/** @typedef {"palette" | "mono" | "hex"} Kind */
/** @typedef {Record<Kind, number>} Counts */
/**
 * @typedef {object} Exception
 * @property {string[] | null} files 저장소 루트 기준 경로 (null이면 모든 파일)
 * @property {RegExp} token variant를 포함한 클래스 전체와 비교
 * @property {string} reason
 */
/**
 * @typedef {object} AllowedHit
 * @property {string} file
 * @property {string} token
 * @property {string} reason
 * @property {number} count
 */
/**
 * @typedef {object} FileResult
 * @property {Counts} unresolved
 * @property {number} paired
 * @property {AllowedHit[]} allowed
 */

const SCAN_DIRS = ["app", "components", "constants", "hooks", "lib", "stores"];
const SOURCE_FILE = /\.tsx?$/;
const TEST_FILE = /\.test\.tsx?$/;

/** @type {Kind[]} */
const KINDS = ["palette", "mono", "hex"];
/** @type {Record<Kind, string>} */
const KIND_LABELS = { palette: "팔레트", mono: "white/black", hex: "HEX" };

const UTILITY =
  "bg|text|border(?:-[trblxy])?|divide|outline|ring-offset|ring|from|via|to|fill|stroke|placeholder|decoration|shadow|accent|caret";
const PALETTE =
  "slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose";

// 캡처: 1 variant 접두어, 2 유틸리티, 3 팔레트 shade, 4 white/black, 5 임의 HEX
const COLOR_CLASS = new RegExp(
  String.raw`(?<![\w-])((?:[\w-]*\[[^\]\s]*\]:|[\w-]+:)*)!?(${UTILITY})-` +
    String.raw`(?:((?:${PALETTE})-(?:50|[1-9]00|950))|(white|black)|\[(#[0-9a-fA-F]{3,8})\])` +
    String.raw`(?:\/(?:\d{1,3}|\[[^\]\s]+\]))?(?![\w-])`,
  "g",
);

/** @type {Exception[]} */
const EXCEPTIONS = [
  {
    files: null,
    token: /^bg-black\/\d{1,3}$/,
    reason: "모달·패널 스크림 — 테마와 무관하게 화면을 어둡게 덮음",
  },
  {
    files: ["lib/utils/ticketUtils.ts"],
    token: /^text-white$/,
    reason: "열차 등급 뱃지 — 진한 채움색 위 흰 글자 (채움색은 dark: 페어링)",
  },
  {
    files: ["components/common/LoadingSpinner.tsx"],
    token: /^text-white$/,
    reason: "컬러 버튼 위에 쓰는 스피너 white 변형",
  },
];

/** @param {string} path */
const toPosix = (path) => path.split(sep).join("/");

/** @returns {Counts} */
const emptyCounts = () => ({ palette: 0, mono: 0, hex: 0 });

/** @param {Counts} counts */
const totalOf = (counts) => KINDS.reduce((sum, kind) => sum + counts[kind], 0);

/** @param {string} file 3단계 이상이면 상위 2단계(app/ticket), 아니면 파일 자체 */
const areaOf = (file) => {
  const parts = file.split("/");
  return parts.length > 2 ? parts.slice(0, 2).join("/") : file;
};

/**
 * @param {string} dir 저장소 루트 기준 디렉토리
 * @returns {string[]}
 */
function collectFiles(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return collectFiles(path);
    return SOURCE_FILE.test(entry.name) && !TEST_FILE.test(entry.name) ? [toPosix(path)] : [];
  });
}

/** @param {RegExpMatchArray} match */
const variantsOf = (match) => (match[1] ?? "").split(":").filter(Boolean);

/** @param {RegExpMatchArray} match dark를 뺀 variant와 유틸리티가 같으면 같은 키 */
const pairKeyOf = (match) => [...variantsOf(match).filter((variant) => variant !== "dark"), match[2]].join(":");

/**
 * @param {RegExpMatchArray} match
 * @returns {Kind}
 */
const kindOf = (match) => (match[3] ? "palette" : match[4] ? "mono" : "hex");

/**
 * @param {string} file 저장소 루트 기준 경로
 * @returns {FileResult}
 */
function auditFile(file) {
  /** @type {FileResult} */
  const result = { unresolved: emptyCounts(), paired: 0, allowed: [] };

  for (const line of readFileSync(file, "utf8").split("\n")) {
    const matches = [...line.matchAll(COLOR_CLASS)];
    if (matches.length === 0) continue;

    const darkPairKeys = new Set(matches.filter((match) => variantsOf(match).includes("dark")).map(pairKeyOf));

    for (const match of matches) {
      if (variantsOf(match).includes("dark")) continue;

      if (darkPairKeys.has(pairKeyOf(match))) {
        result.paired += 1;
        continue;
      }

      const token = match[0];
      const exception = EXCEPTIONS.find(
        (candidate) => (candidate.files === null || candidate.files.includes(file)) && candidate.token.test(token),
      );
      if (exception) {
        const hit = result.allowed.find((allowed) => allowed.token === token);
        if (hit) hit.count += 1;
        else result.allowed.push({ file, token, reason: exception.reason, count: 1 });
        continue;
      }

      result.unresolved[kindOf(match)] += 1;
    }
  }

  return result;
}

/** @param {string} text 한글은 터미널에서 2칸 */
const widthOf = (text) => [...text].reduce((width, char) => width + (/[ㄱ-ㆎ가-힣]/.test(char) ? 2 : 1), 0);

/**
 * @param {string} text
 * @param {number} width
 */
const padEnd = (text, width) => text + " ".repeat(Math.max(0, width - widthOf(text)));

/**
 * @param {string} text
 * @param {number} width
 */
const padStart = (text, width) => " ".repeat(Math.max(0, width - widthOf(text))) + text;

/**
 * @param {string} heading 첫 열 제목
 * @param {Array<[string, Counts]>} rows
 */
function printTable(heading, rows) {
  const columns = [...KINDS.map((kind) => KIND_LABELS[kind]), "합계"];
  const columnWidths = columns.map((column) => Math.max(widthOf(column), 5));
  const nameWidth = Math.max(widthOf(heading), ...rows.map(([name]) => widthOf(name)));

  /**
   * @param {string} name
   * @param {string[]} cells
   */
  const format = (name, cells) =>
    [padEnd(name, nameWidth), ...cells.map((cell, index) => padStart(cell, columnWidths[index]))].join("  ");

  /** @param {Counts} counts */
  const cellsOf = (counts) => [...KINDS.map((kind) => String(counts[kind])), String(totalOf(counts))];

  const total = emptyCounts();
  rows.forEach(([, counts]) => KINDS.forEach((kind) => (total[kind] += counts[kind])));

  const header = format(heading, columns);
  console.log(header);
  rows.forEach(([name, counts]) => console.log(format(name, cellsOf(counts))));
  console.log("-".repeat(widthOf(header)));
  console.log(format("합계", cellsOf(total)));
}

function main() {
  const args = process.argv.slice(2);
  const byFile = args.includes("--files");
  const scopes = args
    .filter((arg) => !arg.startsWith("--"))
    .map((arg) => toPosix(arg).replace(/^\.\//, "").replace(/\/$/, ""));

  /** @param {string} file */
  const inScope = (file) =>
    scopes.length === 0 || scopes.some((scope) => file === scope || file.startsWith(`${scope}/`));

  const files = SCAN_DIRS.flatMap(collectFiles).filter(inScope);

  /** @type {Map<string, Counts>} */
  const groups = new Map();
  /** @type {AllowedHit[]} */
  const allowed = [];
  let paired = 0;
  let unresolvedFiles = 0;

  for (const file of files) {
    const result = auditFile(file);
    paired += result.paired;
    allowed.push(...result.allowed);
    if (totalOf(result.unresolved) === 0) continue;

    unresolvedFiles += 1;
    const key = byFile ? file : areaOf(file);
    const counts = groups.get(key) ?? emptyCounts();
    KINDS.forEach((kind) => (counts[kind] += result.unresolved[kind]));
    groups.set(key, counts);
  }

  const rows = [...groups].sort(([nameA, countsA], [nameB, countsB]) => totalOf(countsB) - totalOf(countsA) || nameA.localeCompare(nameB));
  const unresolvedTotal = rows.reduce((sum, [, counts]) => sum + totalOf(counts), 0);
  const allowedTotal = allowed.reduce((sum, hit) => sum + hit.count, 0);

  console.log(`하드코딩 색상 감사 — ${(scopes.length > 0 ? scopes : SCAN_DIRS).join(", ")} (테스트 파일 제외)\n`);

  if (rows.length === 0) console.log("미해결 하드코딩 색상 없음");
  else printTable(byFile ? "파일" : "영역", rows);

  console.log(`\n미해결 ${unresolvedTotal}건 · ${unresolvedFiles}개 파일`);
  console.log(`집계 제외 — dark: 페어링 ${paired}건 · 허용 예외 ${allowedTotal}건`);

  if (allowed.length > 0) {
    console.log("\n허용 예외");
    allowed.forEach((hit) => console.log(`  ${hit.file}  ${hit.token} ×${hit.count}  ${hit.reason}`));
  }
}

main();
