import { clsx, type ClassValue } from "clsx"
import { extendTailwindMerge } from "tailwind-merge"

// tailwind.config.ts의 커스텀 토큰을 tailwind-merge 그룹에 등록해, 컴포넌트 기본 클래스를
// className으로 넘긴 값이 대체하도록 한다. (등록하지 않으면 둘 다 남고, 생성 CSS에서 커스텀 클래스가
// 기본 스케일보다 뒤에 놓여 덮어쓰기가 무시될 수 있다)
// - elevation(shadow-elev-*) ↔ shadow-sm 등
// - radius(rounded-control·rounded-card) ↔ rounded-full 등
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      shadow: [{ shadow: ["elev-sm", "elev-md", "elev-lg"] }],
      rounded: [{ rounded: ["control", "card"] }],
    },
  },
})

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}
