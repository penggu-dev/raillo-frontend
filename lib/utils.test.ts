import { describe, it, expect } from "vitest"
import { cn } from "./utils"

describe("cn", () => {
  it("나중에 전달한 elevation 클래스가 컴포넌트 기본 shadow를 대체한다", () => {
    expect(cn("rounded-lg border shadow-sm", "shadow-elev-lg")).toBe("rounded-lg border shadow-elev-lg")
  })

  it("elevation 클래스끼리는 나중에 전달한 값만 남는다", () => {
    expect(cn("shadow-elev-sm", "shadow-elev-md")).toBe("shadow-elev-md")
  })

  it("hover 변형 elevation은 기본 상태 클래스와 함께 유지된다", () => {
    expect(cn("shadow-sm", "shadow-elev-sm hover:shadow-elev-md")).toBe("shadow-elev-sm hover:shadow-elev-md")
  })

  it("elevation을 넘기지 않으면 기본 shadow를 그대로 둔다", () => {
    expect(cn("shadow-sm", "p-4")).toBe("shadow-sm p-4")
  })

  it("나중에 전달한 radius 클래스가 컴포넌트 기본 radius 토큰을 대체한다", () => {
    expect(cn("rounded-control border", "rounded-full")).toBe("border rounded-full")
    expect(cn("rounded-card", "rounded-none")).toBe("rounded-none")
  })

  it("radius 토큰끼리·기본 스케일과도 나중에 전달한 값만 남는다", () => {
    expect(cn("rounded-md", "rounded-control")).toBe("rounded-control")
    expect(cn("rounded-control", "rounded-card")).toBe("rounded-card")
  })

  it("반응형 변형 radius는 기본 상태 radius와 함께 유지된다", () => {
    expect(cn("rounded-control", "sm:rounded-card")).toBe("rounded-control sm:rounded-card")
  })

  it("조건부 클래스와 함께 사용할 수 있다", () => {
    const isHidden: boolean = false
    expect(cn("p-2", isHidden && "hidden", "shadow-elev-sm")).toBe("p-2 shadow-elev-sm")
  })
})
