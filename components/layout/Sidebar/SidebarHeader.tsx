import { XIcon } from "lucide-react";
import { Drawer as DrawerPrimitive } from "vaul";
import { Button } from "@/components/ui/button";
import { DrawerClose } from "@/components/ui/drawer";

const SidebarHeader = () => {
  return (
    <div className="bg-primary text-primary-foreground px-5 flex items-center justify-between w-full h-[72px]">
      {/* 사이드바의 접근 가능한 이름 — 공용 DrawerTitle의 기본 글꼴(text-lg 등)이 heading-h4를 덮지 않도록 원시 Title 사용 */}
      <DrawerPrimitive.Title className="heading-h4">카테고리</DrawerPrimitive.Title>
      <DrawerClose asChild>
        <Button
          size="icon"
          aria-label="메뉴 닫기"
          className="text-primary-foreground hover:bg-primary-active [&_svg]:size-6"
        >
          <XIcon />
        </Button>
      </DrawerClose>
    </div>
  );
};

export default SidebarHeader;
