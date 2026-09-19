import { defineConfig } from "vitest/config"
import react from "@vitejs/plugin-react"
import path from "path"

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text-summary", "json-summary", "html"],
      reportsDirectory: "./coverage",
      // 테스트가 없는 파일도 분모에 포함한다 — 테스트, shadcn 생성 컴포넌트(components/ui), 타입 전용 types는 제외
      // (types는 include에도 없지만 제외 범위를 설정에서 바로 알 수 있도록 명시)
      include: [
        "app/**/*.{ts,tsx}",
        "components/**/*.{ts,tsx}",
        "hooks/**/*.{ts,tsx}",
        "lib/**/*.{ts,tsx}",
        "stores/**/*.{ts,tsx}",
        "constants/**/*.{ts,tsx}",
      ],
      exclude: ["**/*.test.{ts,tsx}", "components/ui/**", "types/**"],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
})
