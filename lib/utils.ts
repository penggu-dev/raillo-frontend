import { clsx, type ClassValue } from "clsx"
import { extendTailwindMerge } from "tailwind-merge"

// tailwind.config.ts의 elevation 토큰(shadow-elev-*)을 shadow 그룹으로 등록해
// 컴포넌트 기본 shadow(shadow-sm 등)를 className으로 넘긴 elevation이 대체하도록 한다.
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      shadow: [{ shadow: ["elev-sm", "elev-md", "elev-lg"] }],
    },
  },
})

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}
