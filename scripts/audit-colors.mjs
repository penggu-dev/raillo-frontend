// @ts-check
/**
 * 하드코딩 색상 감사
 *
 * 시맨틱 토큰(bg-card, text-muted-foreground 등) 대신 Tailwind 팔레트 색을 직접 쓴 곳을 영역별로 집계한다.
 * 기본은 리포트로 결과와 관계없이 exit 0, --max를 주면 허용 건수 초과 시 실패한다(PR 검사는 --max 0).
 *
 * 사용법
 *   pnpm audit:colors                            영역별 요약
 *   pnpm audit:colors --files                    파일별 상세
 *   pnpm audit:colors components/ticket/search   경로 범위 필터 (여러 개 지정 가능)
 *   pnpm audit:colors --max 0                    미해결이 0건을 넘으면 exit 1 (--max=0도 가능)
 *
 * 종료 코드: 0 통과(또는 리포트) · 1 --max 초과 · 2 잘못된 옵션
 *
 * 집계 규칙
 *   - 팔레트 shade(bg-blue-600), white/black(bg-white, bg-black/80), 임의 HEX(bg-[#fff])를 variant 포함해 감지
 *   - dark: 변형 자체와, 같은 줄에 dark: 짝(같은 variant·유틸리티)이 있는 라이트 색은 테마 대응으로 보고 제외
 *   - EXCEPTIONS에 사유와 함께 등록된 예외는 제외하고 따로 표시
 *   - 테스트 코드(*.test.ts(x), *.spec.ts(x), __tests__/ 하위)는 집계하지 않음
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
const TEST_FILE = /\.(test|spec)\.tsx?$/;
const TEST_DIR = "__tests__";

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
    if (entry.isDirectory()) return entry.name === TEST_DIR ? [] : collectFiles(path);
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

const USAGE = "사용법: pnpm audit:colors [--files] [--max <0 이상 정수>] [경로 ...]";

/**
 * --files·--max 옵션과 경로 범위를 분리한다. --max 값("--max 0"의 "0")이 경로로 해석되지 않도록 함께 소비
 * @param {string[]} args
 * @returns {{ byFile: boolean, max: number | null, scopes: string[] } | { error: string }}
 */
function parseArgs(args) {
  let byFile = false;
  /** @type {number | null} */
  let max = null;
  /** @type {string[]} */
  const scopes = [];

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === "--") {
      // pnpm audit:colors -- --files 처럼 넘어온 구분자는 무시
      continue;
    } else if (arg === "--files") {
      byFile = true;
    } else if (arg === "--max" || arg.startsWith("--max=")) {
      const value = arg === "--max" ? args[(index += 1)] : arg.slice("--max=".length);
      const parsedMax = Number(value);
      // 너무 큰 수는 정밀도를 잃거나 Infinity가 되어 게이트가 사실상 꺼지므로 안전한 정수만 허용
      if (value === undefined || !/^\d+$/.test(value) || !Number.isSafeInteger(parsedMax)) {
        return { error: `--max 값이 올바르지 않음: ${value ?? "(없음)"}` };
      }
      max = parsedMax;
    } else if (arg.startsWith("-")) {
      // -max 같은 오타가 경로로 해석돼 게이트가 조용히 통과하지 않도록 하이픈으로 시작하는 인자는 모두 거부
      // (검사 경로는 app·components 등이라 하이픈으로 시작하는 경로는 없음)
      return { error: `알 수 없는 옵션: ${arg}` };
    } else {
      scopes.push(toPosix(arg).replace(/^\.\//, "").replace(/\/$/, ""));
    }
  }

  return { byFile, max, scopes };
}

function main() {
  const parsed = parseArgs(process.argv.slice(2));
  if ("error" in parsed) {
    console.error(`${parsed.error}\n${USAGE}`);
    process.exit(2);
  }
  const { byFile, max, scopes } = parsed;

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

  console.log(`하드코딩 색상 감사 — ${(scopes.length > 0 ? scopes : SCAN_DIRS).join(", ")} (테스트 코드 제외)\n`);

  if (rows.length === 0) console.log("미해결 하드코딩 색상 없음");
  else printTable(byFile ? "파일" : "영역", rows);

  console.log(`\n미해결 ${unresolvedTotal}건 · ${unresolvedFiles}개 파일`);
  console.log(`집계 제외 — dark: 페어링 ${paired}건 · 허용 예외 ${allowedTotal}건`);

  if (allowed.length > 0) {
    console.log("\n허용 예외");
    allowed.forEach((hit) => console.log(`  ${hit.file}  ${hit.token} ×${hit.count}  ${hit.reason}`));
  }

  if (max === null) return;
  if (unresolvedTotal > max) {
    const hint = byFile ? "" : " (파일별 위치: pnpm audit:colors --files)";
    console.error(`\n✗ 미해결 ${unresolvedTotal}건이 허용 ${max}건을 넘음 — 시맨틱 토큰으로 바꾸거나, 도메인 색이면 같은 줄에 dark: 짝을 추가하세요${hint}`);
    process.exitCode = 1;
    return;
  }
  console.log(`\n✓ 미해결 ${unresolvedTotal}건 (허용 ${max}건 이하)`);
}

main();
